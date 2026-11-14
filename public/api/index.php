<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');
ini_set('display_errors','0');
$private = getenv('VIRA_PRIVATE_DIR') ?: dirname(__DIR__, 2).'/vira-private';
if (!is_file($private.'/config.php') || !is_file($private.'/lib.php')) {
    http_response_code(503); echo json_encode(['error'=>'اتصال سرور هنوز تنظیم نشده است']); exit;
}
require $private.'/lib.php';
try {
    $config = require $private.'/config.php';
    requireThat(str_starts_with($config['site_url'], 'https://'), 'تنظیم HTTPS الزامی است', 503);
    $db = new PDO($config['db']['dsn'], $config['db']['user'], $config['db']['password'], [PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_EMULATE_PREPARES=>false]);
    $gateway = new Gateway($config); $panel = new Panel($config);
    session_name('vira_session');
    session_start(['use_strict_mode'=>1,'cookie_httponly'=>1,'cookie_secure'=>1,'cookie_samesite'=>'Lax','cookie_path'=>parse_url($config['site_url'],PHP_URL_PATH) ?: '/']);
    $_SESSION['csrf'] ??= bin2hex(random_bytes(32));
    $action = $_GET['action'] ?? 'bootstrap';
    $method = $_SERVER['REQUEST_METHOD'];
    if ($method === 'POST') {
        requireThat(hash_equals($_SESSION['csrf'], $_SERVER['HTTP_X_CSRF_TOKEN'] ?? ''), 'نشست منقضی شده؛ صفحه را تازه کنید', 403);
        requireThat((int)($_SERVER['CONTENT_LENGTH'] ?? 0) <= 16384, 'درخواست بیش از حد بزرگ است', 413);
        $body = json_decode(file_get_contents('php://input'), true, 32, JSON_THROW_ON_ERROR);
        requireThat(is_array($body), 'درخواست نامعتبر');
    } else { requireThat($method === 'GET', 'روش مجاز نیست',405); $body = []; }
    $user = isset($_SESSION['uid']) ? one($db,'SELECT id,name,email,role FROM users WHERE id=? AND active=1',[$_SESSION['uid']]) : null;
    if ($action === 'bootstrap') {
        $out = ['csrf'=>$_SESSION['csrf'],'user'=>$user,'registration'=>(bool)$config['registration'],'plans'=>query($db,'SELECT id,name,price_toman,volume_gb,days,devices FROM plans WHERE active=1 AND inbound_id>0')->fetchAll(PDO::FETCH_ASSOC)];
    } elseif (in_array($action,['login','register'],true)) {
        requireThat($method === 'POST','روش مجاز نیست',405);
        rateLimit($db, 'auth:'.($_SERVER['REMOTE_ADDR'] ?? ''), 15, 900);
        $email = strtolower(trim((string)($body['email'] ?? ''))); $password = (string)($body['password'] ?? '');
        requireThat(strlen($email)<=190 && filter_var($email,FILTER_VALIDATE_EMAIL)!==false && strlen($password)>=12 && strlen($password)<=128, 'ایمیل معتبر و رمز ۱۲ تا ۱۲۸ کاراکتری وارد کنید');
        if ($action === 'register') {
            requireThat((bool)$config['registration'],'ثبت‌نام غیرفعال است',403);
            $name = trim((string)($body['name'] ?? '')); requireThat($name!=='' && mb_strlen($name)<=100,'نام نامعتبر است');
            try { query($db,'INSERT INTO users (name,email,password_hash) VALUES (?,?,?)',[$name,$email,password_hash($password,PASSWORD_DEFAULT)]); }
            catch (PDOException $e) { if ($e->getCode()==='23000') throw new ApiError(409,'ثبت‌نام با این مشخصات ممکن نیست'); throw $e; }
        }
        $u = one($db,'SELECT * FROM users WHERE email=? AND active=1',[$email]);
        $hash = $u['password_hash'] ?? '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.';
        requireThat(password_verify($password,$hash) && $u!==null,'ایمیل یا رمز اشتباه است',401);
        session_regenerate_id(true); $_SESSION['uid']=(int)$u['id']; $_SESSION['csrf']=bin2hex(random_bytes(32)); $out=['ok'=>true];
    } elseif ($action === 'callback') {
        // Never trust Status=OK; verification is performed on the server for the stored amount.
        $authority = (string)($_GET['Authority'] ?? '');
        $o = one($db,'SELECT id FROM orders WHERE authority=?',[$authority]);
        if ($o && ($_GET['Status'] ?? '')==='OK') {
            try { verifyOrder($db,$gateway,(int)$o['id']); provision($db,$panel,(int)$o['id']); }
            catch (Throwable $e) { error_log('Vira callback order '.(int)$o['id'].' pending'); }
        }
        header('Location: '.$config['site_url'].'/#panel'); exit;
    } else {
        requireThat($user!==null,'ابتدا وارد حساب شوید',401);
        if ($action==='logout' && $method==='POST') {
            $_SESSION=[]; session_destroy(); $out=['ok'=>true];
        } elseif ($action==='dashboard') {
            $services=query($db,'SELECT id,plan_id,client_email,sub_id,total_bytes,expiry_ms,status FROM services WHERE user_id=? ORDER BY id DESC',[$user['id']])->fetchAll(PDO::FETCH_ASSOC);
            foreach ($services as &$s) { $s['subscription_url']=rtrim($config['subscription_url'],'/').'/'.$s['sub_id']; unset($s['sub_id'],$s['client_email']); } unset($s);
            $out=['services'=>$services,'orders'=>query($db,'SELECT id,amount_rial,status,ref_id,created_at,service_id FROM orders WHERE user_id=? ORDER BY id DESC LIMIT 100',[$user['id']])->fetchAll(PDO::FETCH_ASSOC)];
        } elseif ($action==='traffic') {
            rateLimit($db,'traffic:'.$user['id'],60,60);
            $s=one($db,'SELECT client_email FROM services WHERE id=? AND user_id=? AND status=\'active\'',[(int)($_GET['id']??0),$user['id']]);
            requireThat($s!==null,'سرویس یافت نشد',404); $t=$panel->traffic($s['client_email']);
            $out=['up'=>(int)($t['up']??0),'down'=>(int)($t['down']??0),'total'=>(int)($t['total']??0),'expiryTime'=>(int)($t['expiryTime']??0)];
        } elseif ($action==='checkout' && $method==='POST') {
            rateLimit($db,'checkout:'.$user['id'],20,600);
            $key=(string)($body['key']??''); requireThat((bool)preg_match('/^[a-zA-Z0-9-]{16,80}$/D',$key),'شناسه درخواست نامعتبر');
            $out=locked($db,'checkout:'.$user['id'],function()use($db,$user,$body,$key,$gateway){
                $o=one($db,'SELECT * FROM orders WHERE user_id=? AND request_key=?',[$user['id'],$key]);
                if (!$o) {
                    $p=one($db,'SELECT * FROM plans WHERE id=? AND active=1 AND inbound_id>0',[(int)($body['plan_id']??0)]); requireThat($p!==null,'پلن در دسترس نیست');
                    $months=(int)($body['months']??1); $amount=priceRial((int)$p['price_toman'],$months);
                    $renew=(int)($body['renewal_service_id']??0);
                    if ($renew) {
                        $s=one($db,"SELECT * FROM services WHERE id=? AND user_id=? AND status='active'",[$renew,$user['id']]);
                        requireThat($s!==null && (int)$s['inbound_id']===(int)$p['inbound_id'],'سرویس یا پلن تمدید نامعتبر است');
                        requireThat(!one($db,"SELECT id FROM orders WHERE renewal_service_id=? AND status IN ('requesting','pending','paid')",[$renew]),'تمدید دیگری در انتظار پردازش است',409);
                    }
                    query($db,'INSERT INTO orders (user_id,plan_id,renewal_service_id,request_key,months,amount_rial,quota_bytes,duration_days,devices,inbound_id) VALUES (?,?,?,?,?,?,?,?,?,?)',[$user['id'],$p['id'],$renew?:null,$key,$months,$amount,(int)$p['volume_gb']*$months*1073741824,(int)$p['days']*$months,$p['devices'],$p['inbound_id']]);
                    $o=one($db,'SELECT * FROM orders WHERE id=?',[$db->lastInsertId()]);
                    // An ambiguous request is not automatically reissued; reconcile with gateway first.
                    $authority=$gateway->request($amount,(int)$o['id']);
                    query($db,"UPDATE orders SET authority=?,status='pending' WHERE id=?",[$authority,$o['id']]); $o['authority']=$authority;
                }
                requireThat(!empty($o['authority']) && in_array($o['status'],['requesting','pending'],true),'این سفارش نیازمند بررسی مدیر است',409);
                return ['url'=>'https://www.zarinpal.com/pg/StartPay/'.$o['authority'],'order_id'=>$o['id']];
            });
        } elseif ($action==='retry' && $method==='POST') {
            rateLimit($db,'retry:'.$user['id'],15,300);
            $o=one($db,'SELECT id FROM orders WHERE id=? AND user_id=?',[(int)($body['id']??0),$user['id']]); requireThat($o!==null,'سفارش یافت نشد',404);
            verifyOrder($db,$gateway,(int)$o['id']); provision($db,$panel,(int)$o['id']); $out=['ok'=>true];
        } elseif ($action==='tickets') {
            $admin=$user['role']==='admin';
            if ($method==='POST') {
                rateLimit($db,'ticket:'.$user['id'],20,3600);
                $text=trim((string)($body['body']??'')); requireThat($text!=='' && mb_strlen($text)<=4000,'متن باید بین ۱ تا ۴۰۰۰ کاراکتر باشد');
                $tid=(int)($body['ticket_id']??0);
                if ($tid) requireThat(one($db,'SELECT id FROM tickets WHERE id=?'.($admin?'':' AND user_id=?'),$admin?[$tid]:[$tid,$user['id']])!==null,'تیکت یافت نشد',404);
                else { $title=trim((string)($body['title']??'')); requireThat($title!=='' && mb_strlen($title)<=160,'عنوان نامعتبر'); query($db,'INSERT INTO tickets (user_id,title) VALUES (?,?)',[$user['id'],$title]); $tid=(int)$db->lastInsertId(); }
                query($db,'INSERT INTO messages (ticket_id,user_id,body) VALUES (?,?,?)',[$tid,$user['id'],$text]);
            }
            $out=['tickets'=>query($db,'SELECT * FROM tickets'.($admin?'':' WHERE user_id=?').' ORDER BY id DESC LIMIT 100',$admin?[]:[$user['id']])->fetchAll(PDO::FETCH_ASSOC), 'messages'=>query($db,'SELECT m.*,u.name FROM messages m JOIN tickets t ON t.id=m.ticket_id JOIN users u ON u.id=m.user_id'.($admin?'':' WHERE t.user_id=?').' ORDER BY m.id DESC LIMIT 300',$admin?[]:[$user['id']])->fetchAll(PDO::FETCH_ASSOC)];
        } elseif (str_starts_with($action,'admin')) {
            requireThat($user['role']==='admin','دسترسی مجاز نیست',403);
            if ($action==='admin-plan' && $method==='POST') {
                $name=trim((string)($body['name']??'')); $price=(int)($body['price_toman']??0); $gb=(int)($body['volume_gb']??0); $days=(int)($body['days']??30); $devices=(int)($body['devices']??2); $inbound=(int)($body['inbound_id']??0);
                requireThat($name!=='' && mb_strlen($name)<=80 && $price>=1000 && $price<=100000000 && $gb>0 && $gb<=100000 && $days>0 && $days<=366 && $devices>=0 && $devices<=100 && $inbound>0,'مقادیر پلن نامعتبر است');
                $args=[$name,$price,$gb,$days,$devices,$inbound,(int)!empty($body['active'])];
                if (!empty($body['id'])) { $args[]=(int)$body['id']; query($db,'UPDATE plans SET name=?,price_toman=?,volume_gb=?,days=?,devices=?,inbound_id=?,active=? WHERE id=?',$args); }
                else query($db,'INSERT INTO plans (name,price_toman,volume_gb,days,devices,inbound_id,active) VALUES (?,?,?,?,?,?,?)',$args);
                $out=['ok'=>true];
            } elseif ($action==='admin-retry' && $method==='POST') {
                $id=(int)($body['id']??0); verifyOrder($db,$gateway,$id); provision($db,$panel,$id); $out=['ok'=>true];
            } elseif ($action==='admin') {
                $out=['users'=>query($db,'SELECT id,name,email,role,active,created_at FROM users ORDER BY id DESC LIMIT 200')->fetchAll(PDO::FETCH_ASSOC), 'orders'=>query($db,'SELECT id,user_id,amount_rial,status,ref_id,created_at FROM orders ORDER BY id DESC LIMIT 200')->fetchAll(PDO::FETCH_ASSOC), 'plans'=>query($db,'SELECT * FROM plans')->fetchAll(PDO::FETCH_ASSOC), 'services'=>query($db,'SELECT id,user_id,plan_id,status,total_bytes,expiry_ms FROM services ORDER BY id DESC LIMIT 200')->fetchAll(PDO::FETCH_ASSOC)];
            } else throw new ApiError(404,'مسیر یافت نشد');
        } else throw new ApiError(404,'مسیر یافت نشد');
    }
    echo json_encode($out,JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR);
} catch (ApiError $e) { http_response_code($e->status); echo json_encode(['error'=>$e->getMessage()],JSON_UNESCAPED_UNICODE); }
catch (Throwable $e) { error_log('Vira API failure: '.get_class($e)); http_response_code(503); echo json_encode(['error'=>'پردازش کامل نشد؛ وضعیت سفارش را دوباره بررسی کنید یا به پشتیبانی اطلاع دهید'],JSON_UNESCAPED_UNICODE); }

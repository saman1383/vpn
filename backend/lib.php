<?php
declare(strict_types=1);

final class ApiError extends RuntimeException {
    public function __construct(public int $status, string $message) { parent::__construct($message); }
}
function requireThat(bool $ok, string $message, int $status = 400): void {
    if (!$ok) throw new ApiError($status, $message);
}
function query(PDO $db, string $sql, array $args = []): PDOStatement {
    $q = $db->prepare($sql); $q->execute($args); return $q;
}
function one(PDO $db, string $sql, array $args = []): ?array {
    return query($db, $sql, $args)->fetch(PDO::FETCH_ASSOC) ?: null;
}
function priceRial(int $toman, int $months): int {
    requireThat(in_array($months, [1, 3], true), 'دوره نامعتبر است');
    return $months === 3 ? intdiv($toman * 3 * 85, 100) * 10 : $toman * 10;
}
function uuid(): string {
    $h = bin2hex(random_bytes(16));
    return substr($h,0,8).'-'.substr($h,8,4).'-4'.substr($h,13,3).'-'.dechex((hexdec($h[16]) & 3) | 8).substr($h,17,3).'-'.substr($h,20);
}
function httpJson(string $url, ?array $body = null, array $headers = []): array {
    requireThat(str_starts_with($url, 'https://'), 'نشانی اتصال باید HTTPS باشد', 503);
    $ch = curl_init($url);
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_TIMEOUT => 40, CURLOPT_FOLLOWLOCATION => false, CURLOPT_PROTOCOLS => CURLPROTO_HTTPS,
        CURLOPT_HTTPHEADER => array_merge(['Accept: application/json', 'Content-Type: application/json'], $headers)]);
    if ($body !== null) curl_setopt_array($ch, [CURLOPT_POST => true, CURLOPT_POSTFIELDS => json_encode($body, JSON_THROW_ON_ERROR)]);
    $raw = curl_exec($ch); $code = curl_getinfo($ch, CURLINFO_HTTP_CODE); curl_close($ch);
    if ($raw === false || $code < 200 || $code >= 300) throw new RuntimeException('upstream_http');
    $data = json_decode($raw, true, 64, JSON_THROW_ON_ERROR);
    if (!is_array($data)) throw new RuntimeException('upstream_json');
    return $data;
}
class Gateway {
    public function __construct(private array $config) {}
    public function request(int $amount, int $id): string {
        $r = httpJson('https://api.zarinpal.com/pg/v4/payment/request.json', [
            'merchant_id' => $this->config['merchant_id'], 'amount' => $amount,
            'callback_url' => $this->config['site_url'].'/api/index.php?action=callback',
            'description' => 'Vira order #'.$id, 'currency' => 'IRR']);
        $d = $r['data'] ?? [];
        if (($d['code'] ?? 0) !== 100 || !preg_match('/^A[0-9A-Za-z]{35}$/D', $d['authority'] ?? '')) throw new RuntimeException('gateway_request');
        return $d['authority'];
    }
    public function verify(int $amount, string $authority): array {
        $r = httpJson('https://api.zarinpal.com/pg/v4/payment/verify.json', [
            'merchant_id' => $this->config['merchant_id'], 'amount' => $amount, 'authority' => $authority]);
        return $r['data'] ?? [];
    }
}
class Panel {
    public function __construct(private array $config) {}
    public function call(string $path, ?array $body = null): mixed {
        $r = httpJson(rtrim($this->config['panel_url'], '/').'/panel/api/'.$path, $body,
            ['Authorization: Bearer '.$this->config['panel_token']]);
        if (($r['success'] ?? false) !== true) throw new RuntimeException('panel_rejected');
        return $r['obj'] ?? [];
    }
    public function get(string $email): array { return $this->call('clients/get/'.rawurlencode($email)); }
    public function traffic(string $email): array { return $this->call('clients/traffic/'.rawurlencode($email)); }
    public function apply(array $target, bool $create): void {
        if ($create) $this->call('clients/add', ['client' => $target['client'], 'inboundIds' => [$target['inbound']]]);
        else $this->call('clients/update/'.rawurlencode($target['client']['email']), $target['client']);
    }
}
// MySQL advisory locks span transactions and upstream calls; PHP termination releases them.
function locked(PDO $db, string $key, callable $fn): mixed {
    requireThat((int)query($db, 'SELECT GET_LOCK(?, 0)', ['vira:'.$key])->fetchColumn() === 1, 'در حال پردازش؛ دوباره تلاش کنید', 409);
    try { return $fn(); } finally { query($db, 'SELECT RELEASE_LOCK(?)', ['vira:'.$key]); }
}
function rateLimit(PDO $db, string $key, int $max, int $seconds): void {
    $bucket = hash('sha256', $key); $now = time();
    query($db, 'INSERT INTO rate_limits (bucket,hits,reset_at) VALUES (?,1,?) ON DUPLICATE KEY UPDATE hits=IF(reset_at<=?,1,hits+1),reset_at=IF(reset_at<=?,VALUES(reset_at),reset_at)', [$bucket,$now+$seconds,$now,$now]);
    $row = one($db, 'SELECT hits FROM rate_limits WHERE bucket=?', [$bucket]);
    requireThat((int)$row['hits'] <= $max, 'تعداد درخواست زیاد است؛ کمی بعد تلاش کنید', 429);
}
function verifyOrder(PDO $db, Gateway $gateway, int $id): void {
    locked($db, 'order:'.$id, function () use ($db,$gateway,$id) {
        $o = one($db, 'SELECT * FROM orders WHERE id=?', [$id]);
        requireThat($o !== null && !empty($o['authority']), 'سفارش قابل تأیید نیست');
        if (in_array($o['status'], ['paid','fulfilled'], true)) return;
        requireThat((int)$o['verify_after'] <= time(), 'کمی بعد دوباره بررسی کنید', 429);
        query($db, 'UPDATE orders SET verify_after=? WHERE id=?', [time()+30,$id]);
        $d = $gateway->verify((int)$o['amount_rial'], $o['authority']);
        requireThat(in_array($d['code'] ?? 0, [100,101], true) && !empty($d['ref_id']), 'پرداخت هنوز توسط درگاه تأیید نشده است', 409);
        query($db, "UPDATE orders SET status='paid',ref_id=?,paid_at=CURRENT_TIMESTAMP,last_error=NULL WHERE id=?", [(string)$d['ref_id'],$id]);
    });
}
function provision(PDO $db, Panel $panel, int $id): void {
    locked($db, 'order:'.$id, function () use ($db,$panel,$id) {
        $o = one($db, 'SELECT * FROM orders WHERE id=?', [$id]);
        if ($o['status'] === 'fulfilled') return;
        requireThat($o['status'] === 'paid', 'پرداخت تأیید نشده است', 409);
        // Per-user lock serializes purchases and renewals, including different orders on one service.
        locked($db, 'user:'.$o['user_id'], function () use ($db,$panel,$id,$o) {
            // Never allow a later renewal to overtake an unresolved paid order.
            requireThat(!one($db, "SELECT id FROM orders WHERE user_id=? AND status='paid' AND id<? LIMIT 1", [$o['user_id'],$id]), 'ابتدا سفارش پرداخت‌شده قبلی را پردازش کنید', 409);
            $target = $o['target_json'] ? json_decode($o['target_json'], true, 64, JSON_THROW_ON_ERROR) : null;
            $create = empty($o['renewal_service_id']);
            if (!$target) {
                if ($create) {
                    $email = 'vira_order_'.$id; $uuid = uuid(); $sub = bin2hex(random_bytes(16));
                    $target = ['inbound' => (int)$o['inbound_id'], 'client' => [
                        'email'=>$email, 'id'=>$uuid, 'subId'=>$sub, 'enable'=>true,
                        'totalGB'=>(int)$o['quota_bytes'], 'expiryTime'=>(time()+(int)$o['duration_days']*86400)*1000,
                        'limitIp'=>(int)$o['devices'], 'tgId'=>0, 'flow'=>'', 'comment'=>'Vira order '.$id]];
                    $db->beginTransaction();
                    try {
                        query($db, 'INSERT INTO services (user_id,plan_id,inbound_id,client_email,client_uuid,sub_id) VALUES (?,?,?,?,?,?)', [$o['user_id'],$o['plan_id'],$o['inbound_id'],$email,$uuid,$sub]);
                        $sid = (int)$db->lastInsertId();
                        query($db, 'UPDATE orders SET service_id=?,target_json=? WHERE id=?', [$sid,json_encode($target,JSON_THROW_ON_ERROR),$id]);
                        $db->commit();
                    } catch (Throwable $e) { $db->rollBack(); throw $e; }
                } else {
                    $s = one($db, 'SELECT * FROM services WHERE id=? AND user_id=?', [$o['renewal_service_id'],$o['user_id']]);
                    requireThat($s !== null, 'سرویس یافت نشد', 404);
                    $remote = $panel->get($s['client_email']); $c = $remote['client'];
                    requireThat(($c['subId'] ?? '') === $s['sub_id'] && in_array((int)$s['inbound_id'], $remote['inboundIds'] ?? [], true), 'هویت سرویس در پنل مطابقت ندارد', 409);
                    requireThat((int)$c['totalGB'] > 0 && (int)$c['expiryTime'] > 0, 'تمدید سرویس نامحدود پشتیبانی نمی‌شود', 409);
                    // Preserve all protocol fields, map the record UUID to the wire client id.
                    $c['id'] = $c['uuid']; unset($c['uuid'],$c['createdAt'],$c['updatedAt']);
                    $c['totalGB'] = (int)$c['totalGB'] + (int)$o['quota_bytes'];
                    $c['expiryTime'] = max(time()*1000,(int)$c['expiryTime'])+(int)$o['duration_days']*86400000;
                    $c['enable'] = true;
                    $target = ['inbound'=>(int)$s['inbound_id'], 'client'=>$c]; $sid = (int)$s['id'];
                    query($db, 'UPDATE orders SET service_id=?,target_json=? WHERE id=?', [$sid,json_encode($target,JSON_THROW_ON_ERROR),$id]);
                }
            } else $sid = (int)$o['service_id'];
            // A retry writes the exact persisted absolute target, never adds quota twice.
            $panel->apply($target, $create);
            $actual = $panel->get($target['client']['email']); $c = $actual['client'] ?? [];
            requireThat(($c['subId'] ?? '') === $target['client']['subId'] && (int)($c['totalGB'] ?? -1) === $target['client']['totalGB'] && (int)($c['expiryTime'] ?? -1) === $target['client']['expiryTime'] && in_array($target['inbound'],$actual['inboundIds'] ?? [],true), 'اعمال سرویس نیازمند بررسی مجدد است', 409);
            $db->beginTransaction();
            try {
                query($db, "UPDATE services SET total_bytes=?,expiry_ms=?,status='active' WHERE id=?", [$c['totalGB'],$c['expiryTime'],$sid]);
                query($db, "UPDATE orders SET status='fulfilled',last_error=NULL WHERE id=?", [$id]);
                $db->commit();
            } catch (Throwable $e) { $db->rollBack(); throw $e; }
        });
    });
}

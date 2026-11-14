<?php
declare(strict_types=1);
require __DIR__.'/../backend/lib.php';
function check(bool $ok, string $label): void { if (!$ok) throw new RuntimeException($label); echo "PASS $label\n"; }
check(priceRial(129000,1)===1290000,'monthly price converted to rial');
check(priceRial(129000,3)===3289500,'quarter discount uses server integer pricing');
try { priceRial(1,2); throw new RuntimeException('bad period allowed'); } catch (ApiError $e) { check($e->status===400,'invalid period rejected'); }
check((bool)preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/D',uuid()),'valid client UUID');
$db=new PDO('sqlite::memory:',null,null,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);
$db->sqliteCreateFunction('GET_LOCK',fn()=>1,2); $db->sqliteCreateFunction('RELEASE_LOCK',fn()=>1,1);
$db->exec('CREATE TABLE services (id INTEGER PRIMARY KEY AUTOINCREMENT,user_id INTEGER,plan_id INTEGER,inbound_id INTEGER,client_email TEXT,client_uuid TEXT,sub_id TEXT,total_bytes INTEGER,expiry_ms INTEGER,status TEXT); CREATE TABLE orders (id INTEGER PRIMARY KEY,user_id INTEGER,plan_id INTEGER,service_id INTEGER,renewal_service_id INTEGER,inbound_id INTEGER,status TEXT,quota_bytes INTEGER,duration_days INTEGER,devices INTEGER,target_json TEXT,last_error TEXT,authority TEXT,amount_rial INTEGER,verify_after INTEGER DEFAULT 0,ref_id TEXT UNIQUE,paid_at TEXT)');
class FakePanel extends Panel {
    public array $clients=[]; public int $applies=0; public bool $failAfterWrite=false;
    public function __construct() {}
    public function apply(array $target,bool $create): void {
        $this->applies++; $c=$target['client']; $c['uuid']=$c['id']; $c['id']=10;
        $this->clients[$c['email']]=['client'=>$c,'inboundIds'=>[$target['inbound']]];
        if ($this->failAfterWrite) throw new RuntimeException('connection lost after write');
    }
    public function get(string $email): array { return $this->clients[$email]; }
}
class FakeGateway extends Gateway {
    public int $calls=0; public array $result=['code'=>100,'ref_id'=>9988];
    public function __construct() {}
    public function verify(int $amount,string $authority): array { $this->calls++; check($amount===1290000,'verify uses stored amount'); return $this->result; }
}
$panel=new FakePanel; $gateway=new FakeGateway;
$db->exec("INSERT INTO orders (id,user_id,plan_id,inbound_id,status,quota_bytes,duration_days,devices,authority,amount_rial) VALUES (1,1,1,7,'pending',1073741824,30,2,'A_test',1290000)");
try { provision($db,$panel,1); throw new RuntimeException('unpaid provisioned'); } catch(ApiError $e) { check($panel->applies===0,'unpaid order cannot provision'); }
verifyOrder($db,$gateway,1); verifyOrder($db,$gateway,1); check($gateway->calls===1,'repeated callback not reverified after paid');
$panel->failAfterWrite=true;
try { provision($db,$panel,1); } catch(RuntimeException $e) {}
$o=one($db,'SELECT * FROM orders WHERE id=1'); check($o['status']==='paid' && $o['target_json']!==null,'ambiguous panel write retains paid order and durable target');
$target=json_decode($o['target_json'],true); $panel->failAfterWrite=false;
provision($db,$panel,1); provision($db,$panel,1);
check(count($panel->clients)===1 && (int)query($db,'SELECT COUNT(*) FROM services')->fetchColumn()===1,'create retry does not create second service');
check($panel->applies===2,'fulfilled order is a no-op');
$s=one($db,'SELECT * FROM services');
query($db,"INSERT INTO orders (id,user_id,plan_id,inbound_id,status,quota_bytes,duration_days,devices,renewal_service_id) VALUES (2,1,1,7,'paid',1073741824,30,2,?)",[$s['id']]);
$panel->failAfterWrite=true; try { provision($db,$panel,2); } catch(RuntimeException $e) {}
$panel->failAfterWrite=false; provision($db,$panel,2); provision($db,$panel,2);
$s2=one($db,'SELECT * FROM services');
check((int)$s2['total_bytes']===2147483648,'renewal retry adds quota exactly once');
check((int)$s2['expiry_ms']===$target['client']['expiryTime']+30*86400000,'renewal retry adds duration exactly once');
$gateway->result=['code'=>-21];
$db->exec("INSERT INTO orders (id,user_id,status,authority,amount_rial) VALUES (3,1,'pending','A_fake',1290000)");
try { verifyOrder($db,$gateway,3); throw new RuntimeException('invalid payment accepted'); } catch(ApiError $e) { check(one($db,'SELECT status FROM orders WHERE id=3')['status']==='pending','failed verification never marks order paid'); }
echo "Backend tests passed (SQLite + fake upstreams; not MySQL/live integration).\n";

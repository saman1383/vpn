<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require __DIR__.'/lib.php';
$config = require __DIR__.'/config.php';
$db = new PDO($config['db']['dsn'],$config['db']['user'],$config['db']['password'],[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_EMULATE_PREPARES=>false]);
$cmd = $argv[1] ?? '';
if ($cmd === 'install') {
    $db->exec(file_get_contents(__DIR__.'/schema.sql'));
    echo "Schema installed. Register your account, then run: php console.php admin your@email.com\n";
} elseif ($cmd === 'admin') {
    $email = strtolower(trim($argv[2] ?? ''));
    $u = one($db,'SELECT id FROM users WHERE email=?',[$email]);
    if (!$u) { fwrite(STDERR,"Account not found; register first.\n"); exit(1); }
    query($db,"UPDATE users SET role='admin' WHERE id=?",[$u['id']]); echo "Admin role granted. Sign out and sign in again.\n";
} elseif ($cmd === 'retry') {
    $rows = query($db,"SELECT id FROM orders WHERE status='paid' ORDER BY id LIMIT 20")->fetchAll(PDO::FETCH_ASSOC);
    foreach ($rows as $row) {
        try { provision($db,new Panel($config),(int)$row['id']); echo $row['id']." fulfilled\n"; }
        catch (Throwable $e) { fwrite(STDERR,$row['id']." pending; inspect panel and retry\n"); }
    }
    query($db,'DELETE FROM rate_limits WHERE reset_at < ?', [time()-86400]);
} else { echo "Commands: install | admin email | retry\n"; exit(1); }

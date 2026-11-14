<?php
// Copy to /home/CPANEL_USER/vira-private/config.php, never public_html.
return [
    'site_url' => 'https://vpn.example.com', // no trailing slash; subdirectory allowed
    'db' => ['dsn' => 'mysql:host=localhost;dbname=CPANEL_vira;charset=utf8mb4', 'user' => 'CPANEL_vira', 'password' => 'CHANGE_ME'],
    'merchant_id' => 'CHANGE_ME',
    // 3x-ui v3.11.0 API; full panel URL including secret base path, no /panel/api suffix.
    'panel_url' => 'https://panel.example.com/SECRET_BASE',
    'panel_token' => 'CHANGE_ME', // API token with client read/create/update permissions
    'subscription_url' => 'https://sub.example.com/sub',
    'registration' => true,
];

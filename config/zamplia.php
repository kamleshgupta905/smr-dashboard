<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Zamplia Supply API Configuration
    |--------------------------------------------------------------------------
    |
    | Credentials, base URLs, and options for interacting with Zamplia's
    | Supply API v2 marketplace.
    |
    */

    'use_sandbox' => env('ZAMPLIA_USE_SANDBOX', false),

    'production' => [
        'base_url' => env('ZAMPLIA_BASE_URL', 'https://surveysupply.zamplia.com/api/v1'),
        'api_key'  => env('ZAMPLIA_API_KEY', 'RCgqJ2hfoVZdwgPkwGnjMwTIi0CSKQ2u'),
    ],

    'sandbox' => [
        'base_url' => env('ZAMPLIA_SANDBOX_BASE_URL', 'https://surveysupplysandbox.zamplia.com/api/v1'),
        'api_key'  => env('ZAMPLIA_SANDBOX_API_KEY', 's5YnczOM9ahIKuSdwzKvPyTlBUvBLfqG'),
    ],

    // Active base URL and API Key based on sandbox mode
    'active_base_url' => env('ZAMPLIA_USE_SANDBOX', false)
        ? env('ZAMPLIA_SANDBOX_BASE_URL', 'https://surveysupplysandbox.zamplia.com/api/v1')
        : env('ZAMPLIA_BASE_URL', 'https://surveysupply.zamplia.com/api/v1'),

    'active_api_key' => env('ZAMPLIA_USE_SANDBOX', false)
        ? env('ZAMPLIA_SANDBOX_API_KEY', 's5YnczOM9ahIKuSdwzKvPyTlBUvBLfqG')
        : env('ZAMPLIA_API_KEY', 'RCgqJ2hfoVZdwgPkwGnjMwTIi0CSKQ2u'),

    // Security & HMAC signature secret
    'hmac_secret' => env('ZAMPLIA_HMAC_SECRET', ''),

    // HTTP Client Options
    'timeout' => env('ZAMPLIA_TIMEOUT', 30),
    'cache_ttl' => env('ZAMPLIA_CACHE_TTL', 300), // 5 minutes in seconds
];

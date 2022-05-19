<?php

return [
    // Payments
    'freeform/payment-webhooks/stripe' => 'freeform/pro/payments/payment-webhooks/stripe',
    'freeform/payment-subscription/<id:\d+>/cancel/<validationKey:[0-9a-zA-Z]+>' => 'freeform/pro/payments/subscriptions/cancel',
    'freeform/plugin.js' => 'freeform/resources/plugin-js',
    'freeform/plugin.css' => 'freeform/resources/plugin-css',
    'freeform/files' => 'freeform/file-upload/get',
    'freeform/files/upload' => 'freeform/file-upload/post',
    'freeform/files/delete' => 'freeform/file-upload/delete',
    'freeform/submit' => 'freeform/submit',
];

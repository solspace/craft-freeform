<?php

return [
    // Payments
    'freeform/payment-webhooks/stripe' => 'freeform/payment-webhooks/stripe',
    'freeform/payment-subscription/<id:\d+>/cancel/<validationKey:[0-9a-zA-Z]+>' => 'freeform/subscriptions/cancel',
    'freeform/plugin.js' => 'freeform/resources/plugin-js',
    'freeform/plugin.css' => 'freeform/resources/plugin-css',
];

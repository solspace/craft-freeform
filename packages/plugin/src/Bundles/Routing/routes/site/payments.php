<?php

return [
    'freeform/payment-webhooks/stripe' => 'freeform/pro/payments/webhooks/stripe',
    'freeform/payment-subscription/<id:\d+>/cancel/<validationKey:[0-9a-zA-Z]+>' => 'freeform/pro/payments/subscriptions/cancel',
];

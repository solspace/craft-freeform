<?php

return [
    'freeform/settings/payment-gateways' => 'freeform/payments/gateways/index',
    'freeform/settings/payment-gateways/new' => 'freeform/payments/gateways/create',
    'freeform/settings/payment-gateways/<id:\d+>' => 'freeform/payments/gateways/edit',
    'freeform/settings/payment-gateways/<id:[a-zA-Z0-9\-_]+>' => 'freeform/payments/gateways/edit',
    'freeform/payment_gateway/check' => 'freeform/payments/gateways/check-integration-connection',
    'freeform/payment-gateway/authenticate/<handle:[a-zA-Z0-9\-_]+>' => 'freeform/payments/gateways/force-authorization',
];

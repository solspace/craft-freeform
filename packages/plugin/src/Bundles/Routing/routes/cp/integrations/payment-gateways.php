<?php

return [
    'freeform/settings/payment-gateways' => 'freeform/integrations/payments/gateways/index',
    'freeform/settings/payment-gateways/new' => 'freeform/integrations/payments/gateways/create',
    'freeform/settings/payment-gateways/<id:\d+>' => 'freeform/integrations/payments/gateways/edit',
    'freeform/settings/payment-gateways/<id:[a-zA-Z0-9\-_]+>' => 'freeform/integrations/payments/gateways/edit',
    'freeform/payment_gateway/check' => 'freeform/integrations/payments/gateways/check-integration-connection',
    'freeform/payment-gateway/authenticate/<handle:[a-zA-Z0-9\-_]+>' => 'freeform/integrations/payments/gateways/force-authorization',
];

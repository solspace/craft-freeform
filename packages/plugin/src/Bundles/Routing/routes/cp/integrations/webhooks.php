<?php

return [
    'freeform/settings/webhooks' => 'freeform/integrations/webhooks/index',
    'freeform/settings/webhooks/new' => 'freeform/integrations/webhooks/create',
    'freeform/settings/webhooks/<id:\d+>' => 'freeform/integrations/webhooks/edit',
    'freeform/settings/webhooks/<id:[a-zA-Z0-9\-_]+>' => 'freeform/integrations/webhooks/edit',
];

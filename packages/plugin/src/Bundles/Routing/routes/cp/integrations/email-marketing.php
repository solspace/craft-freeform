<?php

return [
    'freeform/settings/email-marketing' => 'freeform/integrations/email-marketing/index',
    'freeform/settings/email-marketing/new' => 'freeform/integrations/email-marketing/create',
    'freeform/settings/email-marketing/<id:\d+>' => 'freeform/integrations/email-marketing/edit',
    'freeform/settings/email-marketing/<id:[a-zA-Z0-9\-_]+>' => 'freeform/integrations/email-marketing/edit',
    'freeform/email-marketing/authenticate/<handle:[a-zA-Z0-9\-_]+>' => 'freeform/integrations/email-marketing/force-authorization',
    'freeform/email-marketing/check' => 'freeform/integrations/email-marketing/check-integration-connection',

    'freeform/api/integrations/email-marketing/lists' => 'freeform/api/integrations/email-marketing/lists',
    'freeform/api/integrations/email-marketing/fields/<category:[a-zA-Z0-9_\-]+>' => 'freeform/api/integrations/email-marketing/fields',
];

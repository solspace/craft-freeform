<?php

return [
    'freeform/settings/integrations/single' => 'freeform/integrations/single/index',
    'freeform/settings/integrations/single/<handle:[a-zA-Z0-9\-_]+>' => 'freeform/integrations/single/index',

    'freeform/settings/integrations/<type:[a-zA-Z\-]+>' => 'freeform/integrations/integrations/index',
    'freeform/settings/integrations/<type:[a-zA-Z\-]+>/new' => 'freeform/integrations/integrations/create',
    'freeform/settings/integrations/<type:[a-zA-Z\-]+>/<id:\d+>' => 'freeform/integrations/integrations/edit',
    'freeform/settings/integrations/<type:[a-zA-Z\-]+>/<id:[a-zA-Z0-9\-_]+>' => 'freeform/integrations/integrations/edit',

    'freeform/integrations/check' => 'freeform/integrations/integrations/check-integration-connection',
    'freeform/integrations/authenticate/<id:\d+>' => 'freeform/integrations/integrations/force-authorization',
];

<?php

return [
    'freeform/integrations' => 'freeform/app',
    'freeform/integrations/<type:[a-zA-Z\-]+>' => 'freeform/app',
    'freeform/integrations/<type:[a-zA-Z\-]+>/<class:[a-zA-Z0-9]+>' => 'freeform/app',
    'freeform/integrations/<type:[a-zA-Z\-]+>/<class:[a-zA-Z0-9]+>/new' => 'freeform/app',
    'freeform/integrations/<type:[a-zA-Z\-]+>/<class:[a-zA-Z0-9]+>/<id:\d+>' => 'freeform/app',

    'freeform/settings/integrations/single' => 'freeform/integrations/single/index',
    'freeform/settings/integrations/single/<handle:[a-zA-Z0-9\-_]+>' => 'freeform/integrations/single/index',

    'freeform/settings/integrations/<type:[a-zA-Z\-]+>' => 'freeform/integrations/integrations/index',
    'freeform/settings/integrations/<type:[a-zA-Z\-]+>/new' => 'freeform/integrations/integrations/create',
    'freeform/settings/integrations/<type:[a-zA-Z\-]+>/<id:\d+>' => 'freeform/integrations/integrations/edit',
    'freeform/settings/integrations/<type:[a-zA-Z\-]+>/<id:[a-zA-Z0-9\-_]+>' => 'freeform/integrations/integrations/edit',

    'freeform/integrations/<id:\d+>/authorize' => 'freeform/integrations/integrations/authorize',
];

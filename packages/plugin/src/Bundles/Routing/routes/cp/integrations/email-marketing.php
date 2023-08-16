<?php

return [
    'freeform/settings/mailing-lists' => 'freeform/integrations/mailing-lists/index',
    'freeform/settings/mailing-lists/new' => 'freeform/integrations/mailing-lists/create',
    'freeform/settings/mailing-lists/<id:\d+>' => 'freeform/integrations/mailing-lists/edit',
    'freeform/settings/mailing-lists/<id:[a-zA-Z0-9\-_]+>' => 'freeform/integrations/mailing-lists/edit',
    'freeform/mailing-lists/authenticate/<handle:[a-zA-Z0-9\-_]+>' => 'freeform/integrations/mailing-lists/force-authorization',
    'freeform/mailing-lists/check' => 'freeform/integrations/mailing-lists/check-integration-connection',

    'freeform/api/integrations/mailing-lists/lists' => 'freeform/api/integrations/mailing-lists/lists',
    'freeform/api/integrations/mailing-lists/fields/<category:[a-zA-Z0-9_\-]+>' => 'freeform/api/integrations/mailing-lists/fields',
];

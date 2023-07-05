<?php

return [
    'freeform/settings/crm' => 'freeform/integrations/crm/index',
    'freeform/settings/crm/new' => 'freeform/integrations/crm/create',
    'freeform/settings/crm/<id:\d+>' => 'freeform/integrations/crm/edit',
    'freeform/settings/crm/<id:[a-zA-Z0-9\-_]+>' => 'freeform/integrations/crm/edit',
    'freeform/crm/check' => 'freeform/integrations/crm/check-integration-connection',
    'freeform/crm/authenticate/<handle:[a-zA-Z0-9_]+>' => 'freeform/integrations/crm/force-authorization',
];

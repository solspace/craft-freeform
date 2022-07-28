<?php

return [
    'freeform/settings/crm' => 'freeform/crm/index',
    'freeform/settings/crm/new' => 'freeform/crm/create',
    'freeform/settings/crm/<id:\d+>' => 'freeform/crm/edit',
    'freeform/settings/crm/<id:[a-zA-Z0-9\-_]+>' => 'freeform/crm/edit',
    'freeform/crm/check' => 'freeform/crm/check-integration-connection',
    'freeform/crm/authenticate/<handle:[a-zA-Z0-9_]+>' => 'freeform/crm/force-authorization',
];

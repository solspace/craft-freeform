<?php

// Client API

return [
    'freeform/client/api/fields/favorites' => 'freeform/client/api/fields/favorites',
    'freeform/client/api/fields/types' => 'freeform/client/api/fields/types',
    'freeform/client/api/fields/types/sections' => 'freeform/client/api/fields/types/sections',
    'freeform/client/api/forms' => 'freeform/client/api/forms',
    'freeform/client/api/forms/settings' => 'freeform/client/api/forms/settings/index',
    'freeform/client/api/forms/<id:\d+>' => 'freeform/client/api/forms',
    'freeform/client/api/forms/<formId:\d+>/layout' => 'freeform/client/api/forms/layout/get',
    'freeform/client/api/forms/<formId:\d+>/fields' => 'freeform/client/api/forms/fields/get',
    'freeform/client/api/forms/<formId:\d+>/fields/<id:\d+>' => 'freeform/client/api/forms/fields/get-one',
    'freeform/client/api/forms/<formId:\d+>/integrations' => 'freeform/client/api/forms/integrations/get',
    'freeform/client/api/forms/<formId:\d+>/integrations/<id:\d+>' => 'freeform/client/api/forms/integrations/get-one',
    'freeform/client/api/forms/<formId:\d+>/notifications' => 'freeform/client/api/forms/notifications/get',
    'freeform/client/api/integrations' => 'freeform/client/api/integrations',
    'freeform/client/api/integrations/<id:\d+>' => 'freeform/client/api/integrations',
    'freeform/client/api/notification-types' => 'freeform/client/api/notifications/get-types',
    'freeform/client' => 'freeform/client/view',
    'freeform/client/<id:.*>' => 'freeform/client/view',
];

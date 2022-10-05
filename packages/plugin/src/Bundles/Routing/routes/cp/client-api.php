<?php

// Client API

return [
    'freeform/client/api/fields/types' => 'freeform/client/api/fields/types',
    'freeform/client/api/forms' => 'freeform/client/api/forms',
    'freeform/client/api/forms/<id:\d+>' => 'freeform/client/api/forms',
    'freeform/client/api/forms/<formId:\d+>/fields' => 'freeform/client/api/forms/fields/get',
    'freeform/client/api/forms/<formId:\d+>/fields/<id:\d+>' => 'freeform/client/api/forms/fields/get-one',
    'freeform/client/api/forms/<formId:\d+>/integrations' => 'freeform/client/api/forms/integrations/get',
    'freeform/client/api/forms/<formId:\d+>/integrations/<id:\d+>' => 'freeform/client/api/forms/integrations/get-one',

    'freeform/client/api/integrations' => 'freeform/client/api/integrations',
    'freeform/client/api/integrations/<id:\d+>' => 'freeform/client/api/integrations',

    'freeform/client' => 'freeform/client/view',
    'freeform/client/<id:.*>' => 'freeform/client/view',
];

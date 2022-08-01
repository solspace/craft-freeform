<?php

// Client API

return [
    'freeform/client/api/fields/types' => 'freeform/client/api/fields/types',
    'freeform/client/api/forms' => 'freeform/client/api/forms',
    'freeform/client/api/forms/<id:\d+>' => 'freeform/client/api/forms',
    'freeform/client/api/forms/<formId:\d+>/integrations' => 'freeform/client/api/forms/integrations/get',
    'freeform/client/api/forms/<formId:\d+>/integrations/<id:\d+>' => 'freeform/client/api/forms/integrations/get-one',

    'freeform/client' => 'freeform/client/view',
    'freeform/client/<id:.*>' => 'freeform/client/view',
];

<?php

// Client API

return [
    'freeform/client/api/fields/types' => 'freeform/client/api/field-types',
    'freeform/client/api/forms' => 'freeform/client/api/forms',
    'freeform/client/api/forms/<id:[a-zA-Z0-9\-_]+>' => 'freeform/client/api/forms',
    'freeform/client/api/integrations' => 'freeform/client/api/integrations',
    'freeform/client/api/integrations/<id:[a-zA-Z0-9\-_]+>' => 'freeform/client/api/integrations',

    'freeform/client' => 'freeform/client/view',
    'freeform/client/<id:.*>' => 'freeform/client/view',
];

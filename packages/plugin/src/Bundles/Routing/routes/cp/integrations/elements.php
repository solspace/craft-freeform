<?php

return [
    'freeform/settings/elements' => 'freeform/integrations/elements/index',
    'freeform/settings/elements/new' => 'freeform/integrations/elements/create',
    'freeform/settings/elements/<id:\d+>' => 'freeform/integrations/elements/edit',
    'freeform/settings/elements/<id:[a-zA-Z0-9\-_]+>' => 'freeform/integrations/elements/edit',

    'freeform/api/elements/entries/attributes' => 'freeform/api/elements/entry/attributes',
    'freeform/api/elements/entries/custom-fields' => 'freeform/api/elements/entry/custom-fields',
    'freeform/api/elements/users/attributes' => 'freeform/api/elements/user/attributes',
    'freeform/api/elements/users/fields' => 'freeform/api/elements/user/fields',
];

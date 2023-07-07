<?php

return [
    'freeform/settings/elements' => 'freeform/integrations/elements/index',
    'freeform/settings/elements/new' => 'freeform/integrations/elements/create',
    'freeform/settings/elements/<id:\d+>' => 'freeform/integrations/elements/edit',
    'freeform/settings/elements/<id:[a-zA-Z0-9\-_]+>' => 'freeform/integrations/elements/edit',

    'freeform/api/elements/entries/attributes' => 'freeform/api/elements/entry/attributes',
    'freeform/api/elements/entries/fields' => 'freeform/api/elements/entry/fields',
];

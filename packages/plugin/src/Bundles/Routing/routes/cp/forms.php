<?php

return [
    // Client
    'freeform' => 'freeform/settings/default-view',

    'freeform/forms/duplicate' => 'freeform/forms/duplicate',
    'freeform/forms/reset-spam-counter' => 'freeform/forms/reset-spam-counter',
    'freeform/forms/delete' => 'freeform/forms/delete',

    'freeform/forms' => 'freeform/app',
    'freeform/forms/<id:.*>' => 'freeform/app',
];

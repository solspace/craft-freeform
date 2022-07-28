<?php

return [
    // quick export
    'freeform/export/export-dialogue' => 'freeform/export/quick-export/export-dialogue',
    'freeform/export' => 'freeform/export/quick-export/index',

    // Export Profiles
    'freeform/export/profiles' => 'freeform/export/profiles/index',
    'freeform/export/profiles/delete' => 'freeform/export/profiles/delete',
    'freeform/export/profiles/new/<formHandle:[0-9a-zA-Z_\-]+>' => 'freeform/export/profiles/create',
    'freeform/export/profiles/<id:\d+>' => 'freeform/export/profiles/edit',

    // Export Notifications
    'freeform/export/notifications' => 'freeform/export/notifications/index',
    'freeform/export/notifications/delete' => 'freeform/export/notifications/delete',
    'freeform/export/notifications/new' => 'freeform/export/notifications/create',
    'freeform/export/notifications/<id:\d+>' => 'freeform/export/notifications/edit',
];

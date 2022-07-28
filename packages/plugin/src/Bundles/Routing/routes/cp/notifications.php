<?php

return [
    // Files
    'freeform/notifications' => 'freeform/notifications/files/redirect-to-nav',
    'freeform/notifications/files' => 'freeform/notifications/files',
    'freeform/notifications/files/new' => 'freeform/notifications/files/create',
    'freeform/notifications/files/save' => 'freeform/notifications/files/save',
    'freeform/notifications/files/delete' => 'freeform/notifications/files/delete',
    'freeform/notifications/files/duplicate' => 'freeform/notifications/files/duplicate',
    'freeform/notifications/files/<id:[^\/]+>' => 'freeform/notifications/files/edit',
    // Database
    'freeform/notifications/database' => 'freeform/notifications/database',
    'freeform/notifications/database/new' => 'freeform/notifications/database/create',
    'freeform/notifications/database/save' => 'freeform/notifications/database/save',
    'freeform/notifications/database/delete' => 'freeform/notifications/database/delete',
    'freeform/notifications/database/duplicate' => 'freeform/notifications/database/duplicate',
    'freeform/notifications/database/<id:\d+>' => 'freeform/notifications/database/edit',
    // ------------
    'freeform/notifications/send-notification-dialogue' => 'freeform/notifications/sender/dialogue',
    'freeform/notifications/send-notification' => 'freeform/notifications/sender/send',
];

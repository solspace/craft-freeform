<?php

return [
    'freeform/notifications/pdf-templates' => 'freeform/pdf/pdf-templates/index',
    'freeform/notifications/pdf-templates/new' => 'freeform/pdf/pdf-templates/create',
    'freeform/notifications/pdf-templates/<id:\d+>' => 'freeform/pdf/pdf-templates/edit',
    // Preserve existing bookmarks and posted actions.
    'freeform/settings/pdf-templates' => 'freeform/pdf/pdf-templates/legacy',
    'freeform/settings/pdf-templates/new' => 'freeform/pdf/pdf-templates/legacy-create',
    'freeform/settings/pdf-templates/save' => 'freeform/pdf/pdf-templates/save',
    'freeform/settings/pdf-templates/delete' => 'freeform/pdf/pdf-templates/delete',
    'freeform/settings/pdf-templates/duplicate' => 'freeform/pdf/pdf-templates/duplicate',
    'freeform/settings/pdf-templates/<id:\d+>' => 'freeform/pdf/pdf-templates/legacy',
];

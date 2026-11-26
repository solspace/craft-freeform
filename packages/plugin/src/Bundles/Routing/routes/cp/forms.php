<?php

return [
    // Client
    'freeform' => 'freeform/settings/default-view',

    'freeform/forms/duplicate' => 'freeform/forms/duplicate',
    'freeform/forms/reset-spam-counter' => 'freeform/forms/reset-spam-counter',
    'freeform/forms/delete' => 'freeform/forms/delete',
    'freeform/forms/trash' => 'freeform/forms/trash',
    'freeform/forms/mcp-field-removal' => 'freeform/mcp-field-removal/review',
    'freeform/forms/mcp-field-change' => 'freeform/mcp-field-removal/review-change',

    'freeform/forms' => 'freeform/app',
    'freeform/forms/<id:.*>' => 'freeform/app',
];

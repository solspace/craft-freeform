<?php

return [
    'freeform/submissions' => 'freeform/submissions/index',
    'freeform/submissions/export' => 'freeform/submissions/export',
    'freeform/submissions/<id:\d+>' => 'freeform/submissions/edit',
    'freeform/submissions/save' => 'freeform/submissions/save',
    'freeform/submissions/<formHandle:[a-zA-Z0-9\-_]+>' => 'freeform/submissions/index',
];

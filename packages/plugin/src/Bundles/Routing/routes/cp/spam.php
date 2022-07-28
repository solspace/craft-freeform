<?php

return [
    'freeform/spam' => 'freeform/spam-submissions/index',
    'freeform/spam/allow' => 'freeform/spam-submissions/allow',
    'freeform/spam/delete' => 'freeform/spam-submissions/delete',
    'freeform/spam/<id:\d+>' => 'freeform/spam-submissions/edit',
    'freeform/spam/<formHandle:[a-zA-Z0-9\-_]+>' => 'freeform/spam-submissions/index',
];

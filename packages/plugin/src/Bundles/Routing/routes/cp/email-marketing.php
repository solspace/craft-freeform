<?php

return [
    'freeform/settings/mailing-lists' => 'freeform/mailing-lists/index',
    'freeform/settings/mailing-lists/new' => 'freeform/mailing-lists/create',
    'freeform/settings/mailing-lists/<id:\d+>' => 'freeform/mailing-lists/edit',
    'freeform/settings/mailing-lists/<handle:[a-zA-Z0-9\-_]+>' => 'freeform/mailing-lists/handle-o-auth-redirect',
    'freeform/mailing-lists/authenticate/<handle:[a-zA-Z0-9\-_]+>' => 'freeform/mailing-lists/force-authorization',
    'freeform/mailing_list/check' => 'freeform/mailing-lists/check-integration-connection',
];

<?php

return [
    'freeform/settings' => 'freeform/settings/index',
    'freeform/settings/general' => 'freeform/settings/provide-setting',
    'freeform/settings/form-behavior' => 'freeform/settings/provide-setting',
    'freeform/settings/form-builder' => 'freeform/settings/provide-setting',
    'freeform/settings/notices-and-alerts' => 'freeform/settings/provide-setting',
    'freeform/settings/template-manager' => 'freeform/settings/provide-setting',
    'freeform/settings/limited-users' => 'freeform/app',
    'freeform/settings/limited-users/<id:\d+>' => 'freeform/app',
    'freeform/settings/limited-users/new' => 'freeform/app',
    'freeform/settings/spam' => 'freeform/settings/provide-setting',
    'freeform/settings/pinging' => 'freeform/settings/provide-setting',
    'freeform/settings/add-demo-template' => 'freeform/settings/add-demo-template',
    'freeform/settings/add-email-template' => 'freeform/settings/add-email-template',
    'freeform/settings/add-success-template' => 'freeform/settings/add-success-template',
    'freeform/settings/demo-templates' => 'freeform/codepack/list-contents',
];

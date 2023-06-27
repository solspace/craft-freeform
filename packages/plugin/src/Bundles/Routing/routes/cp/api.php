<?php

return [
    // FIELDS
    'freeform/api/fields/forms' => 'freeform/api/fields/forms',
    'freeform/api/fields/favorites' => 'freeform/api/fields/favorites',
    'freeform/api/fields/types' => 'freeform/api/fields/types',
    'freeform/api/fields/types/sections' => 'freeform/api/fields/types/sections',

    // FORMS
    'freeform/api/forms' => 'freeform/api/forms',
    'freeform/api/forms/settings' => 'freeform/api/forms/settings/index',
    'freeform/api/forms/<id:\d+>' => 'freeform/api/forms',

    // FORM ENTRIES
    'freeform/api/forms/<formId:\d+>/layout' => 'freeform/api/forms/layout/get',

    'freeform/api/forms/<formId:\d+>/fields' => 'freeform/api/forms/fields/get',
    'freeform/api/forms/<formId:\d+>/fields/<id:\d+>' => 'freeform/api/forms/fields/get-one',

    'freeform/api/forms/<formId:\d+>/integrations' => 'freeform/api/forms/integrations/get',
    'freeform/api/forms/<formId:\d+>/integrations/<id:\d+>' => 'freeform/api/forms/integrations/get-one',

    'freeform/api/forms/<formId:\d+>/notifications' => 'freeform/api/forms/notifications/get',

    'freeform/api/forms/<formId:\d+>/rules' => 'freeform/api/forms/rules/get',
    'freeform/api/forms/<formId:\d+>/rules/notifications' => 'freeform/api/forms/rules/get-notifications',

    // INTEGRATIONS
    'freeform/api/integrations' => 'freeform/api/integrations',
    'freeform/api/integrations/<id:\d+>' => 'freeform/api/integrations',

    // NOTIFICATIONS
    'freeform/api/notifications/types' => 'freeform/api/notifications/get-types',
    'freeform/api/notifications/templates' => 'freeform/api/notifications/get-templates',

    // TYPES
    'freeform/api/types/page-buttons' => 'freeform/api/types/page-buttons/get-type',

    // GENERAL
    'freeform/api/general/finish-tutorial' => 'freeform/api/settings/finish-tutorial',
    'freeform/api/general/get-submission-data' => 'freeform/api/settings/get-submission-data',
    'freeform/api/modal/forms/options' => 'freeform/api/modal/options',
    'freeform/api/modal/forms' => 'freeform/api/forms/index',

    // SETTINGS
    'freeform/api/settings/general' => 'freeform/api/settings/general',
    'freeform/api/settings/spam' => 'freeform/api/settings/spam',
    'freeform/api/settings/reliability' => 'freeform/api/settings/reliability',
];

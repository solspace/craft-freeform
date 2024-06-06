<?php

return [
    // FIELDS
    'freeform/api/fields/forms' => 'freeform/api/fields/forms',
    'freeform/api/fields/favorites' => 'freeform/api/fields/favorites',
    'freeform/api/fields/favorites/update' => 'freeform/api/fields/favorites/update',
    'freeform/api/fields/types' => 'freeform/api/fields/types',
    'freeform/api/fields/types/sections' => 'freeform/api/fields/types/sections',
    'freeform/api/fields/types/groups' => 'freeform/api/fields/groups',

    // FORMS
    'freeform/api/forms' => 'freeform/api/forms',
    'freeform/api/forms/settings' => 'freeform/api/forms/settings/index',
    'freeform/api/forms/sort' => 'freeform/api/forms/sort',
    'freeform/api/forms/<id:\d+>/clone' => 'freeform/api/forms/clone',
    'freeform/api/forms/<id:\d+>' => 'freeform/api/forms',

    // FORM MODAL
    'freeform/api/forms/modal' => 'freeform/api/forms/modal/index',

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
    'freeform/api/types/options/elements' => 'freeform/api/types/options/get-element-types',
    'freeform/api/types/options/predefined' => 'freeform/api/types/options/get-predefined-types',

    // GENERAL
    'freeform/api/settings/get-submission-data' => 'freeform/api/settings/get-submission-data',
    'freeform/api/modal/forms/options' => 'freeform/api/modal/options',
    'freeform/api/modal/forms' => 'freeform/api/forms/index',

    // SETTINGS
    'freeform/api/settings/general' => 'freeform/api/settings/general',
    'freeform/api/settings/spam' => 'freeform/api/settings/spam',
    'freeform/api/settings/reliability' => 'freeform/api/settings/reliability',

    // OPTIONS
    'freeform/api/options' => 'freeform/api/options/generate-options',

    // NOTICES
    'freeform/api/notices' => 'freeform/api/notices',
    'freeform/api/notices/<id:\d+>' => 'freeform/api/notices',
];

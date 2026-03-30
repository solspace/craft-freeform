<?php

return [
    // FIELDS
    'freeform/api/fields/forms' => 'freeform/api/fields/forms',
    'freeform/api/fields/favorites' => 'freeform/api/fields/favorites',
    'freeform/api/fields/favorites/update' => 'freeform/api/fields/favorites/update',
    'freeform/api/fields/favorites/delete' => 'freeform/api/fields/favorites/delete',
    'freeform/api/fields/types' => 'freeform/api/fields/types',
    'freeform/api/fields/types/sections' => 'freeform/api/fields/types/sections',
    'freeform/api/fields/types/groups' => 'freeform/api/fields/groups',

    // FORMS
    'freeform/api/forms' => 'freeform/api/forms',
    'freeform/api/forms/settings' => 'freeform/api/forms/settings/index',
    'freeform/api/forms/sort' => 'freeform/api/forms/sort',
    'freeform/api/forms/delete' => 'freeform/api/forms/delete',
    'freeform/api/forms/<id:\d+>/clone' => 'freeform/api/forms/clone',
    'freeform/api/forms/<id:\d+>/archive' => 'freeform/api/forms/archive',
    'freeform/api/forms/<id:\d+>' => 'freeform/api/forms',

    // FORM GROUPS
    'freeform/api/forms/groups' => 'freeform/api/form-groups',

    // FORM ELEMENTS
    'freeform/api/forms/<id:\d+>/elements' => 'freeform/api/forms/elements/get',

    // FORM MODAL
    'freeform/api/forms/modal' => 'freeform/api/forms/modal/index',
    'freeform/api/forms/generate-from-ai' => 'freeform/api/forms/generate-from-ai',

    // FORM ENTRIES
    'freeform/api/forms/<formId:\d+>/layout' => 'freeform/api/forms/layout/get',

    'freeform/api/forms/<formId:\d+>/fields' => 'freeform/api/forms/fields/get',
    'freeform/api/forms/<formId:\d+>/fields/<id:\d+>' => 'freeform/api/forms/fields/get-one',

    'freeform/api/forms/<formId:\d+>/integrations' => 'freeform/api/forms/integrations/get',
    'freeform/api/forms/<formId:\d+>/integrations/<id:\d+>' => 'freeform/api/forms/integrations/get-one',

    'freeform/api/forms/<formId:\d+>/notifications' => 'freeform/api/forms/notifications/get',
    'freeform/api/forms/<formId:\d+>/notifications/templates' => 'freeform/api/forms/notifications/get-templates',

    'freeform/api/forms/<formId:\d+>/rules' => 'freeform/api/forms/rules/get',
    'freeform/api/forms/<formId:\d+>/rules/notifications' => 'freeform/api/forms/rules/get-notifications',
    'freeform/api/forms/<formId:\d+>/rules/integrations' => 'freeform/api/forms/rules/get-integrations',

    // SolspaceAI
    'freeform/api/ai/solspace-ai-status' => 'freeform/api/ai/solspace-ai-status',
    'freeform/api/ai/usage' => 'freeform/api/ai/usage',
    'freeform/api/ai/plans' => 'freeform/api/ai/plans',
    'freeform/api/ai/spend-report' => 'freeform/api/ai/spend-report',
    'freeform/api/ai/create-checkout-session' => 'freeform/api/ai/create-checkout-session',

    // INTEGRATIONS
    'freeform/api/integrations' => 'freeform/api/integrations',
    'freeform/api/integrations/<id:\d+>' => 'freeform/api/integrations',
    'freeform/api/integrations/<id:\d+>/delete' => 'freeform/api/integrations/delete',
    'freeform/api/integrations/<id:\d+>/status' => 'freeform/api/integrations/status-check',
    'freeform/api/integrations/navigation' => 'freeform/api/integrations/navigation',
    'freeform/api/integrations/properties/<id:\d+>' => 'freeform/api/integrations/properties',
    'freeform/api/integrations/properties/<type:[a-zA-Z0-9\-]+>/<integration:[a-zA-Z0-9\-_]+>' => 'freeform/api/integrations/properties',

    // NOTIFICATIONS
    'freeform/api/notifications/types' => 'freeform/api/notifications/get-types',
    'freeform/api/notifications/templates' => 'freeform/api/notifications/get-templates',
    'freeform/api/notifications/templates/get-default-metadata' => 'freeform/api/notifications/get-one-template',
    'freeform/api/notifications/templates/<id:\d+>' => 'freeform/api/notifications/get-one-template',

    // TYPES
    'freeform/api/types/page-buttons' => 'freeform/api/types/page-buttons/get-type',
    'freeform/api/types/options/elements' => 'freeform/api/types/options/get-element-types',
    'freeform/api/types/options/predefined' => 'freeform/api/types/options/get-predefined-types',

    // GENERAL
    'freeform/api/submissions/get-submission-data' => 'freeform/api/submissions/get-submission-data',
    'freeform/api/modal/forms/options' => 'freeform/api/modal/options',
    'freeform/api/modal/forms' => 'freeform/api/forms/index',

    // SETTINGS
    'freeform/api/settings/general' => 'freeform/api/settings/general',
    'freeform/api/settings/spam' => 'freeform/api/settings/spam',
    'freeform/api/settings/reliability' => 'freeform/api/settings/reliability',
    'freeform/api/settings/navigation' => 'freeform/api/settings/navigation',

    // OPTIONS
    'freeform/api/options' => 'freeform/api/options/generate-options',

    // NOTICES
    'freeform/api/notices' => 'freeform/api/notices',
    'freeform/api/notices/<id:\d+>' => 'freeform/api/notices',

    // LIMITED USERS
    'freeform/api/limited-users' => 'freeform/api/limited-users',
    'freeform/api/limited-users/<id:new>' => 'freeform/api/limited-users',
    'freeform/api/limited-users/<id:\d+>' => 'freeform/api/limited-users',
    'freeform/api/limited-users/<id:\d+>/delete' => 'freeform/api/limited-users/delete',

    // TEMPLATES
    'freeform/api/templates/demo' => 'freeform/api/templates/demo',
    'freeform/api/templates/pdf' => 'freeform/api/templates/pdf',
    'freeform/api/templates/notifications/suggestions' => 'freeform/api/templates/notifications',
    'freeform/api/templates/notifications/delete' => 'freeform/api/templates/notifications/delete',
    'freeform/api/templates/wrappers' => 'freeform/api/templates/wrappers',
    'freeform/api/templates/preview' => 'freeform/api/templates/notifications/preview-template',
    'freeform/api/templates/send-test' => 'freeform/api/templates/notifications/send-test',

    // ASSETS
    'freeform/api/assets' => 'freeform/api/assets',
    'freeform/api/assets/urls' => 'freeform/api/assets/asset-urls',
    'freeform/api/assets/thumb/card/<assetId:\d+>' => 'freeform/api/assets/card-thumbnail',

    // ENTRIES
    'freeform/api/entries' => 'freeform/api/entries',

    // AUTOSUGGEST
    'freeform/api/autosuggest/env' => 'freeform/api/autosuggest/env',
];

<?php

return [
    // Api
    'freeform/api/fields' => 'freeform/api/fields',
    'freeform/api/notifications' => 'freeform/api/notifications',
    'freeform/api/form-templates' => 'freeform/api/form-templates',
    'freeform/api/mailing-lists' => 'freeform/api/mailing-lists',
    'freeform/api/crm-integrations' => 'freeform/api/crm-integrations',
    'freeform/api/payment-gateways' => 'freeform/api/payment-gateways',
    'freeform/api/payment-gateway-integrations' => 'freeform/api/payment-gateway-integrations',
    'freeform/api/payment-plans' => 'freeform/api/payment-plans',
    'freeform/api/quick-create-field' => 'freeform/api/quick-create-field',
    'freeform/api/quick-create-notification' => 'freeform/api/quick-create-notification',
    'freeform/api/finish-tutorial' => 'freeform/api/finish-tutorial',
    'freeform/api/get-submission-data' => 'freeform/api/get-submission-data',
    'freeform/api/options-from-source' => 'freeform/api/options-from-source',
    // Forms
    'freeform' => 'freeform/settings/default-view',
    'freeform/forms' => 'freeform/forms/index',
    'freeform/forms/duplicate' => 'freeform/forms/duplicate',
    'freeform/forms/reset-spam-counter' => 'freeform/forms/reset-spam-counter',
    'freeform/forms/sort' => 'freeform/forms/sort',
    'freeform/forms/new' => 'freeform/forms/create',
    'freeform/forms/save' => 'freeform/forms/save',
    'freeform/forms/export' => 'freeform/forms/export',
    'freeform/forms/<id:\d+>' => 'freeform/forms/edit',
    'freeform/forms/delete' => 'freeform/forms/delete',
    // Fields
    'freeform/fields' => 'freeform/fields/index',
    'freeform/fields/duplicate' => 'freeform/fields/duplicate',
    'freeform/fields/new' => 'freeform/fields/create',
    'freeform/fields/<id:\d+>' => 'freeform/fields/edit',
    'freeform/fields/save' => 'freeform/fields/save',
    'freeform/fields/delete' => 'freeform/fields/delete',
    // Statuses
    'freeform/settings/statuses' => 'freeform/statuses/index',
    'freeform/settings/statuses/new' => 'freeform/statuses/create',
    'freeform/settings/statuses/<id:\d+>' => 'freeform/statuses/edit',
    'freeform/settings/statuses/save' => 'freeform/statuses/save',
    'freeform/settings/statuses/delete' => 'freeform/statuses/delete',
    // Notifications
    'freeform/notifications' => 'freeform/notifications/index',
    'freeform/notifications/new' => 'freeform/notifications/create',
    'freeform/notifications/<id:\d+>' => 'freeform/notifications/edit',
    'freeform/notifications/save' => 'freeform/notifications/save',
    'freeform/notifications/delete' => 'freeform/notifications/delete',
    'freeform/notifications/duplicate' => 'freeform/notifications/duplicate',
    // Submissions
    'freeform/submissions' => 'freeform/submissions/index',
    'freeform/submissions/export' => 'freeform/submissions/export',
    'freeform/submissions/<id:\d+>' => 'freeform/submissions/edit',
    'freeform/submissions/save' => 'freeform/submissions/save',
    'freeform/submissions/<formHandle:[a-zA-Z0-9\-_]+>' => 'freeform/submissions/index',
    // Spam
    'freeform/spam' => 'freeform/spam-submissions/index',
    'freeform/spam/allow' => 'freeform/spam-submissions/allow',
    'freeform/spam/delete' => 'freeform/spam-submissions/delete',
    'freeform/spam/<id:\d+>' => 'freeform/spam-submissions/edit',
    'freeform/spam/<formHandle:[a-zA-Z0-9\-_]+>' => 'freeform/spam-submissions/index',
    // Errors
    'freeform/settings/error-log' => 'freeform/logs/error',
    'freeform/logs/clear' => 'freeform/logs/clear',

    // Mailing Lists
    'freeform/settings/mailing-lists' => 'freeform/mailing-lists/index',
    'freeform/settings/mailing-lists/new' => 'freeform/mailing-lists/create',
    'freeform/settings/mailing-lists/<id:\d+>' => 'freeform/mailing-lists/edit',
    'freeform/settings/mailing-lists/<id:[a-zA-Z0-9\-_]+>' => 'freeform/mailing-lists/edit',
    'freeform/settings/mailing-lists/<handle:[a-zA-Z0-9\-_]+>' => 'freeform/mailing-lists/handle-o-auth-redirect',
    'freeform/mailing-lists/authenticate/<handle:[a-zA-Z0-9\-_]+>' => 'freeform/mailing-lists/force-authorization',
    'freeform/mailing_list/check' => 'freeform/mailing-lists/check-integration-connection',
    // CRM
    'freeform/settings/crm' => 'freeform/crm/index',
    'freeform/settings/crm/new' => 'freeform/crm/create',
    'freeform/settings/crm/<id:\d+>' => 'freeform/crm/edit',
    'freeform/settings/crm/<id:[a-zA-Z0-9\-_]+>' => 'freeform/crm/edit',
    'freeform/crm/check' => 'freeform/crm/check-integration-connection',
    'freeform/crm/authenticate/<handle:[a-zA-Z0-9_]+>' => 'freeform/crm/force-authorization',
    // Slack
    'freeform/settings/webhooks' => 'freeform/webhooks/index',
    'freeform/settings/webhooks/new' => 'freeform/webhooks/create',
    'freeform/settings/webhooks/<id:\d+>' => 'freeform/webhooks/edit',
    // Payment Gateways
    'freeform/settings/payment-gateways' => 'freeform/payment-gateways/index',
    'freeform/settings/payment-gateways/new' => 'freeform/payment-gateways/create',
    'freeform/settings/payment-gateways/<id:\d+>' => 'freeform/payment-gateways/edit',
    'freeform/payment_gateway/check' => 'freeform/payment-gateways/check-integration-connection',
    'freeform/payment-gateway/authenticate/<handle:[a-zA-Z0-9\-_]+>' => 'freeform/payment-gateways/force-authorization',
    // Settings
    'freeform/settings' => 'freeform/settings/index',
    'freeform/settings/general' => 'freeform/settings/provide-setting',
    'freeform/settings/form-builder' => 'freeform/settings/provide-setting',
    'freeform/settings/email-templates' => 'freeform/settings/provide-setting',
    'freeform/settings/notices-and-alerts' => 'freeform/settings/provide-setting',
    'freeform/settings/formatting-templates' => 'freeform/settings/provide-setting',
    'freeform/settings/spam' => 'freeform/settings/provide-setting',
    'freeform/settings/add-demo-template' => 'freeform/settings/add-demo-template',
    'freeform/settings/add-email-template' => 'freeform/settings/add-email-template',
    'freeform/settings/demo-templates' => 'freeform/codepack/list-contents',
    'freeform/settings/recaptcha' => 'freeform/settings/provide-setting',
    // Resources
    'freeform/resources' => 'freeform/resources/index',
    'freeform/resources/community' => 'freeform/resources/community',
    'freeform/resources/explore' => 'freeform/resources/explore',
    'freeform/resources/support' => 'freeform/resources/support',
    // Dashboard
    'freeform/dashboard' => 'freeform/dashboard/index',
    // Export
    'freeform/export/export-dialogue' => 'freeform/quick-export/export-dialogue',
    'freeform/export' => 'freeform/quick-export/index',
    // Export Profiles
    'freeform/export-profiles' => 'freeform/export-profiles/index',
    'freeform/export-profiles/delete' => 'freeform/export-profiles/delete',
    'freeform/export-profiles/new/<formHandle:[0-9a-zA-Z_\-]+>' => 'freeform/export-profiles/create',
    'freeform/export-profiles/<id:\d+>' => 'freeform/export-profiles/edit',
    // Banners
    'freeform/banners/dismiss/demo' => 'freeform/banners/dismiss-demo',
    // Feeds
    'freeform/feeds/show-summary' => 'freeform/feeds/show-summary',
    'freeform/feeds/dismiss-message' => 'freeform/feeds/dismiss-message',
    'freeform/feeds/dismiss-type' => 'freeform/feeds/dismiss-type',
    // Setup
    'freeform/welcome' => 'freeform/welcome-screen',
    // REST
    'freeform/api/settings/general' => 'freeform/rest-settings/general',
    'freeform/api/settings/spam' => 'freeform/rest-settings/spam',
    'freeform/api/settings/reliability' => 'freeform/rest-settings/reliability',
];

<?php

return [
    // Settings
    'freeform/settings/general'                                  => 'freeform/settings/general',
    'freeform/settings/formatting-templates'                     => 'freeform/settings/formatting-templates',
    'freeform/settings/email-templates'                          => 'freeform/settings/email-templates',
    'freeform/settings/add-demo-template'                        => 'freeform/settings/add-demo-template',
    'freeform/settings/add-email-template'                       => 'freeform/settings/add-email-template',
    'freeform/settings/demo-templates'                           => 'freeform/codepack/list-contents',
    // Api
    'freeform/api/fields'                                        => 'freeform/api/fields',
    'freeform/api/notifications'                                 => 'freeform/api/notifications',
    'freeform/api/form-templates'                                => 'freeform/api/form-templates',
    'freeform/api/mailing-lists'                                 => 'freeform/api/mailing-lists',
    'freeform/api/crm-integrations'                              => 'freeform/api/crm-integrations',
    'freeform/api/quick-create-field'                            => 'freeform/api/quick-create-field',
    'freeform/api/quick-create-notification'                     => 'freeform/api/quick-create-notification',
    'freeform/api/finish-tutorial'                               => 'freeform/api/finish-tutorial',
    'freeform/api/get-submission-data'                           => 'freeform/api/get-submission-data',
    // Forms
    'freeform'                                                   => 'freeform/settings/default-view',
    'freeform/forms'                                             => 'freeform/forms/index',
    'freeform/forms/new'                                         => 'freeform/forms/create',
    'freeform/forms/save'                                        => 'freeform/forms/save',
    'freeform/forms/<id:\d+>'                                    => 'freeform/forms/edit',
    'freeform/forms/delete'                                      => 'freeform/forms/delete',
    // Fields
    'freeform/fields'                                            => 'freeform/fields/index',
    'freeform/fields/new'                                        => 'freeform/fields/create',
    'freeform/fields/<id:\d+>'                                   => 'freeform/fields/edit',
    'freeform/fields/save'                                       => 'freeform/fields/save',
    'freeform/fields/delete'                                     => 'freeform/fields/delete',
    // Statuses
    'freeform/settings/statuses'                                 => 'freeform/statuses/index',
    'freeform/settings/statuses/new'                             => 'freeform/statuses/create',
    'freeform/settings/statuses/<id:\d+>'                        => 'freeform/statuses/edit',
    'freeform/settings/statuses/save'                            => 'freeform/statuses/save',
    'freeform/settings/statuses/delete'                          => 'freeform/statuses/delete',
    // Notifications
    'freeform/notifications'                                     => 'freeform/notifications/index',
    'freeform/notifications/new'                                 => 'freeform/notifications/create',
    'freeform/notifications/<id:\d+>'                            => 'freeform/notifications/edit',
    'freeform/notifications/save'                                => 'freeform/notifications/save',
    'freeform/notifications/delete'                              => 'freeform/notifications/delete',
    // Submissions
    'freeform/submissions'                                       => 'freeform/submissions/index',
    'freeform/submissions/export'                                => 'freeform/submissions/export',
    'freeform/submissions/<id:\d+>'                              => 'freeform/submissions/edit',
    'freeform/submissions/save'                                  => 'freeform/submissions/save',
    'freeform/submissions/delete'                                => 'freeform/submissions/delete',
    // Mailing Lists
    'freeform/settings/mailing-lists'                            => 'freeform/mailing-lists/index',
    'freeform/settings/mailing-lists/new'                        => 'freeform/mailing-lists/create',
    'freeform/settings/mailing-lists/<id:\d+>'                   => 'freeform/mailing-lists/edit',
    'freeform/mailing-lists/authenticate/<handle:[a-zA-Z0-9_]+>' => 'freeform/mailing-lists/force-authorization',
    'freeform/mailing_list/check'                                => 'freeform/mailing-lists/check-integration-connection',
    // CRM
    'freeform/settings/crm'                                      => 'freeform/crm/index',
    'freeform/settings/crm/new'                                  => 'freeform/crm/create',
    'freeform/settings/crm/<id:\d+>'                             => 'freeform/crm/edit',
    'freeform/crm/check'                                         => 'freeform/crm/check-integration-connection',
    'freeform/crm/authenticate/<handle:[a-zA-Z0-9_]+>'           => 'freeform/crm/force-authorization',
];

<?php

/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2026, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Services;

use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\PermissionHelper;

class ExportService extends BaseService
{
    public function getOverviewCards(): array
    {
        $canAccessForms = PermissionHelper::checkPermission(Freeform::PERMISSION_FORMS_ACCESS);
        $canAccessData = $canAccessForms && PermissionHelper::checkPermission(Freeform::PERMISSION_EXPORT_DATA_UTILITY_ACCESS);

        $cards = [
            [
                'title' => Freeform::t('Export Profiles'),
                'description' => Freeform::t('Save reusable export settings for a form, including which submission fields to include and the file format.'),
                'url' => 'freeform/export/profiles',
                'icon' => 'profile',
                'edition' => Freeform::EDITION_LITE,
                'canAccess' => PermissionHelper::checkPermission(Freeform::PERMISSION_EXPORT_PROFILES_ACCESS),
            ],
            [
                'title' => Freeform::t('Export Notifications'),
                'description' => Freeform::t('Email submission exports to selected recipients on a schedule using a saved export profile.'),
                'url' => 'freeform/export/notifications',
                'icon' => 'mail',
                'edition' => Freeform::EDITION_PRO,
                'canAccess' => PermissionHelper::checkPermission(Freeform::PERMISSION_EXPORT_NOTIFICATIONS_ACCESS),
            ],
            [
                'title' => Freeform::t('Export Freeform Data'),
                'description' => Freeform::t('Download selected forms, submissions, and related settings as a backup or for transfer to another site.'),
                'url' => 'freeform/export/forms',
                'icon' => 'download',
                'canAccess' => $canAccessData,
            ],
            [
                'title' => Freeform::t('Import Freeform Data'),
                'description' => Freeform::t('Upload a Freeform export file to bring forms, submissions, and related settings into this site.'),
                'url' => 'freeform/import/forms',
                'icon' => 'upload',
                'canAccess' => $canAccessData,
            ],
        ];

        if (\Craft::$app->plugins->isPluginEnabled('express-forms')) {
            $cards[] = [
                'title' => Freeform::t('Import from Express Forms'),
                'description' => Freeform::t('Migrate forms and submissions from Express Forms into Freeform.'),
                'url' => 'freeform/import/express-forms',
                'icon' => 'migrate',
                'canAccess' => $canAccessForms,
            ];
        }

        if (\Craft::$app->plugins->isPluginEnabled('formie')) {
            $cards[] = [
                'title' => Freeform::t('Import from Formie (v3)'),
                'description' => Freeform::t('Migrate forms and submissions from Formie 3 into Freeform.'),
                'url' => 'freeform/import/formie/v3',
                'icon' => 'migrate',
                'canAccess' => $canAccessForms,
            ];
        }

        $cards[] = [
            'title' => Freeform::t('Merge Forms'),
            'description' => Freeform::t('Map fields between two Freeform forms and move submissions into the destination form.'),
            'url' => 'freeform/export/merge',
            'icon' => 'merge',
            'edition' => Freeform::EDITION_PRO,
            'canAccess' => FormMergeService::hasAccessPermissions(),
        ];

        return $cards;
    }

    public function getNavigation(): array
    {
        $canAccessProfiles = PermissionHelper::checkPermission(Freeform::PERMISSION_EXPORT_PROFILES_ACCESS);
        $canAccessNotifications = PermissionHelper::checkPermission(Freeform::PERMISSION_EXPORT_NOTIFICATIONS_ACCESS);
        $canAccessExport = PermissionHelper::checkPermission(Freeform::PERMISSION_EXPORT_DATA_UTILITY_ACCESS);

        $navigation = [
            ['heading' => Freeform::t('Export')],
        ];

        if ($canAccessProfiles) {
            $navigation[] = [
                'title' => Freeform::t('Profiles'),
                'url' => 'freeform/export/profiles',
            ];
        }

        if ($canAccessNotifications) {
            $navigation[] = [
                'title' => Freeform::t('Notifications'),
                'url' => 'freeform/export/notifications',
            ];
        }

        if ($canAccessExport) {
            $navigation[] = [
                'title' => Freeform::t('Freeform'),
                'url' => 'freeform/export/forms',
            ];
        }

        $importNavigation[] = ['heading' => Freeform::t('Import')];

        if ($canAccessExport) {
            $importNavigation[] = [
                'title' => Freeform::t('Freeform'),
                'url' => 'freeform/import/forms',
            ];
        }

        // ======= IMPORT =========
        $isInstalled = \Craft::$app->plugins->isPluginInstalled('express-forms');
        $isEnabled = \Craft::$app->plugins->isPluginEnabled('express-forms');
        if ($isInstalled && $isEnabled) {
            $importNavigation[] = [
                'title' => Freeform::t('Express Forms'),
                'url' => 'freeform/import/express-forms',
            ];
        }

        // Check if Formie is installed and enabled
        $formieInstalled = \Craft::$app->plugins->isPluginInstalled('formie');
        $formieEnabled = \Craft::$app->plugins->isPluginEnabled('formie');
        if ($formieInstalled && $formieEnabled) {
            $importNavigation[] = [
                'title' => Freeform::t('Formie (v3)'),
                'url' => 'freeform/import/formie/v3',
            ];
        }

        if (\count($importNavigation) > 1) {
            $navigation = array_merge($navigation, $importNavigation);
        }

        if (FormMergeService::canAccess()) {
            $navigation[] = ['heading' => Freeform::t('Utilities')];
            $navigation[] = [
                'title' => Freeform::t('Merge Forms'),
                'url' => 'freeform/export/merge',
            ];
        }

        return $navigation;
    }
}

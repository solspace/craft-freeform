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

        return $navigation;
    }
}

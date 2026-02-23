<?php

namespace Solspace\Freeform\Bundles\Navigation;

use Solspace\Freeform\Events\Freeform\RegisterCpSubnavItemsEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use yii\base\Event;

class NavigationBundle extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            Freeform::class,
            Freeform::EVENT_REGISTER_SUBNAV_ITEMS,
            [$this, 'registerNavigationItems']
        );

        Event::on(
            Freeform::class,
            Freeform::EVENT_REGISTER_SUBNAV_ITEMS,
            [$this, 'attachBadgeCount']
        );
    }

    public function registerNavigationItems(RegisterCpSubnavItemsEvent $event): void
    {
        $freeform = $this->plugin();

        $canAccessForms = PermissionHelper::checkPermission(Freeform::PERMISSION_FORMS_ACCESS);
        $canAccessSubmissions = PermissionHelper::checkPermission(Freeform::PERMISSION_SUBMISSIONS_ACCESS);
        $canAccessNotifications = PermissionHelper::checkPermission(Freeform::PERMISSION_NOTIFICATIONS_ACCESS);
        $canAccessIntegrations = PermissionHelper::checkPermission(Freeform::PERMISSION_INTEGRATIONS_ACCESS);

        $canAccessExportProfiles = PermissionHelper::checkPermission(Freeform::PERMISSION_EXPORT_PROFILES_ACCESS);
        $canAccessExportNotifications = PermissionHelper::checkPermission(Freeform::PERMISSION_EXPORT_NOTIFICATIONS_ACCESS);
        $canAccessExportDataUtility = PermissionHelper::checkPermission(Freeform::PERMISSION_EXPORT_DATA_UTILITY_ACCESS);

        $canAccessSettings = PermissionHelper::checkPermission(Freeform::PERMISSION_SETTINGS_ACCESS);

        if ($canAccessForms) {
            $event->addSubnavItem('forms', Freeform::t('Forms'), 'freeform/forms');
        }

        if ($canAccessSubmissions) {
            $event->addSubnavItem('submissions', Freeform::t('Submissions'), 'freeform/submissions');
        }

        $isSpamFolderEnabled = $freeform->settings->isSpamFolderEnabled();
        if ($canAccessSubmissions && $isSpamFolderEnabled) {
            $spamCount = $freeform->spamSubmissions->getSubmissionCount(null, null, true) ?: null;
            $event->addSubnavItem(
                'spam',
                Freeform::t('Spam'),
                'freeform/spam',
                extraOptions: ['badgeCount' => $spamCount],
            );
        }

        if ($canAccessNotifications) {
            $event->addSubnavItem('notifications', Freeform::t('Notifications'), 'freeform/notifications');
        }

        if ($canAccessIntegrations) {
            $event->addSubnavItem('integrations', Freeform::t('Integrations'), 'freeform/integrations');
        }

        $solspaceAiEnabled = $canAccessIntegrations
            && null !== $freeform->integrations->getFirstEnabledSolspaceAIIntegration();
        if ($solspaceAiEnabled) {
            $event->addSubnavItem('ai', Freeform::t('AI'), 'freeform/ai', 'submissions');
        }

        $showImportExport = (
            $canAccessExportProfiles
            || $canAccessExportNotifications
            || $canAccessExportDataUtility
        );

        if ($showImportExport) {
            $request = \Craft::$app->getRequest();
            $path = $request->getFullPath();

            // Determine default subnav landing
            if ($canAccessExportProfiles) {
                $defaultExportUrl = 'freeform/export/profiles';
            } elseif ($canAccessExportNotifications) {
                $defaultExportUrl = 'freeform/export/notifications';
            } else {
                $defaultExportUrl = 'freeform/export/forms';
            }

            $subnav = [];

            if ($canAccessExportProfiles) {
                $subnav['profiles'] = [
                    'id' => 'profiles',
                    'label' => Freeform::t('Profiles'),
                    'url' => 'freeform/export/profiles',
                    'sel' => str_starts_with($path, 'freeform/export/profiles'),
                ];
            }

            if ($canAccessExportNotifications) {
                $subnav['notifications'] = [
                    'id' => 'notifications',
                    'label' => Freeform::t('Notifications'),
                    'url' => 'freeform/export/notifications',
                    'sel' => str_starts_with($path, 'freeform/export/notifications'),
                ];
            }

            if ($canAccessExportDataUtility) {
                $subnav['forms-export'] = [
                    'id' => 'forms-export',
                    'label' => Freeform::t('Export Forms'),
                    'url' => 'freeform/export/forms',
                    'sel' => str_starts_with($path, 'freeform/export/forms'),
                ];

                $subnav['forms-import'] = [
                    'id' => 'forms-import',
                    'label' => Freeform::t('Import Forms'),
                    'url' => 'freeform/import/forms',
                    'sel' => str_starts_with($path, 'freeform/import/forms'),
                ];
            }

            $event->addSubnavItem(
                'export',
                Freeform::t('Import / Export'),
                $defaultExportUrl,
                extraOptions: ['subnav' => $subnav],
            );
        }

        if ($canAccessSettings) {
            $event->addSubnavItem('settings', Freeform::t('Settings'), 'freeform/settings');
        }
    }

    public function attachBadgeCount(RegisterCpSubnavItemsEvent $event): void
    {
        $badgeCount = $this->plugin()->settings->getBadgeCount();
        if (!$badgeCount) {
            return;
        }

        $event->addToNav('badgeCount', $badgeCount);
    }
}

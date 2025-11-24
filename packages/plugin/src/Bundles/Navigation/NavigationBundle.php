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

        if ($canAccessExportProfiles || $canAccessExportNotifications) {
            $request = \Craft::$app->getRequest();
            $path = $request->getFullPath();

            if ($canAccessExportProfiles) {
                $defaultExportUrl = 'freeform/export/profiles';
                $profiles = [
                    'id' => 'profiles',
                    'label' => Freeform::t('Profiles'),
                    'url' => 'freeform/export/profiles',
                    'sel' => str_starts_with($path, 'freeform/export/profiles'),
                ];
            } else {
                $defaultExportUrl = 'freeform/export/notifications';
                $profiles = [
                    'id' => 'notifications',
                    'label' => Freeform::t('Notifications'),
                    'url' => 'freeform/export/notifications',
                    'sel' => str_starts_with($path, 'freeform/export/notifications'),
                ];
            }

            $subnav = [
                'profiles' => $profiles,
                'files' => [
                    'id' => 'files',
                    'label' => Freeform::t('Files'),
                    'url' => 'freeform/export/files',
                    'sel' => str_starts_with($path, 'freeform/export/files'),
                ],
            ];

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

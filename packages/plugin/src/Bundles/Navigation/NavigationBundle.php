<?php

namespace Solspace\Freeform\Bundles\Navigation;

use Solspace\Commons\Helpers\PermissionHelper;
use Solspace\Freeform\Events\Freeform\RegisterCpSubnavItemsEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
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

        $isPro = $freeform->isPro();
        $canAccessForms = PermissionHelper::checkPermission(Freeform::PERMISSION_FORMS_ACCESS);
        $canAccessSubmissions = PermissionHelper::checkPermission(Freeform::PERMISSION_SUBMISSIONS_ACCESS);
        $canAccessNotifications = PermissionHelper::checkPermission(Freeform::PERMISSION_NOTIFICATIONS_ACCESS);
        $canAccessExportProfiles = PermissionHelper::checkPermission(Freeform::PERMISSION_EXPORT_PROFILES_ACCESS);
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

        if ($canAccessExportProfiles) {
            $event->addSubnavItem(
                'export',
                Freeform::t('Import / Export'),
                'freeform/export/profiles',
                extraOptions: ['subnav' => [
                    'profiles' => ['label' => Freeform::t('Profiles'), 'url' => 'freeform/export/profiles'],
                    'files' => ['label' => Freeform::t('Files'), 'url' => 'freeform/export/files'],
                ]]
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

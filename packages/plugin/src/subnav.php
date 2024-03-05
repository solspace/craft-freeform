<?php

use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\PermissionHelper;

$navItems = [];

if (PermissionHelper::checkPermission(Freeform::PERMISSION_FORMS_ACCESS)) {
    $navItems['forms'] = ['label' => Freeform::t('Forms'), 'url' => 'freeform/forms'];
}

if (PermissionHelper::checkPermission(Freeform::PERMISSION_SUBMISSIONS_ACCESS)) {
    $navItems['submissions'] = ['label' => Freeform::t('Submissions'), 'url' => 'freeform/submissions'];
}

if (PermissionHelper::checkPermission(Freeform::PERMISSION_SUBMISSIONS_ACCESS)
    && $this->settings->isSpamFolderEnabled()) {
    $spamCount = $this->spamSubmissions->getSubmissionCount(null, null, true);
    $navItems['spam'] = ['label' => Freeform::t('Spam'), 'url' => 'freeform/spam'];
    if ($spamCount) {
        $navItems['spam']['badgeCount'] = $spamCount;
    }
}

if (PermissionHelper::checkPermission(Freeform::PERMISSION_NOTIFICATIONS_ACCESS)) {
    $navItems['notifications'] = ['label' => Freeform::t('Notifications'), 'url' => 'freeform/notifications'];
}

if (Freeform::getInstance()->isPro() && PermissionHelper::checkPermission(Freeform::PERMISSION_EXPORT_PROFILES_ACCESS)) {
    $navItems['export'] = ['label' => Freeform::t('Export'), 'url' => 'freeform/export/profiles'];
}

if (PermissionHelper::checkPermission(Freeform::PERMISSION_SETTINGS_ACCESS)) {
    $navItems['settings'] = ['label' => Freeform::t('Settings'), 'url' => 'freeform/settings'];
}

return $navItems;

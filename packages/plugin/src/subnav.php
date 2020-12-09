<?php

use Solspace\Commons\Helpers\PermissionHelper;
use Solspace\Freeform\Freeform;

$navItems = [];

if (PermissionHelper::checkPermission(Freeform::PERMISSION_DASHBOARD_ACCESS)) {
    $navItems['dashboard'] = ['label' => Freeform::t('Dashboard'), 'url' => 'freeform/dashboard'];
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

if (PermissionHelper::checkPermission(Freeform::PERMISSION_FORMS_ACCESS)) {
    $navItems['forms'] = ['label' => Freeform::t('Forms'), 'url' => 'freeform/forms'];
}

if (PermissionHelper::checkPermission(Freeform::PERMISSION_FIELDS_ACCESS)) {
    $navItems['fields'] = ['label' => Freeform::t('Fields'), 'url' => 'freeform/fields'];
}

if (PermissionHelper::checkPermission(Freeform::PERMISSION_NOTIFICATIONS_ACCESS)) {
    $navItems['notifications'] = ['label' => Freeform::t('Email Notifications'), 'url' => 'freeform/notifications'];
}

if (Freeform::getInstance()->isPro() && PermissionHelper::checkPermission(Freeform::PERMISSION_EXPORT_PROFILES_ACCESS)) {
    $navItems['exportProfiles'] = ['label' => Freeform::t('Export'), 'url' => 'freeform/export-profiles'];
}

if (PermissionHelper::checkPermission(Freeform::PERMISSION_SETTINGS_ACCESS)) {
    $navItems['settings'] = ['label' => Freeform::t('Settings'), 'url' => 'freeform/settings'];
}

if (PermissionHelper::checkPermission(Freeform::PERMISSION_RESOURCES)) {
    $navItems['resources'] = ['label' => Freeform::t('Resources'), 'url' => 'freeform/resources'];
}

return $navItems;

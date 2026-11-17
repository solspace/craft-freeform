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

namespace Solspace\Freeform\controllers\api;

use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Services\ActivityService;
use Solspace\Freeform\Services\SettingsService;

class ActivityAlertsController extends BaseApiController
{
    public function __construct(
        $id,
        $module,
        $config,
        private ActivityService $activityService,
        private SettingsService $settingsService,
    ) {
        parent::__construct($id, $module, $config ?? []);
    }

    protected function get(): array|object
    {
        $settings = $this->settingsService->getSettingsModel();
        $style = $settings->getEffectiveLoggingStyle();
        $canAccessSettings = PermissionHelper::checkPermission(Freeform::PERMISSION_SETTINGS_ACCESS);
        $errorLog = match ($style) {
            'activity' => $canAccessSettings || PermissionHelper::checkPermission(Freeform::PERMISSION_ACTIVITY_ACCESS) ? 'activity' : null,
            default => null,
        };
        $warningCounts = match ($errorLog) {
            'activity' => ['activity' => $this->activityService->getOperationalWarningCount()],
            default => [],
        };
        $warningLogs = [];
        foreach ($warningCounts as $log => $count) {
            if ($count) {
                $warningLogs[] = ['log' => $log, 'count' => $count];
            }
        }

        return [
            'errors' => match ($errorLog) {
                'activity' => $this->activityService->getErrorCount(),
                default => 0,
            },
            'errorLog' => $errorLog,
            'activityRetentionDays' => 'activity' === $errorLog ? max(1, min(365, $settings->activityRetentionDays)) : null,
            'warningLogs' => $warningLogs,
        ];
    }
}

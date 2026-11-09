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
use Solspace\Freeform\Library\DataObjects\FreeformFeed\Notification;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Services\ActivityService;
use Solspace\Freeform\Services\FreeformFeedService;
use Solspace\Freeform\Services\LoggerService;
use Solspace\Freeform\Services\SettingsService;

class NoticesController extends BaseApiController
{
    public function __construct(
        $id,
        $module,
        $config,
        private FreeformFeedService $feedService,
        private LoggerService $loggerService,
        private ActivityService $activityService,
        private SettingsService $settingsService,
    ) {
        parent::__construct($id, $module, $config ?? []);
    }

    protected function get(): array|object
    {
        $messages = $this->settingsService->isDisplayFeed() ? $this->feedService->getUnreadFeedMessages() : [];

        $notices = [];
        foreach ($messages as $message) {
            $data = $message->toArray();
            $data['conditions'] = json_decode($data['conditions'], true);

            $notices[] = new Notification($data);
        }

        usort(
            $notices,
            static function (Notification $a, Notification $b) {
                $categorySortOrder = Notification::CATEGORY_SORT_ORDER;

                $aIndex = array_search($a->getType(), $categorySortOrder, true);
                $bIndex = array_search($b->getType(), $categorySortOrder, true);

                return $aIndex <=> $bIndex;
            }
        );

        $settings = $this->settingsService->getSettingsModel();
        $style = $settings->getEffectiveLoggingStyle();
        $canAccessSettings = PermissionHelper::checkPermission(Freeform::PERMISSION_SETTINGS_ACCESS);
        $errorLog = match ($style) {
            'classic' => $canAccessSettings ? 'classic' : null,
            'activity' => $canAccessSettings || PermissionHelper::checkPermission(Freeform::PERMISSION_ACTIVITY_ACCESS) ? 'activity' : null,
            default => null,
        };
        $warningCounts = match ($errorLog) {
            'classic' => $this->loggerService->getWarningLogCounts(),
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
            'notices' => $notices,
            'errors' => match ($errorLog) {
                'classic' => $this->loggerService->getErrorLogLineCount(),
                'activity' => $this->activityService->getErrorCount(),
                default => 0,
            },
            'errorLog' => $errorLog,
            'activityRetentionDays' => 'activity' === $errorLog ? max(1, min(365, $settings->activityRetentionDays)) : null,
            'warningLogs' => $warningLogs,
        ];
    }

    protected function delete(int $id): ?bool
    {
        return $this->feedService->markFeedMessageAsRead($id);
    }
}

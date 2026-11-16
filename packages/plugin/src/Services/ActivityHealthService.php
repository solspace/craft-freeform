<?php

namespace Solspace\Freeform\Services;

use craft\db\Query;
use craft\helpers\UrlHelper;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Activity\ActivityPolicy;
use Solspace\Freeform\Library\Activity\ActivityPresentation;
use Solspace\Freeform\Library\Activity\ActivityTable;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use yii\db\Expression;
use yii\web\ForbiddenHttpException;

/** Personal dashboard reporting; counts describe recorded events, not delivery or success rates. */
class ActivityHealthService extends BaseService
{
    private const RECENT_LIMIT = 20;

    public static function canAccess(string $style = 'activity'): bool
    {
        return PermissionHelper::checkPermission(Freeform::PERMISSION_SETTINGS_ACCESS) || ('classic' !== $style && PermissionHelper::checkPermission(Freeform::PERMISSION_ACTIVITY_ACCESS));
    }

    public function navigation(int $days): array
    {
        $settings = $this->getSettingsService()->getSettingsModel();
        $style = $settings->getEffectiveLoggingStyle();
        if (!self::canAccess($style)) {
            throw new ForbiddenHttpException('Log access is required.');
        }
        $days = max(1, min(365, $days));
        if ('activity' === $style) {
            $days = min($days, max(1, min(365, $settings->activityRetentionDays)));
        }
        $links = [];
        if ('activity' === $style) {
            $links[] = ['label' => Freeform::t('Open Activity Log'), 'url' => UrlHelper::cpUrl('freeform/activity', ['view' => 'events', 'days' => $days])];
        } elseif ('classic' === $style) {
            foreach (['error-log' => 'Error Log', 'integrations-log' => 'Integrations Log', 'email-log' => 'Email Log'] as $route => $label) {
                $links[] = ['label' => Freeform::t($label), 'url' => UrlHelper::cpUrl('freeform/settings/'.$route)];
            }
        }

        return ['days' => $days, 'period' => 1 === $days ? Freeform::t('Past 24 hours') : Freeform::t('Past {days} days', ['days' => $days]), 'scope' => Freeform::t('All forms'), 'links' => $links];
    }

    public function snapshot(int $days, array $events, bool $showRecent = true): array
    {
        if (!self::canAccess()) {
            throw new ForbiddenHttpException('Activity access is required.');
        }
        $settings = $this->getSettingsService()->getSettingsModel();
        $style = $settings->getEffectiveLoggingStyle();
        if (!self::canAccess($style)) {
            throw new ForbiddenHttpException('Settings access is required for Classic logs.');
        }
        $days = max(1, min(365, $days));
        $retention = max(1, min(365, $settings->activityRetentionDays));
        $effectiveDays = 'activity' === $style ? min($days, $retention) : $days;
        $until = new \DateTimeImmutable('now', new \DateTimeZone('UTC'));
        $since = $until->modify('-'.$effectiveDays.' days');
        $result = ['available' => true, 'style' => $style, 'mode' => $settings->activityMode, 'days' => $effectiveDays, 'requestedDays' => $days, 'retentionDays' => $retention, 'errors' => 0, 'warnings' => 0, 'breakdown' => [], 'recorded' => 0, 'trend' => [], 'recent' => [], 'errorUrl' => null, 'warningUrl' => null, 'settingsUrl' => null, 'links' => []];
        if ('none' === $style && PermissionHelper::checkPermission(Freeform::PERMISSION_SETTINGS_ACCESS) && $this->getSettingsService()->isAllowAdminEdit()) {
            $result['settingsUrl'] = UrlHelper::cpUrl('freeform/settings/activity');
        }

        try {
            if ('activity' === $style) {
                $base = (new Query())->from(ActivityTable::TABLE)->where(['>=', 'dateCreated', $since->format('Y-m-d H:i:s')])->andWhere(['<=', 'dateCreated', $until->format('Y-m-d H:i:s')]);
                $issues = (clone $base)->andWhere(['resolvedAt' => null])->andWhere(['or', ['level' => 'error'], ['level' => 'warning', 'category' => 'system']]);
                $counts = (clone $issues)->select(['level', 'count' => new Expression('COUNT(*)')])->groupBy('level')->pairs();
                $result['errors'] = (int) ($counts['error'] ?? 0);
                $result['warnings'] = (int) ($counts['warning'] ?? 0);
                $totals = (clone $base)->select(['event', 'count' => new Expression('COUNT(*)')])->groupBy('event')->pairs();
                $result['recorded'] = (int) array_sum($totals);
                $daily = (clone $base)->select(['day' => new Expression('DATE([[dateCreated]])'), 'count' => new Expression('COUNT(*)')])->groupBy(new Expression('DATE([[dateCreated]])'))->pairs();
                $firstDay = $since->setTime(0, 0);
                $dayCount = (int) $firstDay->diff($until->setTime(0, 0))->days + 1;
                $bucketCount = min(28, $dayCount);
                $buckets = array_fill(0, $bucketCount, 0);
                for ($i = 0; $i < $dayCount; ++$i) {
                    $buckets[min($bucketCount - 1, (int) floor($i * $bucketCount / $dayCount))] += (int) ($daily[$firstDay->modify('+'.$i.' days')->format('Y-m-d')] ?? 0);
                }
                $peak = max(1, max($buckets));
                foreach ($buckets as $count) {
                    $result['trend'][] = ['count' => $count, 'height' => round(100 * $count / $peak, 2)];
                }
                $recording = ActivityPolicy::options($settings->activityMode, $settings->activityEvents);
                foreach (array_intersect(array_keys(ActivityPolicy::EVENTS), $events) as $event) {
                    $result['breakdown'][] = ['event' => $event, 'label' => ActivityPolicy::EVENTS[$event][0], 'count' => (int) ($totals[$event] ?? 0), 'recording' => $recording[$event]];
                }
                $result['errorUrl'] = UrlHelper::cpUrl('freeform/activity', ['view' => 'events', 'resolution' => 'open', 'level' => 'error', 'days' => $effectiveDays]);
                $result['warningUrl'] = UrlHelper::cpUrl('freeform/activity', ['view' => 'events', 'resolution' => 'open', 'level' => 'warning', 'category' => 'system', 'days' => $effectiveDays]);
                $result['links'][] = ['label' => 'Open Activity Log', 'url' => UrlHelper::cpUrl('freeform/activity', ['view' => 'events', 'days' => $effectiveDays])];
                if ($showRecent) {
                    foreach ((clone $issues)->orderBy(['dateCreated' => \SORT_DESC, 'id' => \SORT_DESC])->limit(self::RECENT_LIMIT)->all() as $row) {
                        $row = ActivityPresentation::present($row);
                        $result['recent'][] = ['title' => $row['title'], 'level' => $row['level'], 'date' => $row['dateCreated'], 'url' => UrlHelper::cpUrl('freeform/activity', ['view' => 'events', 'eventId' => $row['id']])];
                    }
                }
            } elseif ('classic' === $style) {
                foreach (['error-log' => [null, 'Error Log'], 'integrations-log' => ['freeform-integrations.log', 'Integrations Log'], 'email-log' => ['freeform-email.log', 'Email Log']] as $route => [$file, $label]) {
                    $url = UrlHelper::cpUrl('freeform/settings/'.$route);
                    $result['links'][] = ['label' => $label, 'url' => $url];
                    foreach (Freeform::getInstance()->logger->getLogReader($file) as $line) {
                        if (!$line || $line->getDate() < $since || $line->getDate() > $until || !\in_array(strtolower($line->getLevel()), ['error', 'critical', 'alert', 'emergency', 'warning'], true)) {
                            continue;
                        }
                        $level = 'warning' === strtolower($line->getLevel()) ? 'warning' : 'error';
                        ++$result['warning' === $level ? 'warnings' : 'errors'];
                        if ($showRecent) {
                            $result['recent'][] = ['title' => mb_substr($line->getMessage(), 0, 100), 'level' => $level, 'date' => $line->getDate(), 'url' => $url];
                            usort($result['recent'], static fn ($a, $b) => $b['date'] <=> $a['date']);
                            $result['recent'] = \array_slice($result['recent'], 0, self::RECENT_LIMIT);
                        }
                    }
                }
            }
        } catch (\Throwable) {
            $result['available'] = false;
            $result['breakdown'] = $result['recent'] = [];
        }

        return $result;
    }
}

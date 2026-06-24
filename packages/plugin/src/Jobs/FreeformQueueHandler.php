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

namespace Solspace\Freeform\Jobs;

use craft\db\Query;
use craft\db\Table;
use craft\helpers\Queue;
use craft\queue\JobInterface;
use Solspace\Freeform\Events\Jobs\QueueJobEvent;
use Solspace\Freeform\Services\SettingsService;
use yii\base\Event;

class FreeformQueueHandler
{
    public const EVENT_BEFORE_QUEUE_JOB = 'before-queue-job';

    private ?int $queuePriority;

    public function __construct(
        private SettingsService $settingsService
    ) {
        $this->queuePriority = $this->settingsService->getQueuePriority();
    }

    public function queueSingleJobInstance(JobInterface $job): void
    {
        if ($this->isJobInQueue($job)) {
            return;
        }

        Queue::push($job, $this->queuePriority);
    }

    public function queueJob(JobInterface $job, ?int $priority = null, bool $queuedExecution = true): void
    {
        $event = new QueueJobEvent($job, $priority, $queuedExecution);
        Event::trigger($this, self::EVENT_BEFORE_QUEUE_JOB, $event);

        $queue = \Craft::$app->getQueue();

        if ($event->shouldQueue()) {
            Queue::push($job, $event->getPriority() ?? $this->queuePriority);
        } else {
            $job->execute($queue);
        }
    }

    public function executeNotificationJob(NotificationJobInterface $job, ?int $priority = null): void
    {
        $this->queueJob($job, $priority, $this->settingsService->isNotificationQueueEnabled());
    }

    public function executeIntegrationJob(IntegrationJobInterface $job, ?int $priority = null): void
    {
        $this->queueJob($job, $priority, $this->settingsService->isIntegrationQueueEnabled());
    }

    public function executeAiFieldsJob(AiFieldsJobInterface $job, ?int $priority = null): void
    {
        $this->queueJob($job, $priority, $this->settingsService->isAiFieldQueueEnabled());
    }

    private function isJobInQueue(JobInterface $job): bool
    {
        $table = \Craft::$app->getDb()->schema->getTableSchema(Table::QUEUE);

        if (!$table) {
            return false;
        }

        foreach (['description', 'fail', 'dateReserved'] as $column) {
            if (!isset($table->columns[$column])) {
                return false;
            }
        }

        $description = $job->getDescription();

        return (new Query())
            ->from(Table::QUEUE)
            ->where([
                'description' => $description,
                'fail' => false,
            ])
            ->andWhere(['dateReserved' => null])
            ->exists()
        ;
    }
}

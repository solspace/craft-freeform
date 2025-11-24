<?php

/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2025, Solspace, Inc.
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
use Solspace\Freeform\Services\SettingsService;

class FreeformQueueHandler
{
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
        $queue = \Craft::$app->getQueue();

        if ($queuedExecution) {
            Queue::push($job, $priority ?? $this->queuePriority);
        } else {
            $job->execute($queue);
        }
    }

    public function executeNotificationJob(NotificationJobInterface $job, ?int $priority = null, ?bool $bypassQueue = null): void
    {
        // Bypass queue for Form Monitor requests to ensure immediate email delivery
        if (null === $bypassQueue) {
            $bypassQueue = $this->shouldBypassQueueForFormMonitor($job);
        }

        $shouldQueue = $bypassQueue ? false : $this->settingsService->isNotificationQueueEnabled();
        $this->queueJob($job, $priority, $shouldQueue);
    }

    public function executeIntegrationJob(IntegrationJobInterface $job, ?int $priority = null): void
    {
        $this->queueJob($job, $priority, $this->settingsService->isIntegrationQueueEnabled());
    }

    public function executeAiFieldsJob(AiFieldsJobInterface $job, ?int $priority = null): void
    {
        $this->queueJob($job, $priority, $this->settingsService->isAiFieldQueueEnabled());
    }

    private function shouldBypassQueueForFormMonitor(NotificationJobInterface $job): bool
    {
        if (!$job instanceof SendNotificationsJob) {
            return false;
        }

        $headers = $job->headers ?? [];

        // Check if this is a Form Monitor request
        if (!isset($headers['X-Form-Monitor']) || 'true' !== (string) $headers['X-Form-Monitor']) {
            return false;
        }

        // Additional verification: Request-Id should be present for legitimate Form Monitor requests
        if (!isset($headers['X-Form-Monitor-Request-Id']) || empty($headers['X-Form-Monitor-Request-Id'])) {
            return false;
        }

        return true;
    }

    private function isJobInQueue(JobInterface $job): bool
    {
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

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

namespace Solspace\Freeform\Events\Jobs;

use craft\events\CancelableEvent;
use craft\queue\JobInterface;

class QueueJobEvent extends CancelableEvent
{
    private bool $bypassQueue = false;

    public function __construct(
        private JobInterface $job,
        private ?int $priority = null,
        private bool $queuedExecution = true
    ) {
        parent::__construct();
    }

    public function getJob(): JobInterface
    {
        return $this->job;
    }

    public function getPriority(): ?int
    {
        return $this->priority;
    }

    public function setPriority(?int $priority): void
    {
        $this->priority = $priority;
    }

    public function shouldQueue(): bool
    {
        return $this->queuedExecution && !$this->bypassQueue;
    }

    public function setQueuedExecution(bool $queuedExecution): void
    {
        $this->queuedExecution = $queuedExecution;
    }

    public function bypassQueue(): void
    {
        $this->bypassQueue = true;
    }

    public function isBypassQueue(): bool
    {
        return $this->bypassQueue;
    }
}

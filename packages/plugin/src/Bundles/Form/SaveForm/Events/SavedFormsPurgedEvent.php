<?php

namespace Solspace\Freeform\Bundles\Form\SaveForm\Events;

use Solspace\Freeform\Events\ArrayableEvent;

class SavedFormsPurgedEvent extends ArrayableEvent
{
    public const REASON_TTL_EXPIRED = 'ttl_expired';
    public const REASON_SESSION_LIMIT = 'session_limit';

    /**
     * @param array<array{id: int, token: string, formId: int}> $records Deleted saved-form identifiers, without encrypted payloads or keys
     * @param null|string                                       $cutoff  UTC expiration cutoff, in database date format; null for session-limit cleanup
     * @param null|int                                          $ttlDays Effective TTL; null for session-limit cleanup
     */
    public function __construct(
        public array $records,
        public string $reason,
        public ?string $cutoff = null,
        public ?int $ttlDays = null,
    ) {
        parent::__construct();
    }

    public function fields(): array
    {
        return ['records', 'reason', 'cutoff', 'ttlDays'];
    }
}

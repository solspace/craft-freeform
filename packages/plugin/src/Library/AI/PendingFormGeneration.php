<?php

namespace Solspace\Freeform\Library\AI;

/** A provider accepted the request; resume using this ID rather than submitting again. */
final class PendingFormGeneration extends \RuntimeException
{
    public function __construct(public ?string $responseId)
    {
        parent::__construct('AI generation is still in progress.');
    }
}

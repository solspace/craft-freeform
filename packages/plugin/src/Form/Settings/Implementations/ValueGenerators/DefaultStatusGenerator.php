<?php

namespace Solspace\Freeform\Form\Settings\Implementations\ValueGenerators;

use Solspace\Freeform\Attributes\Property\ValueGeneratorInterface;
use Solspace\Freeform\Services\StatusesService;

class DefaultStatusGenerator implements ValueGeneratorInterface
{
    public function __construct(private StatusesService $statusesService) {}

    public function generateValue(?object $referenceObject): int
    {
        try {
            $statuses = $this->statusesService->getAllStatuses();
            foreach ($statuses as $status) {
                if ('open' === $status->handle) {
                    return $status->id;
                }
            }

            $first = reset($statuses);

            return $first?->id ?? 1;
        } catch (\Exception $e) {
            return 0;
        }
    }
}

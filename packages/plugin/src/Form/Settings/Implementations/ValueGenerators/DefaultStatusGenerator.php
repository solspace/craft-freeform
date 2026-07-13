<?php

namespace Solspace\Freeform\Form\Settings\Implementations\ValueGenerators;

use Solspace\Freeform\Attributes\Property\ValueGeneratorInterface;
use Solspace\Freeform\Services\StatusesService;

class DefaultStatusGenerator implements ValueGeneratorInterface
{
    public function __construct(
        private StatusesService $statusesService,
    ) {}

    public function generateValue(?object $referenceObject, ?object $context): int
    {
        $path = trim(request()->path(), '/');

        // Match the CP login page regardless of the configured CP trigger.
        if (
            $path === 'login'
            || str_ends_with($path, '/login')
        ) {
            return 1;
        }

        // Match the GraphQL explorer regardless of the configured CP trigger.
        if (preg_match('#(^|/)graphiql(?:/|$)#', $path)) {
            return 1;
        }

        try {
            $status = $this->statusesService->getStatusByHandle('open');

            if ($status) {
                return $status->id;
            }

            $statuses = $this->statusesService->getAllStatuses();
            $first = reset($statuses);

            return $first?->id ?? 1;
        } catch (\Throwable) {
            return 1;
        }
    }
}

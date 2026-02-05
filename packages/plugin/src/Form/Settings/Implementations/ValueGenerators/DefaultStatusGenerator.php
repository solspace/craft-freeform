<?php

namespace Solspace\Freeform\Form\Settings\Implementations\ValueGenerators;

use Solspace\Freeform\Attributes\Property\ValueGeneratorInterface;
use Solspace\Freeform\Services\StatusesService;

class DefaultStatusGenerator implements ValueGeneratorInterface
{
    public function __construct(private StatusesService $statusesService) {}

    public function generateValue(?object $referenceObject, ?object $context): int
    {
        // Skip DB work on CP GraphQL explorer
        $request = \Craft::$app->getRequest();
        if ($request->getIsCpRequest()) {
            $path = '/'.ltrim($request->getPathInfo(), '/');
            if (preg_match('#(^|/)graphiql(/|$)#', $path)) {
                return 0;
            }
        }

        try {
            $status = $this->statusesService->getStatusByHandle('open');
            if ($status) {
                return $status->id;
            }

            // fallback: get first status id if needed
            $statuses = $this->statusesService->getAllStatuses();
            $first = reset($statuses);

            return $first?->id ?? 1;
        } catch (\Throwable $e) {
            return 0;
        }
    }
}

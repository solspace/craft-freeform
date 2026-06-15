<?php

namespace Solspace\Freeform\Form\Settings\Implementations\ValueGenerators;

use Solspace\Freeform\Attributes\Property\ValueGeneratorInterface;
use Solspace\Freeform\Services\StatusesService;

class DefaultStatusGenerator implements ValueGeneratorInterface
{
    public function __construct(private StatusesService $statusesService) {}

    public function generateValue(?object $referenceObject, ?object $context): int
    {
        $request = \Craft::$app->getRequest();

        if ($request->getIsCpRequest()) {
            $path = '/'.ltrim($request->getPathInfo(), '/');

            // Avoid DB work only on the CP login page, where this value is not needed.
            if (preg_match('#^/login/?$#', $path)) {
                return 1;
            }

            // Skip DB work on CP GraphQL explorer.
            if (preg_match('#(^|/)graphiql(/|$)#', $path)) {
                return 1;
            }
        }

        try {
            $status = $this->statusesService->getStatusByHandle('open');

            if ($status) {
                return $status->id;
            }

            // Fallback: get first status ID if needed.
            $statuses = $this->statusesService->getAllStatuses();
            $first = reset($statuses);

            return $first?->id ?? 1;
        } catch (\Throwable) {
            return 1;
        }
    }
}

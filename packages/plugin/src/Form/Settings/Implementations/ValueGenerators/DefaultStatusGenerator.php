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

        // Avoid DB work before the CP user is authenticated, e.g. /admin/login.
        // This generator can be evaluated while Freeform/settings metadata is being bootstrapped.
        if ($request->getIsCpRequest() && \Craft::$app->getUser()->getIsGuest()) {
            return 0;
        }

        // Skip DB work on CP GraphQL explorer.
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

            // Fallback: get first status ID if needed.
            $statuses = $this->statusesService->getAllStatuses();
            $first = reset($statuses);

            return $first?->id ?? 1;
        } catch (\Throwable) {
            return 0;
        }
    }
}

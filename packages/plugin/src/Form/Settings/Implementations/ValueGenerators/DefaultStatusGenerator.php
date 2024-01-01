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
            return $this->statusesService->getDefaultStatusId();
        } catch (\Exception $e) {
            return 0;
        }
    }
}

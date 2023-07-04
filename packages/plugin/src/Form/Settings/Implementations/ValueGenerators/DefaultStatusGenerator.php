<?php

namespace Solspace\Freeform\Form\Settings\Implementations\ValueGenerators;

use Solspace\Freeform\Attributes\Property\Property;
use Solspace\Freeform\Attributes\Property\ValueGeneratorInterface;
use Solspace\Freeform\Services\StatusesService;

class DefaultStatusGenerator implements ValueGeneratorInterface
{
    public function __construct(private StatusesService $statusesService)
    {
    }

    public function generateValue(Property $property, string $class, ?object $referenceObject): int
    {
        return $this->statusesService->getDefaultStatusId();
    }
}

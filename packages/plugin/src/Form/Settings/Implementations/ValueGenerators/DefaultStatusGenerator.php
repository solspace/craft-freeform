<?php

namespace Solspace\Freeform\Form\Settings\Implementations\ValueGenerators;

use Solspace\Freeform\Attributes\Property\Property;
use Solspace\Freeform\Attributes\Property\PropertyTypes\ValueGeneratorInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Services\StatusesService;

class DefaultStatusGenerator implements ValueGeneratorInterface
{
    public function __construct(private StatusesService $statusesService)
    {
    }

    public function generateValue(Form $form, Property $property): int
    {
        return $this->statusesService->getDefaultStatusId();
    }
}

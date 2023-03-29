<?php

namespace Solspace\Freeform\Form\Settings\Implementations\Options;

use Solspace\Freeform\Attributes\Property\Property;
use Solspace\Freeform\Attributes\Property\PropertyTypes\Options\OptionCollection;
use Solspace\Freeform\Attributes\Property\PropertyTypes\Options\OptionFetcherInterface;
use Solspace\Freeform\Services\Form\TypesService;

class FormTypeOptions implements OptionFetcherInterface
{
    public function __construct(
        private TypesService $typesService
    ) {
    }

    public function fetchOptions(Property $property): OptionCollection
    {
        $options = new OptionCollection();

        $types = $this->typesService->getTypes();
        foreach ($types as $type) {
            $options->add($type['class'], $type['name']);
        }

        return $options;
    }
}

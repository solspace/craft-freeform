<?php

namespace Solspace\Freeform\Form\Settings\Implementations\Options;

use Solspace\Freeform\Attributes\Property\Property;
use Solspace\Freeform\Attributes\Property\PropertyTypes\OptionCollection;
use Solspace\Freeform\Attributes\Property\PropertyTypes\OptionFetcherInterface;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Services\Form\TypesService;

class FormTypeOptions implements OptionFetcherInterface
{
    public function __construct(
        private TypesService $typesService
    ) {
    }

    public function fetchOptions(Form $form, Property $property): OptionCollection
    {
        $options = new OptionCollection();

        $types = $this->typesService->getTypes();
        foreach ($types as $type) {
            $options->add($type['className'], $type['name']);
        }

        return $options;
    }
}

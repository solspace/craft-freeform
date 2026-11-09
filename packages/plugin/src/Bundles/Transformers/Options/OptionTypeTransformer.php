<?php

namespace Solspace\Freeform\Bundles\Transformers\Options;

use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Fields\Properties\Options\OptionTypeProviderInterface;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\OptionTypeIconHelper;

class OptionTypeTransformer
{
    public function __construct(
        private PropertyProvider $propertyProvider,
    ) {}

    public function transform(OptionTypeProviderInterface $sourceType): object
    {
        $properties = $this->propertyProvider->getEditableProperties($sourceType);

        return (object) [
            'name' => Freeform::t($sourceType->getName()),
            'typeClass' => $sourceType::class,
            'icon' => OptionTypeIconHelper::getSvg($sourceType::class),
            'properties' => $properties,
        ];
    }
}

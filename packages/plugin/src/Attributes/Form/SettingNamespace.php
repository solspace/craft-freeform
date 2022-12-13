<?php

namespace Solspace\Freeform\Attributes\Form;

use Solspace\Freeform\Library\DataObjects\FieldType\PropertyCollection;

#[\Attribute(\Attribute::TARGET_CLASS)]
class SettingNamespace
{
    public array $groups = [];

    public function __construct(
        public string $label,
        array $groups = [],
        public ?string $handle = null,
        public ?PropertyCollection $properties = null,
    ) {
        foreach ($groups as $groupHandle => $groupLabel) {
            $this->groups[] = [
                'handle' => $groupHandle,
                'label' => $groupLabel,
            ];
        }
    }
}

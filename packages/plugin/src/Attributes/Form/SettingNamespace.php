<?php

namespace Solspace\Freeform\Attributes\Form;

#[\Attribute(\Attribute::TARGET_CLASS)]
class SettingNamespace
{
    public function __construct(
        public string $label,
        public array $sections = [],
    ) {
    }
}

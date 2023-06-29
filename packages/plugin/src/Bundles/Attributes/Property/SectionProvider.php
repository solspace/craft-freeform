<?php

namespace Solspace\Freeform\Bundles\Attributes\Property;

use Solspace\Freeform\Attributes\Property\Section;
use Solspace\Freeform\Library\Helpers\AttributeHelper;

class SectionProvider
{
    public function getSections(...$classes): array
    {
        $list = [];

        foreach ($classes as $class) {
            $reflection = new \ReflectionClass($class);

            $properties = $reflection->getProperties();
            foreach ($properties as $property) {
                $section = AttributeHelper::findAttribute($property, Section::class);
                if (!$section) {
                    continue;
                }

                if (!$section->label || \array_key_exists($section->handle, $list)) {
                    continue;
                }

                $section->icon = $section->icon ? file_get_contents($section->icon) : null;

                $list[$section->handle] = $section;
            }
        }

        return array_values($list);
    }
}

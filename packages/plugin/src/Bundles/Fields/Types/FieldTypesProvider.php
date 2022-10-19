<?php

namespace Solspace\Freeform\Bundles\Fields\Types;

use Solspace\Freeform\Attributes\Field\Section;
use Solspace\Freeform\Library\DataObjects\FieldPropertySection;
use Solspace\Freeform\Library\DataObjects\FieldType;
use yii\base\Event;

class FieldTypesProvider
{
    public const EVENT_REGISTER_FIELD_TYPES = 'register-field-types';

    /** @var FieldType[] */
    private ?array $fieldTypes = null;

    /** @var FieldPropertySection[] */
    private ?array $sections = null;

    public function getRegisteredTypes(): array
    {
        $event = new RegisterFieldTypesEvent();
        Event::trigger(self::class, self::EVENT_REGISTER_FIELD_TYPES, $event);

        return $event->getTypes();
    }

    public function getSections(): array
    {
        if (null === $this->sections) {
            $types = $this->getRegisteredTypes();

            $list = [new Section(null, 'Configuration', 50)];
            foreach ($types as $type) {
                $reflection = new \ReflectionClass($type);

                $properties = $reflection->getProperties();
                foreach ($properties as $property) {
                    $sectionAttribute = $property->getAttributes(Section::class)[0] ?? null;
                    if (!$sectionAttribute) {
                        continue;
                    }

                    /** @var Section $section */
                    $section = $sectionAttribute->newInstance();
                    if (!$section->label || \array_key_exists($section->handle, $list)) {
                        continue;
                    }

                    $list[$section->handle] = $section;
                }
            }

            $this->sections = array_values($list);
        }

        return $this->sections;
    }

    public function getTypes(): array
    {
        if (null === $this->fieldTypes) {
            $types = $this->getRegisteredTypes();

            $this->fieldTypes = array_filter(
                array_map(
                    fn ($class) => new FieldType($class),
                    $types
                )
            );
        }

        return $this->fieldTypes;
    }

    public function getTypeShorthands(): array
    {
        return array_map(
            fn (FieldType $type) => $type->getType(),
            $this->getTypes()
        );
    }
}

<?php

namespace Solspace\Freeform\Bundles\Fields\Types;

use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Attributes\Property\Section;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Bundles\Attributes\Property\SectionProvider;
use Solspace\Freeform\Bundles\Fields\ImplementationProvider;
use Solspace\Freeform\Bundles\Form\Limiting\LimitedUsers\LimitedUserChecker;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Library\DataObjects\FieldPropertySection;
use Solspace\Freeform\Library\DataObjects\FieldType;
use Solspace\Freeform\Library\Exceptions\FieldExceptions\InvalidFieldTypeException;
use Solspace\Freeform\Library\Helpers\AttributeHelper;
use yii\base\Event;

class FieldTypesProvider
{
    public const EVENT_REGISTER_FIELD_TYPES = 'register-field-types';

    /** @var FieldType[] */
    private ?array $fieldTypes = null;

    /** @var FieldPropertySection[] */
    private ?array $sections = null;

    public function __construct(
        private PropertyProvider $propertyProvider,
        private ImplementationProvider $implementationProvider,
        private SectionProvider $sectionProvider,
        private LimitedUserChecker $checker,
    ) {}

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

            $list = $this->sectionProvider->getSections(...$types);

            $hasDefaultSection = false;
            foreach ($list as $section) {
                if (null === $section->handle) {
                    $hasDefaultSection = true;

                    break;
                }
            }

            if (!$hasDefaultSection) {
                $list = array_merge(
                    [
                        new Section(
                            null,
                            'Configuration',
                            file_get_contents(__DIR__.'/../../../Fields/SectionIcons/gears.svg'),
                            1
                        ),
                    ],
                    $list,
                );
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
                    fn ($class) => $this->createFieldType($class),
                    $types
                )
            );
        }

        return $this->fieldTypes;
    }

    public function getFieldType(string $class): ?FieldType
    {
        $types = $this->getTypes();
        foreach ($types as $type) {
            if ($type->typeClass === $class) {
                return $type;
            }
        }

        return null;
    }

    public function getTypeShorthands(): array
    {
        return array_map(
            fn (FieldType $type) => $type->getType(),
            $this->getTypes()
        );
    }

    private function createFieldType(string $typeClass): ?FieldType
    {
        $reflection = new \ReflectionClass($typeClass);
        if (!$reflection->implementsInterface(FieldInterface::class)) {
            return null;
        }

        $type = AttributeHelper::findAttribute($reflection, Type::class);
        if (!$type) {
            throw new InvalidFieldTypeException("Field type definition invalid for '{$typeClass}'");
        }

        $fieldType = new FieldType();
        $fieldType->typeClass = $typeClass;
        $fieldType->type = $type->typeShorthand;
        $fieldType->name = $type->name;
        $fieldType->icon = file_get_contents($type->iconPath);
        $fieldType->previewTemplate = $type->previewTemplatePath ? file_get_contents($type->previewTemplatePath) : null;
        $fieldType->implements = $this->implementationProvider->getImplementations($typeClass);
        $fieldType->properties = $this->propertyProvider->getEditableProperties($typeClass);
        $fieldType->visible = $this->checker->can('layout.fieldTypes', $fieldType->typeClass);

        return $fieldType;
    }
}

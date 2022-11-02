<?php

namespace Solspace\Freeform\Bundles\Fields;

use Solspace\Freeform\Attributes\Field\EditableProperty;
use Solspace\Freeform\Services\FormsService;
use Symfony\Component\PropertyAccess\PropertyAccessor;

class BuilderFieldProvider
{
    public function __construct(
        private FormsService $formsService,
    ) {
    }

    public function getFieldTypes(): array
    {
    }

    public function getFields(): array
    {
        $accessor = new PropertyAccessor();
        $form = $this->formsService->getFormById(1);

        $results = [];

        $fields = $form->getLayout()->getFields();
        foreach ($fields as $field) {
            $reflection = new \ReflectionClass($field);

            $properties = [];

            $reflectionProperties = $reflection->getProperties();
            foreach ($reflectionProperties as $property) {
                $attributes = $property->getAttributes(EditableProperty::class);
                if (!$attributes) {
                    continue;
                }

                /** @var EditableProperty $attribute */
                $attribute = $attributes[0]->newInstance();

                $properties[] = (object) [
                    'type' => $property->getType()->getName(),
                    'handle' => $property->getName(),
                    'label' => $attribute->label,
                    'instructions' => $attribute->instructions,
                    'value' => $accessor->getValue($field, $property->getName()) ?? $attribute->value,
                ];
            }

            $results[] = (object) [
                'id' => $field->getId(),
                'hash' => $field->getHash(),
                'handle' => $field->getHandle(),
                'label' => $field->getLabel(),
                'instructions' => $field->getInstructions(),
                'required' => $field->isRequired(),
                'properties' => $properties,
            ];
        }

        return $results;
    }
}

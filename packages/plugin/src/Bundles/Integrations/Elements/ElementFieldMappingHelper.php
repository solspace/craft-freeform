<?php

namespace Solspace\Freeform\Bundles\Integrations\Elements;

use craft\base\ElementInterface;
use craft\fields\BaseRelationField;
use craft\models\FieldLayout;
use Solspace\Freeform\Attributes\Property\Implementations\FieldMapping\FieldMapping;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Integrations\Types\Elements\ElementIntegrationInterface;
use Symfony\Component\PropertyAccess\PropertyAccessor;

class ElementFieldMappingHelper
{
    public function attachErrors(
        Form $form,
        ElementInterface $element,
        ElementIntegrationInterface $integration
    ): void {
        $errors = $element->getErrors();
        if (empty($errors)) {
            return;
        }

        $sourceToField = $this->getSourceToFieldMap($form, $integration);

        foreach ($errors as $craftField => $errorList) {
            if (isset($sourceToField[$craftField])) {
                $field = $sourceToField[$craftField];

                if ($form->getCurrentPage()->getFields()->has($field)) {
                    $field->addErrors($errorList);
                }
            } else {
                if ($form->isLastPage()) {
                    $form->addErrors($errorList);
                }
            }
        }
    }

    public function applyRelationships(
        Form $form,
        ElementInterface $element,
        ElementIntegrationInterface $integration
    ): void {
        $fieldLayout = $element->getFieldLayout();
        if (null === $fieldLayout) {
            $fieldLayout = new FieldLayout();
        }

        $sourceToField = $this->getSourceToFieldMap($form, $integration);
        $craftFields = [];
        foreach ($fieldLayout->getCustomFields() as $field) {
            $craftFields[$field->id] = $field;
        }

        foreach ($sourceToField as $source => $field) {
            $craftField = $craftFields[$source] ?? null;

            if (!$craftField instanceof BaseRelationField) {
                continue;
            }

            $value = $field->getValue();
            if (!\is_array($value)) {
                $value = [$value];
            }

            \Craft::$app->relations->saveRelations($craftField, $element, $value);
        }
    }

    private function getSourceToFieldMap(Form $form, ElementIntegrationInterface $integration): array
    {
        $propertyAccess = new PropertyAccessor();

        $reflection = new \ReflectionClass($integration);
        $mappingProperties = $reflection->getProperties();

        $sourceToField = [];
        foreach ($mappingProperties as $property) {
            if (FieldMapping::class !== $property->getType()->getName()) {
                continue;
            }

            /** @var FieldMapping $mapping */
            $mapping = $propertyAccess->getValue($integration, $property->getName());
            if (!$mapping) {
                continue;
            }

            foreach ($mapping->sourceToFieldUid() as $source => $uid) {
                $field = $form->get($uid);
                if ($field) {
                    $sourceToField[$source] = $field;
                }
            }
        }

        return $sourceToField;
    }
}

<?php

namespace Solspace\Freeform\Library\Processors;

use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Bundles\Fields\ImplementationProvider;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Library\Attributes\Attributes;
use Solspace\Freeform\Library\Helpers\AttributeHelper;
use yii\di\Container;

class FieldRenderOptionProcessor extends AbstractOptionProcessor
{
    public function process(array $renderOptions, FieldInterface $field): void
    {
        $implementationProvider = new ImplementationProvider();
        $meta = [
            ':required' => $field->isRequired(),
            ':errors' => $field->hasErrors(),
        ];

        $matchedOptions = [];
        foreach ($renderOptions as $key => $value) {
            if (preg_match('/^[@#:]/', $key)) {
                unset($renderOptions[$key]);
            }

            $targets = array_map('trim', explode(',', $key));

            $isMatching = false;
            if (\in_array($field->getHandle(), $targets, true)) {
                $isMatching = true;
            }
            if (\in_array('@'.$field->getType(), $targets, true)) {
                $isMatching = true;
            }
            if (\in_array('@global', $targets, true)) {
                $isMatching = true;
            }

            $implementations = $implementationProvider->getImplementations($field::class);
            foreach ($implementations as $implementation) {
                if (\in_array(':'.$implementation, $targets, true)) {
                    $isMatching = true;
                }
            }

            foreach ($meta as $handle => $shouldTrigger) {
                if ($shouldTrigger && \in_array($handle, $targets, true)) {
                    $isMatching = true;
                }
            }

            if ($isMatching) {
                $matchedOptions[] = $value;
            }
        }

        $fieldReflection = new \ReflectionClass($field);

        foreach ($matchedOptions as $options) {
            foreach ($options as $key => $value) {
                $this->processPropertyValue($fieldReflection, $field, $key, $value);
            }
        }
    }
}

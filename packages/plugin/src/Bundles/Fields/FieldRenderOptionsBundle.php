<?php

namespace Solspace\Freeform\Bundles\Fields;

use Solspace\Freeform\Events\Fields\CompileAttributesEvent;
use Solspace\Freeform\Events\Fields\SetParametersEvent;
use Solspace\Freeform\Events\Forms\SetPropertiesEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Attributes\Attributes;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Helpers\ReflectionHelper;
use Solspace\Freeform\Library\Processors\FieldRenderOptionProcessor;
use yii\base\Event;

class FieldRenderOptionsBundle extends FeatureBundle
{
    private const KEY_FORM_FIELD_PROPERTIES = 'fields';
    private const KEY_FORM_PROPERTY_STACK = 'formPropertyStack';
    private const KEY_FIELDS_PROPERTY_STACK = 'fieldsPropertyStack';

    public function __construct()
    {
        Event::on(
            FieldInterface::class,
            FieldInterface::EVENT_COMPILE_ATTRIBUTES,
            [$this, 'compileAttributes']
        );

        Event::on(
            Form::class,
            Form::EVENT_SET_PROPERTIES,
            [$this, 'processOptions']
        );

        Event::on(
            FieldInterface::class,
            FieldInterface::EVENT_SET_PARAMETERS,
            [$this, 'onSetParameters']
        );
    }

    public function compileAttributes(CompileAttributesEvent $event): void
    {
        $field = $event->getField();
        $form = $field->getForm();

        $bag = $form->getProperties();
        $formStack = $bag->get(self::KEY_FORM_PROPERTY_STACK) ?? [];
        $fieldsStack = $bag->get(self::KEY_FIELDS_PROPERTY_STACK)[$field->getId()] ?? [];

        if (!$formStack && !$fieldsStack) {
            return;
        }

        $attributes = $event->getAttributes();
        $processor = new FieldRenderOptionProcessor();

        foreach ($fieldsStack as $item) {
            $processor->processAttributes(['@global' => $item], $field, $attributes);
            $processor->processProperties(['@global' => $item], $field);
        }

        $formStack = array_reverse($formStack);
        foreach ($formStack as $item) {
            $processor->processAttributes($item, $field, $attributes);
            $processor->processProperties($item, $field);
        }

        $event->setAttributes($attributes);
    }

    public function processOptions(SetPropertiesEvent $event): void
    {
        $properties = $event->getProperties();
        if (!isset($properties[self::KEY_FORM_FIELD_PROPERTIES])) {
            return;
        }

        $props = $properties[self::KEY_FORM_FIELD_PROPERTIES];

        // Get the current property stack and add to the stack
        $form = $event->getForm();
        $stack = $form->getProperties()->get(self::KEY_FORM_PROPERTY_STACK, []);
        foreach ($stack as $stackItem) {
            if ($stackItem === $props) {
                return;
            }
        }

        $stack[] = $props;
        $form->getProperties()->set(self::KEY_FORM_PROPERTY_STACK, $stack);

        // Remove from current properties
        unset($properties[self::KEY_FORM_FIELD_PROPERTIES]);
        $event->setProperties($properties);
    }

    public function onSetParameters(SetParametersEvent $event): void
    {
        $field = $event->getField();
        $parameters = $event->getParameters();

        if (empty($parameters)) {
            return;
        }

        $form = $field->getForm();

        $fieldAttributes = $form->getProperties()->get(self::KEY_FIELDS_PROPERTY_STACK, []);
        $stack = $fieldAttributes[$field->getId()] ?? [];
        foreach ($stack as $item) {
            if ($item === $parameters) {
                return;
            }
        }

        $cleanParameters = [];
        $attributes = [];

        foreach ($parameters as $key => $value) {
            try {
                $property = new \ReflectionProperty($field, $key);

                $type = $property->getType()?->getName();
                if ($type) {
                    if (ReflectionHelper::isInstanceOf($type, Attributes::class)) {
                        $attributes[$key] = $value;
                        unset($parameters[$key]);

                        continue;
                    }
                }
            } catch (\ReflectionException $e) {
            }

            $cleanParameters[$key] = $value;
        }

        $stack[] = $attributes;
        $stack = array_filter($stack);

        $fieldAttributes[$field->getId()] = $stack;
        $fieldAttributes = array_filter($fieldAttributes);

        $form->getProperties()->set(self::KEY_FIELDS_PROPERTY_STACK, $fieldAttributes);

        $processor = new FieldRenderOptionProcessor();
        $processor->processProperties(['@global' => $cleanParameters], $field);

        $event->setParameters($cleanParameters);
    }
}

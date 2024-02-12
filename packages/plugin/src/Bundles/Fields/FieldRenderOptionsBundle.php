<?php

namespace Solspace\Freeform\Bundles\Fields;

use Solspace\Freeform\Events\Fields\CompileAttributesEvent;
use Solspace\Freeform\Events\Forms\SetPropertiesEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Processors\FieldRenderOptionProcessor;
use yii\base\Event;

class FieldRenderOptionsBundle extends FeatureBundle
{
    private const KEY_FIELD_PROPERTIES = 'fields';
    private const KEY_FIELD_PROPERTY_STACK = 'fieldPropertiesStack';

    private array $attributeCache = [];

    public function __construct()
    {
        Event::on(
            Form::class,
            Form::EVENT_SET_PROPERTIES,
            [$this, 'processOptions']
        );

        Event::on(
            FieldInterface::class,
            FieldInterface::EVENT_COMPILE_ATTRIBUTES,
            [$this, 'compileAttributes']
        );
    }

    public function compileAttributes(CompileAttributesEvent $event): void
    {
        $field = $event->getField();
        $form = $field->getForm();

        $bag = $form->getProperties();
        $stack = $bag->get(self::KEY_FIELD_PROPERTY_STACK);
        if (!$stack) {
            return;
        }

        $cacheKey = md5(json_encode($stack)).'-'.$field->getId();
        if (!isset($this->attributeCache[$cacheKey])) {
            $attributes = $event->getAttributes()->clone();
            $processor = new FieldRenderOptionProcessor();

            $stack = array_reverse($stack);
            foreach ($stack as $item) {
                $processor->processAttributes($item, $field, $attributes);
            }

            $this->attributeCache[$cacheKey] = $attributes;
        }

        $event->setAttributes($this->attributeCache[$cacheKey]);
    }

    public function processOptions(SetPropertiesEvent $event): void
    {
        $properties = $event->getProperties();
        if (!isset($properties[self::KEY_FIELD_PROPERTIES])) {
            return;
        }

        $props = $properties[self::KEY_FIELD_PROPERTIES];

        // Get the current property stack and add to the stack
        $form = $event->getForm();
        $stack = $form->getProperties()->get(self::KEY_FIELD_PROPERTY_STACK, []);
        foreach ($stack as $stackItem) {
            if ($stackItem === $props) {
                return;
            }
        }

        $processor = new FieldRenderOptionProcessor();
        foreach ($form->getFields() as $field) {
            $processor->processProperties($props, $field);
        }

        $stack[] = $props;
        $form->getProperties()->set(self::KEY_FIELD_PROPERTY_STACK, $stack);

        // Remove from current properties
        unset($properties[self::KEY_FIELD_PROPERTIES]);
        $event->setProperties($properties);
    }
}

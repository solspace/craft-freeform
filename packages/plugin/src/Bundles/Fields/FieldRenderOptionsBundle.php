<?php

namespace Solspace\Freeform\Bundles\Fields;

use Solspace\Freeform\Events\Forms\ContextRetrievalEvent;
use Solspace\Freeform\Events\Forms\SetPropertiesEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Processors\FieldRenderOptionProcessor;
use yii\base\Event;

class FieldRenderOptionsBundle extends FeatureBundle
{
    private const KEY_FIELD_PROPERTIES = 'fields';
    private const KEY_FIELD_PROPERTY_STACK = 'fieldPropertiesStack';

    public function __construct()
    {
        Event::on(
            Form::class,
            Form::EVENT_SET_PROPERTIES,
            [$this, 'processOptions']
        );

        Event::on(
            Form::class,
            Form::EVENT_CONTEXT_RETRIEVAL,
            [$this, 'processContextProperties']
        );
    }

    public function processContextProperties(ContextRetrievalEvent $event): void
    {
        $form = $event->getForm();
        $bag = $event->getBag();

        $properties = $bag->getProperties();
        if (!isset($properties[self::KEY_FIELD_PROPERTY_STACK])) {
            return;
        }

        $processor = new FieldRenderOptionProcessor();

        $stack = $properties[self::KEY_FIELD_PROPERTY_STACK];
        foreach ($form->getFields() as $field) {
            foreach ($stack as $item) {
                $processor->process($item, $field);
            }
        }
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
            $processor->process($props, $field);
        }

        $stack[] = $props;
        $form->getProperties()->set(self::KEY_FIELD_PROPERTY_STACK, $stack);

        // Remove from current properties
        unset($properties[self::KEY_FIELD_PROPERTIES]);
        $event->setProperties($properties);
    }
}

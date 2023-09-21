<?php

namespace Solspace\Freeform\Bundles\Fields;

use craft\helpers\ArrayHelper;
use Solspace\Freeform\Events\Forms\SetPropertiesEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Processors\FieldRenderOptionProcessor;
use yii\base\Event;

class FieldRenderOptionsBundle extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            Form::class,
            Form::EVENT_SET_PROPERTIES,
            [$this, 'processOptions']
        );
    }

    public function processOptions(SetPropertiesEvent $event): void
    {
        $form = $event->getForm();
        $properties = $event->getProperties();

        $formProperties = $form->getProperties()->get('fields', []);

        if (!isset($properties['fields'])) {
            return;
        }

        $processor = new FieldRenderOptionProcessor();
        foreach ($form->getFields() as $field) {
            $processor->process($properties['fields'], $field);
        }

        $formProperties = ArrayHelper::merge($formProperties, $properties['fields']);
        $form->getProperties()->merge(['fields' => $formProperties]);

        unset($properties['fields']);
        $event->setProperties($properties);
    }
}

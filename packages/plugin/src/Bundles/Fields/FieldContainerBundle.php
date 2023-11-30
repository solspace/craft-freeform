<?php

namespace Solspace\Freeform\Bundles\Fields;

use Solspace\Freeform\Events\Fields\FieldPropertiesEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class FieldContainerBundle extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            FieldInterface::class,
            FieldInterface::EVENT_AFTER_SET_PROPERTIES,
            [$this, 'updateContainerAttributes'],
        );
    }

    public function updateContainerAttributes(FieldPropertiesEvent $event): void
    {
        $field = $event->getField();
        $field
            ->getAttributes()
            ->getContainer()
            ->setIfEmpty('data-field-container', $field->getHandle())
        ;
    }
}

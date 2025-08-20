<?php

namespace Solspace\Freeform\Bundles\Fields\Implementations\CardsField;

use Solspace\Freeform\Events\Fields\CompileFieldAttributesEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\Pro\CardsField;
use Solspace\Freeform\Library\Attributes\FieldAttributesCollection;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class CardsFieldBundle extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            FieldInterface::class,
            FieldInterface::EVENT_COMPILE_ATTRIBUTES,
            [$this, 'updateContainerAttributes'],
        );
    }

    public function updateContainerAttributes(CompileFieldAttributesEvent $event): void
    {
        if (FieldAttributesCollection::class !== $event->getClass()) {
            return;
        }

        $field = $event->getField();
        if (!$field instanceof CardsField) {
            return;
        }

        if (!$field->getMaxSelectedValues()) {
            return;
        }

        $event
            ->getAttributes()
            ->getContainer()
            ->setIfEmpty('data-max-values', $field->getMaxSelectedValues())
        ;
    }
}

<?php

namespace Solspace\Freeform\Bundles\Fields\Implementations\MinLength;

use Solspace\Freeform\Events\Fields\CompileFieldAttributesEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Interfaces\MinLengthInterface;
use Solspace\Freeform\Library\Attributes\FieldAttributesCollection;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class MinLengthBundle extends FeatureBundle
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
        if (!$field instanceof MinLengthInterface) {
            return;
        }

        if (!$field->getMinLength()) {
            return;
        }

        $event
            ->getAttributes()
            ->getInput()
            ->setIfEmpty('minlength', $field->getMinLength())
        ;
    }
}

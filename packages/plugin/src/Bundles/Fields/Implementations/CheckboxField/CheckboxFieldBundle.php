<?php

namespace Solspace\Freeform\Bundles\Fields\Implementations\CheckboxField;

use Solspace\Freeform\Events\Fields\TransformValueEvent;
use Solspace\Freeform\Fields\CheckboxField;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Composer\Components\FieldInterface;
use yii\base\Event;

class CheckboxFieldBundle extends FeatureBundle
{
    public function __construct()
    {
        Event::on(FieldInterface::class, FieldInterface::EVENT_TRANSFORM_FROM_POST, [$this, 'handleTransform']);
        Event::on(FieldInterface::class, FieldInterface::EVENT_TRANSFORM_FROM_STORAGE, [$this, 'handleTransform']);
    }

    public function handleTransform(TransformValueEvent $event)
    {
        $field = $event->getField();
        if (!$field instanceof CheckboxField) {
            return;
        }

        $event->setValue($event->getValue() ? $field->getDefaultValue() : '');
    }
}

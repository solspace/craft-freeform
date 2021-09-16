<?php

namespace Solspace\Freeform\Bundles\Form\Fields\CheckboxField;

use Solspace\Freeform\Events\Fields\TransformValueEvent;
use Solspace\Freeform\Fields\CheckboxField;
use Solspace\Freeform\Library\Bundles\BundleInterface;
use Solspace\Freeform\Library\Composer\Components\FieldInterface;
use yii\base\Event;

class CheckboxFieldBundle implements BundleInterface
{
    public function __construct()
    {
        Event::on(FieldInterface::class, FieldInterface::EVENT_TRANSFORM_FROM_POST, [$this, 'handleTransform']);
    }

    public function handleTransform(TransformValueEvent $event)
    {
        if (!$event instanceof CheckboxField) {
            return;
        }

        $event->setValue((bool) $event->getValue());
    }
}

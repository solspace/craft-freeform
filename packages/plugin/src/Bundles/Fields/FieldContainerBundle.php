<?php

namespace Solspace\Freeform\Bundles\Fields;

use Solspace\Freeform\Events\Fields\CompileAttributesEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class FieldContainerBundle extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            FieldInterface::class,
            FieldInterface::EVENT_COMPILE_ATTRIBUTES,
            [$this, 'updateContainerAttributes'],
        );
    }

    public function updateContainerAttributes(CompileAttributesEvent $event): void
    {
        $request = \Craft::$app->request;
        if ($request && $request->isCpRequest) {
            $isFreeform = 'freeform' === $request->getSegment(1);
            $isApi = 'api' === $request->getSegment(2);
            $isForms = 'forms' === $request->getSegment(3);

            if ($isFreeform && $isApi && $isForms) {
                return;
            }
        }

        $field = $event->getField();
        $event
            ->getAttributes()
            ->getContainer()
            ->replace('data-field-container', $field->getHandle())
            ->replace('data-field-type', $field->getType())
        ;
    }
}

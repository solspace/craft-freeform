<?php

namespace Solspace\Freeform\Bundles\Fields;

use Solspace\Freeform\Events\Fields\CompileFieldAttributesEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Library\Attributes\FieldAttributesCollection;
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

    public function updateContainerAttributes(CompileFieldAttributesEvent $event): void
    {
        if (FieldAttributesCollection::class !== $event->getClass()) {
            return;
        }

        $field = $event->getField();
        $request = \Craft::$app->request;
        if ($request && $request->isCpRequest) {
            $isFreeform = 'freeform' === $request->getSegment(1);
            $isApi = 'api' === $request->getSegment(2);
            $isForms = 'forms' === $request->getSegment(3);

            // Builder metadata omits frontend hooks, but the rendered Preview
            // needs them for template styling and conditional field behavior.
            if ($isFreeform && $isApi && $isForms && !$field->getForm()->isPreview()) {
                return;
            }
        }

        $event
            ->getAttributes()
            ->getContainer()
            ->replace('data-field-container', $field->getHandle())
            ->replace('data-field-type', $field->getType())
        ;
    }
}

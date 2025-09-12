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

        /** @var FieldAttributesCollection $attributes */
        $attributes = $event->getAttributes();

        $attributes
            ->getContainer()
            ->replace('data-field-container', $field->getHandle())
            ->replace('data-field-type', $field->getType())
        ;

        $attributes
            ->getLabel()
            ->replace('data-field-label', $field->getHandle())
        ;

        $attributes
            ->getInput()
            ->replace('data-field-handle', $field->getHandle())
        ;

        $attributes
            ->getInstructions()
            ->replace('data-field-instructions', $field->getHandle())
        ;

        $attributes
            ->getError()
            ->replace('data-field-errors', $field->getHandle())
        ;
    }
}

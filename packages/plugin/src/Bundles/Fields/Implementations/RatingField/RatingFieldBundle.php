<?php

namespace Solspace\Freeform\Bundles\Fields\Implementations\RatingField;

use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Fields\CompileFieldAttributesEvent;
use Solspace\Freeform\Events\Submissions\RenderTableValueEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\Pro\RatingField;
use Solspace\Freeform\Library\Attributes\FieldAttributesCollection;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class RatingFieldBundle extends FeatureBundle
{
    public function __construct()
    {
        Event::on(Submission::class, Submission::EVENT_RENDER_TABLE_VALUE, [$this, 'renderTableValue']);
        Event::on(FieldInterface::class, FieldInterface::EVENT_COMPILE_ATTRIBUTES, [$this, 'compileAttributes']);
    }

    public function compileAttributes(CompileFieldAttributesEvent $event): void
    {
        if (FieldAttributesCollection::class !== $event->getClass()) {
            return;
        }

        $field = $event->getField();
        if (!$field instanceof RatingField) {
            return;
        }

        $event
            ->getAttributes()
            ->getContainer()
            ->setIfEmpty('data-color-idle', $field->getColorIdle())
            ->setIfEmpty('data-color-hover', $field->getColorHover())
            ->setIfEmpty('data-color-selected', $field->getColorSelected())
        ;
    }

    public function renderTableValue(RenderTableValueEvent $event): void
    {
        $field = $event->getField();
        if (!$field instanceof RatingField) {
            return;
        }

        $event->setOutput(((int) $field->getValue()).'/'.$field->getMaxValue());
    }
}

<?php

namespace Solspace\Freeform\Bundles\Fields\Implementations\RatingField;

use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Fields\CompileFieldAttributesEvent;
use Solspace\Freeform\Events\Forms\RenderTagEvent;
use Solspace\Freeform\Events\Submissions\RenderTableValueEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\Pro\RatingField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Attributes\FieldAttributesCollection;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class RatingFieldBundle extends FeatureBundle
{
    public function __construct()
    {
        Event::on(Submission::class, Submission::EVENT_RENDER_TABLE_VALUE, [$this, 'renderTableValue']);
        Event::on(Form::class, Form::EVENT_RENDER_BEFORE_CLOSING_TAG, [$this, 'attachStylesAndScripts']);
        Event::on(FieldInterface::class, FieldInterface::EVENT_COMPILE_ATTRIBUTES, [$this, 'compileAttributes']);
    }

    public function attachStylesAndScripts(RenderTagEvent $event): void
    {
        if (!$event->isGenerateTag()) {
            return;
        }

        $form = $event->getForm();
        if (!$form->getLayout()->hasFields(RatingField::class)) {
            return;
        }

        $stylesheet = \Yii::getAlias('@freeform-resources/css/front-end/fields/rating.css');

        $event->addStylesheet($stylesheet);
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

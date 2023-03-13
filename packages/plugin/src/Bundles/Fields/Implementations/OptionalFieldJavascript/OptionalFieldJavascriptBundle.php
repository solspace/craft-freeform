<?php

namespace Solspace\Freeform\Bundles\Fields\Implementations\OptionalFieldJavascript;

use Solspace\Freeform\Events\Forms\AttachFormAttributesEvent;
use Solspace\Freeform\Fields\Implementations\Pro\DatetimeField;
use Solspace\Freeform\Fields\Implementations\Pro\PhoneField;
use Solspace\Freeform\Fields\Implementations\Pro\SignatureField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class OptionalFieldJavascriptBundle extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            Form::class,
            Form::EVENT_ATTACH_TAG_ATTRIBUTES,
            function (AttachFormAttributesEvent $event) {
                $form = $event->getForm();

                foreach ($form->getLayout()->getFields() as $field) {
                    if ($field instanceof DatetimeField && $field->isUseDatepicker()) {
                        $event->attachAttribute('data-scripts-datepicker', true);
                    }

                    if ($field instanceof PhoneField && $field->isUseJsMask()) {
                        $event->attachAttribute('data-scripts-js-mask', true);
                    }

                    if ($field instanceof SignatureField) {
                        $event->attachAttribute('data-scripts-signature', true);
                    }
                }
            }
        );
    }
}

<?php

namespace Solspace\Freeform\Bundles\Form\Fields\OptionalFieldJavascript;

use Solspace\Freeform\Events\Forms\AttachFormAttributesEvent;
use Solspace\Freeform\Fields\Pro\DatetimeField;
use Solspace\Freeform\Fields\Pro\PhoneField;
use Solspace\Freeform\Fields\Pro\SignatureField;
use Solspace\Freeform\Library\Bundles\BundleInterface;
use Solspace\Freeform\Services\FormsService;
use yii\base\Event;

class OptionalFieldJavascriptBundle implements BundleInterface
{
    public function __construct()
    {
        Event::on(
            FormsService::class,
            FormsService::EVENT_ATTACH_FORM_ATTRIBUTES,
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

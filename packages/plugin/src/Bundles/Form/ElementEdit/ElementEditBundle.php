<?php

namespace Solspace\Freeform\Bundles\Form\ElementEdit;

use Solspace\Freeform\Events\Forms\RenderTagEvent;
use Solspace\Freeform\Events\Forms\StoreSubmissionEvent;
use Solspace\Freeform\Events\Forms\UpdateAttributesEvent;
use Solspace\Freeform\Fields\EmailField;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\BundleInterface;
use Solspace\Freeform\Library\Composer\Components\Form;
use yii\base\Event;
use yii\base\UnknownPropertyException;

class ElementEditBundle implements BundleInterface
{
    public function __construct()
    {
        Event::on(
            Form::class,
            Form::EVENT_RENDER_AFTER_OPEN_TAG,
            [$this, 'addElementToFormTag']
        );

        Event::on(
            Form::class,
            Form::EVENT_ON_STORE_SUBMISSION,
            [$this, 'handleElementSaving']
        );

        Event::on(
            Form::class,
            Form::EVENT_UPDATE_ATTRIBUTES,
            [$this, 'populateFormWithElementValues']
        );
    }

    public function populateFormWithElementValues(UpdateAttributesEvent $event)
    {
        $form = $event->getForm();
        $elementId = $form->getCustomAttributes()->getElementId();

        if (null === $elementId || !Freeform::getInstance()->isPro()) {
            return;
        }

        $form->disableAjaxReset();

        $connectionList = $form->getConnectionProperties()->getList();
        $connection = reset($connectionList);

        if (!$elementId || !$connection) {
            return;
        }

        $mapping = $connection->getMapping();
        $element = \Craft::$app->elements->getElementById($elementId);
        if (!$element) {
            return;
        }

        foreach ($mapping as $elementField => $ffField) {
            $field = $form->get($ffField);
            if (!$field) {
                continue;
            }

            $hasPostValue = isset($_POST[$ffField]);
            if (!$hasPostValue && isset($element->{$elementField})) {
                $field->setValue($element->{$elementField});
            }
        }
    }

    public function addElementToFormTag(RenderTagEvent $event)
    {
        $form = $event->getForm();
        $element = $form->getCustomAttributes()->getElementId();
        if (!$element) {
            return;
        }

        $event->addChunk(
            '<input type="hidden" '
            .'name="'.Form::ELEMENT_ID_KEY.'"'
            .'value="'.base64_encode(\Craft::$app->security->encryptByKey($element)).'" '
            .'/>'
        );
    }

    public function handleElementSaving(StoreSubmissionEvent $event)
    {
        $form = $event->getForm();

        $elementId = $form->getEditableElementId();
        if (!$elementId) {
            return;
        }

        // Prevent the original submission from saving
        $event->isValid = false;
        $form->enableSuppression();

        $elementId = \Craft::$app->security->decryptByKey(base64_decode($elementId));
        $element = \Craft::$app->elements->getElementById($elementId);
        if (!$element) {
            return;
        }

        $connectionList = $form->getConnectionProperties()->getList();
        $connection = reset($connectionList);

        if (!$connection) {
            return;
        }

        $mapping = $connection->getMapping();
        foreach ($mapping as $craftField => $ffField) {
            $field = $form->get($ffField);
            if ($field) {
                if ($field instanceof EmailField) {
                    $value = $field->getValueAsString();
                } else {
                    $value = $field->getValue();
                }

                try {
                    $element->setFieldValue($craftField, $value);
                } catch (UnknownPropertyException $e) {
                    $element->{$craftField} = $value;
                }
            }
        }

        \Craft::$app->elements->saveElement($element);
    }
}

<?php

namespace Solspace\Freeform\Bundles\Form\ElementEdit;

use Solspace\Freeform\Events\Forms\RenderTagEvent;
use Solspace\Freeform\Events\Forms\SetPropertiesEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\BundleInterface;
use Solspace\Freeform\Library\Composer\Components\Form;
use yii\base\Event;

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
            Form::EVENT_SET_PROPERTIES,
            [$this, 'populateFormWithElementValues']
        );
    }

    public static function getDecryptedElementId(string $encryptedElementId)
    {
        return \Craft::$app->security->decryptByKey(base64_decode($encryptedElementId));
    }

    public function populateFormWithElementValues(SetPropertiesEvent $event)
    {
        $form = $event->getForm();
        $elementId = $form->getPropertyBag()->get('elementId');

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
        $element = $form->getPropertyBag()->get('elementId');
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
}

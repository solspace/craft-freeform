<?php

namespace Solspace\Freeform\Bundles\Form\ElementEdit;

use craft\elements\db\ElementQuery;
use craft\fields\data\MultiOptionsFieldData;
use Solspace\Freeform\Events\FormEventInterface;
use Solspace\Freeform\Fields\Interfaces\MultiValueInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class ElementEditBundle extends FeatureBundle
{
    public const ELEMENT_KEY = 'elementId';

    public function __construct()
    {
        Event::on(
            Form::class,
            Form::EVENT_REGISTER_CONTEXT,
            [$this, 'populateFormWithElementValues']
        );
    }

    public static function getElementId(Form $form)
    {
        return $form->getPropertyBag()->get(self::ELEMENT_KEY);
    }

    public function populateFormWithElementValues(FormEventInterface $event)
    {
        $form = $event->getForm();
        $elementId = self::getElementId($form);

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
                $value = $element->{$elementField};
                if ($value instanceof MultiOptionsFieldData) {
                    $options = $value->getOptions();

                    if ($field instanceof MultiValueInterface) {
                        $values = [];
                        foreach ($options as $option) {
                            if ($option->selected) {
                                $values[] = $option->value;
                            }
                        }

                        $value = $values;
                    } else {
                        $firstOption = reset($options);
                        if ($firstOption) {
                            $value = $firstOption->selected ? $firstOption->value : '';
                        } else {
                            $value = '';
                        }
                    }
                }

                if ($value instanceof ElementQuery) {
                    $value = $value->ids();
                }

                if ($field instanceof SingleValueInterface && \is_array($value)) {
                    $value = reset($value);
                }

                $field->setValue($value);
            }
        }
    }
}

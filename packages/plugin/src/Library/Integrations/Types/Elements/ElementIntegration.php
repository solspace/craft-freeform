<?php

namespace Solspace\Freeform\Library\Integrations\Types\Elements;

use craft\base\Element;
use craft\base\ElementInterface;
use craft\models\FieldLayout;
use Solspace\Freeform\Attributes\Property\Implementations\FieldMapping\FieldMapItem;
use Solspace\Freeform\Attributes\Property\Implementations\FieldMapping\FieldMapping;
use Solspace\Freeform\Bundles\Form\ElementEdit\ElementEditBundle;
use Solspace\Freeform\Events\Integrations\ElementIntegrations\ProcessValueEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Integrations\BaseIntegration;
use yii\base\Event;

abstract class ElementIntegration extends BaseIntegration implements ElementIntegrationInterface
{
    public function onValidate(Form $form, Element $element): void {}

    public function onBeforeConnect(Form $form, Element $element): void {}

    public function onAfterConnect(Form $form, Element $element): void {}

    protected function getAssignedFormElement(Form $form): ?ElementInterface
    {
        $element = null;
        $elementId = ElementEditBundle::getElementId($form);
        if ($elementId) {
            $element = \Craft::$app->elements->getElementById($elementId);
        }

        return $element;
    }

    protected function processMapping(ElementInterface $element, Form $form, ?FieldMapping $mapping = null): void
    {
        if (null === $mapping) {
            return;
        }

        $fieldLayout = $element->getFieldLayout();
        if (!$fieldLayout) {
            $fieldLayout = new FieldLayout();
        }

        $customFields = $fieldLayout->getCustomFields();
        foreach ($mapping as $item) {
            $craftField = null;
            foreach ($customFields as $field) {
                if ((int) $field->id === (int) $item->getSource()) {
                    $craftField = $field;

                    break;
                }
            }

            $freeformField = null;
            if (FieldMapItem::TYPE_RELATION === $item->getType()) {
                $freeformField = $form->get($item->getValue());
            }

            $key = $item->getSource();
            $value = $item->extractValue($form);

            $event = new ProcessValueEvent(
                $this,
                $form,
                $craftField,
                $freeformField,
                $key,
                $value
            );

            Event::trigger(
                ElementIntegrationInterface::class,
                ElementIntegrationInterface::EVENT_PROCESS_VALUE,
                $event
            );

            if ($craftField) {
                $element->setFieldValue($craftField->handle, $event->getValue());
            } else {
                $element->{$key} = $event->getValue();
            }
        }
    }
}

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
    public function getType(): string
    {
        return self::TYPE_ELEMENTS;
    }

    public function onValidate(Form $form, Element $element): void
    {
    }

    public function onBeforeConnect(Form $form, Element $element): void
    {
    }

    public function onAfterConnect(Form $form, Element $element): void
    {
    }

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

        foreach ($mapping as $item) {
            $craftField = $fieldLayout->getFieldByHandle($item->getSource());
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

            $handle = $key;
            if (is_numeric($key)) {
                foreach ($fieldLayout->getCustomFields() as $field) {
                    if ((int) $field->id === (int) $key) {
                        $handle = $field->handle;

                        break;
                    }
                }
            }

            $element->{$handle} = $event->getValue();
        }
    }
}

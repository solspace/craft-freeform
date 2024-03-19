<?php

namespace Solspace\Freeform\Bundles\Form\ElementEdit;

use craft\elements\db\ElementQuery;
use craft\fields\data\MultiOptionsFieldData;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Implementations\FieldMapping\FieldMapItem;
use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Events\FormEventInterface;
use Solspace\Freeform\Fields\Interfaces\MultiValueInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Integrations\Types\Elements\ElementIntegration;
use yii\base\Event;

class ElementEditBundle extends FeatureBundle
{
    public const ELEMENT_KEY = 'elementId';

    public function __construct(
        private FormIntegrationsProvider $integrationsProvider,
    ) {
        Event::on(
            Form::class,
            Form::EVENT_REGISTER_CONTEXT,
            [$this, 'populateFormWithElementValues']
        );
    }

    public static function getPriority(): int
    {
        return 1500;
    }

    public static function getElementId(Form $form)
    {
        return $form->getProperties()->get(self::ELEMENT_KEY);
    }

    public function populateFormWithElementValues(FormEventInterface $event): void
    {
        $form = $event->getForm();
        $elementId = self::getElementId($form);

        if (null === $elementId || !$this->plugin()->isPro()) {
            return;
        }

        $form->disableAjaxReset();

        /** @var ElementIntegration[] $integrations */
        $integrations = $this->integrationsProvider->getForForm($form, Type::TYPE_ELEMENTS);
        $integration = $fieldMapping = $attributeMapping = null;
        foreach ($integrations as $instance) {
            $fieldMapping = $instance->getFieldMapping();
            $attributeMapping = $instance->getAttributeMapping();
            if ($instance->isEnabled() && ($fieldMapping || $attributeMapping)) {
                $integration = $instance;

                break;
            }
        }

        if (!$elementId || !$integration) {
            return;
        }

        $element = \Craft::$app->elements->getElementById($elementId);
        if (!$element) {
            return;
        }

        foreach ($attributeMapping as $item) {
            if (FieldMapItem::TYPE_RELATION !== $item->getType()) {
                continue;
            }

            $value = $element->{$item->getSource()};
            $field = $form->get($item->getValue());
            if (!$field) {
                continue;
            }

            $field->setValue($value);
        }

        $customFields = $element->getFieldLayout()->getCustomFields();
        foreach ($fieldMapping as $item) {
            if (FieldMapItem::TYPE_RELATION !== $item->getType()) {
                continue;
            }

            $craftField = null;
            foreach ($customFields as $field) {
                if ((int) $field->id === (int) $item->getSource()) {
                    $craftField = $field;

                    break;
                }
            }

            if (!$craftField) {
                continue;
            }

            $value = $element->getFieldValue($craftField->handle);
            $field = $form->get($item->getValue());
            if (!$field) {
                continue;
            }

            if ($value instanceof MultiOptionsFieldData) {
                $options = $value->getOptions();

                $values = [];
                foreach ($options as $option) {
                    if ($option->selected) {
                        $values[] = $option->value;
                    }
                }

                if (!$field instanceof MultiValueInterface) {
                    $value = implode(', ', $values);
                }
            }

            if ($value instanceof ElementQuery) {
                $value = $value->ids();
            }

            if (!$field instanceof MultiValueInterface && \is_array($value)) {
                $value = implode(', ', $value);
            }

            $field->setValue($value);
        }
    }
}

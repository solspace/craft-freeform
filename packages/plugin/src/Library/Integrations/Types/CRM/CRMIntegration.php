<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2022, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Library\Integrations\Types\CRM;

use Solspace\Freeform\Attributes\Property\Implementations\FieldMapping\FieldMapping;
use Solspace\Freeform\Events\Integrations\CrmIntegrations\ProcessValueEvent;
use Solspace\Freeform\Fields\AbstractField;
use Solspace\Freeform\Fields\Implementations\Pro\DatetimeField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Integrations\APIIntegration;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use yii\base\Event;

abstract class CRMIntegration extends APIIntegration implements CRMIntegrationInterface
{
    public function getType(): string
    {
        return self::TYPE_CRM;
    }

    public function convertCustomFieldValue(FieldObject $fieldObject, AbstractField $field)
    {
        if (FieldObject::TYPE_ARRAY === $fieldObject->getType()) {
            $value = $field->getValue();
        } else {
            $value = $field->getValueAsString(false);
        }

        switch ($fieldObject->getType()) {
            case FieldObject::TYPE_NUMERIC:
                return (int) preg_replace('/\D/', '', $value) ?: '';

            case FieldObject::TYPE_FLOAT:
                return (float) preg_replace('/[^0-9,.]/', '', $value) ?: '';

            case FieldObject::TYPE_DATE:
                if ($field instanceof DatetimeField) {
                    $carbon = $field->getCarbon();
                    if ($carbon) {
                        return $carbon->toDateString();
                    }
                }

                return (string) $value;

            case FieldObject::TYPE_DATETIME:
                if ($field instanceof DatetimeField) {
                    $carbon = $field->getCarbon();
                    if ($carbon) {
                        return $carbon->toAtomString();
                    }
                }

                return (string) $value;

            case FieldObject::TYPE_TIMESTAMP:
            case FieldObject::TYPE_MICROTIME:
                if ($field instanceof DatetimeField) {
                    $carbon = $field->getCarbonUtc();
                    if ($carbon) {
                        if (DatetimeField::DATETIME_TYPE_DATE === $field->getDateTimeType()) {
                            $carbon->setTime(0, 0);
                        }

                        $timestamp = $carbon->getTimestamp();
                        if (FieldObject::TYPE_MICROTIME === $fieldObject->getType()) {
                            $timestamp *= 1000;
                        }

                        return $timestamp;
                    }
                }

                return (int) $value;

            case FieldObject::TYPE_BOOLEAN:
                return (bool) $value;

            case FieldObject::TYPE_ARRAY:
                if (!\is_array($value)) {
                    $value = [$value];
                }

                return $value;

            case FieldObject::TYPE_STRING:
            default:
                return (string) $value;
        }
    }

    protected function processMapping(Form $form, ?FieldMapping $mapping, string $category): array
    {
        $fields = Freeform::getInstance()->crm->getFields($this, $category);

        if (null === $mapping) {
            return [];
        }

        $keyValueMap = [];
        foreach ($mapping as $item) {
            $integrationField = $fields[$item->getSource()] ?? null;
            if (!$integrationField || '' === $item->getValue()) {
                continue;
            }

            $freeformField = $form->get($item->getValue());

            $key = $item->getSource();
            $value = $item->extractValue(
                $form,
                ['integration' => $this, 'category' => $category]
            );

            $event = new ProcessValueEvent(
                $this,
                $form,
                $integrationField,
                $freeformField,
                $value
            );

            Event::trigger(
                CRMIntegrationInterface::class,
                CRMIntegrationInterface::EVENT_PROCESS_VALUE,
                $event
            );

            $keyValueMap[$key] = $event->getValue();
        }

        return array_filter($keyValueMap);
    }
}

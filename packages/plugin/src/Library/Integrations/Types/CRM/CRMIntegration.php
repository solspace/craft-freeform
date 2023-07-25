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
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Integrations\APIIntegration;
use yii\base\Event;

abstract class CRMIntegration extends APIIntegration implements CRMIntegrationInterface
{
    public function getType(): string
    {
        return self::TYPE_CRM;
    }

    protected function processMapping(Form $form, FieldMapping $mapping, string $category): array
    {
        $fields = Freeform::getInstance()->crm->getFields($this, $category);

        $keyValueMap = [];
        foreach ($mapping as $item) {
            $integrationField = $fields[$item->getSource()] ?? null;
            if (!$integrationField) {
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

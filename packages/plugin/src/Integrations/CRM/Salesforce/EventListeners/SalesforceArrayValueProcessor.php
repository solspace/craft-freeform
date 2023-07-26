<?php

namespace Solspace\Freeform\Integrations\CRM\Salesforce\EventListeners;

use Solspace\Freeform\Events\Integrations\CrmIntegrations\ProcessValueEvent;
use Solspace\Freeform\Integrations\CRM\Salesforce\SalesforceIntegrationInterface;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\Types\CRM\CRMIntegrationInterface;
use yii\base\Event;

class SalesforceArrayValueProcessor
{
    public function __construct()
    {
        Event::on(
            CRMIntegrationInterface::class,
            CRMIntegrationInterface::EVENT_PROCESS_VALUE,
            [$this, 'processValue']
        );
    }

    public function processValue(ProcessValueEvent $event): void
    {
        if (!$event->getIntegration() instanceof SalesforceIntegrationInterface) {
            return;
        }

        $integrationField = $event->getIntegrationField();
        if (FieldObject::TYPE_ARRAY !== $integrationField->getType()) {
            return;
        }

        $value = $event->getValue();
        if (!\is_array($value)) {
            return;
        }

        $value = implode(';', $value);
        $event->setValue($value);
    }
}

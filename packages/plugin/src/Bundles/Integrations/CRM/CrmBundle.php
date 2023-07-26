<?php

namespace Solspace\Freeform\Bundles\Integrations\CRM;

use Composer\Autoload\ClassMapGenerator;
use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Integrations\CrmIntegrations\ProcessValueEvent;
use Solspace\Freeform\Events\Integrations\RegisterIntegrationTypesEvent;
use Solspace\Freeform\Events\Submissions\ProcessSubmissionEvent;
use Solspace\Freeform\Fields\Implementations\Pro\DatetimeField;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use Solspace\Freeform\Library\Integrations\Types\CRM\CRMIntegrationInterface;
use Solspace\Freeform\Services\Integrations\IntegrationsService;
use yii\base\Event;

class CrmBundle extends FeatureBundle
{
    public function __construct(private FormIntegrationsProvider $formIntegrationsProvider)
    {
        if (!Freeform::getInstance()->isPro()) {
            return;
        }

        Event::on(
            IntegrationsService::class,
            IntegrationsService::EVENT_REGISTER_INTEGRATION_TYPES,
            [$this, 'registerTypes']
        );

        Event::on(
            Submission::class,
            Submission::EVENT_PROCESS_SUBMISSION,
            [$this, 'handleIntegrations']
        );

        Event::on(
            CRMIntegrationInterface::class,
            CRMIntegrationInterface::EVENT_PROCESS_VALUE,
            [$this, 'processValue']
        );
    }

    public function registerTypes(RegisterIntegrationTypesEvent $event): void
    {
        $path = \Craft::getAlias('@freeform/Integrations/CRM');

        $classMap = ClassMapGenerator::createMap($path);
        $classes = array_keys($classMap);

        foreach ($classes as $class) {
            $event->addType($class);
        }
    }

    public function handleIntegrations(ProcessSubmissionEvent $event): void
    {
        if (!$event->isValid) {
            return;
        }

        $form = $event->getForm();
        if (!$form->hasOptInPermission()) {
            return;
        }

        /** @var CRMIntegrationInterface[] $integrations */
        $integrations = $this->formIntegrationsProvider->getForForm($form, IntegrationInterface::TYPE_CRM);
        foreach ($integrations as $integration) {
            if (!$integration->isEnabled()) {
                continue;
            }

            $integration->push($form);
        }
    }

    public function processValue(ProcessValueEvent $event)
    {
        $integrationField = $event->getIntegrationField();
        $freeformField = $event->getFreeformField();
        $value = $event->getValue();

        if (FieldObject::TYPE_ARRAY !== $integrationField->getType() && \is_array($value)) {
            $value = implode(', ', $value);
        }

        switch ($integrationField->getType()) {
            case FieldObject::TYPE_ARRAY:
                if (!\is_array($value)) {
                    if (!empty($value)) {
                        $value = [$value];
                    } else {
                        $value = [];
                    }
                }

                return $value;

            case FieldObject::TYPE_NUMERIC:
                return (int) preg_replace('/\D/', '', $value) ?: '';

            case FieldObject::TYPE_FLOAT:
                return (float) preg_replace('/[^0-9,.]/', '', $value) ?: '';

            case FieldObject::TYPE_DATE:
                if ($freeformField instanceof DatetimeField) {
                    $carbon = $freeformField->getCarbon();
                    if ($carbon) {
                        return $carbon->toDateString();
                    }
                }

                return (string) $value;

            case FieldObject::TYPE_DATETIME:
                if ($freeformField instanceof DatetimeField) {
                    $carbon = $freeformField->getCarbon();
                    if ($carbon) {
                        return $carbon->toAtomString();
                    }
                }

                return (string) $value;

            case FieldObject::TYPE_TIMESTAMP:
            case FieldObject::TYPE_MICROTIME:
                if ($freeformField instanceof DatetimeField) {
                    $carbon = $freeformField->getCarbonUtc();
                    if ($carbon) {
                        if (DatetimeField::DATETIME_TYPE_DATE === $freeformField->getDateTimeType()) {
                            $carbon->setTime(0, 0);
                        }

                        $timestamp = $carbon->getTimestamp();
                        if (FieldObject::TYPE_MICROTIME === $integrationField->getType()) {
                            $timestamp *= 1000;
                        }

                        return $timestamp;
                    }
                }

                return (int) $value;

            case FieldObject::TYPE_BOOLEAN:
                return (bool) $value;

            case FieldObject::TYPE_STRING:
            default:
                return (string) $value;
        }
    }
}

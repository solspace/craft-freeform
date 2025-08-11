<?php

namespace Solspace\Freeform\Bundles\Integrations;

use GuzzleHttp\Exception\RequestException;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationLoggerProvider;
use Solspace\Freeform\Events\Integrations\AuthorizeIntegrationEvent;
use Solspace\Freeform\Events\Integrations\CrmIntegrations\ProcessValueEvent;
use Solspace\Freeform\Events\Integrations\FailedRequestEvent;
use Solspace\Freeform\Fields\Implementations\Pro\DatetimeField;
use Solspace\Freeform\Library\Bundles\BundleLoader;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Integrations\APIIntegrationInterface;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use Solspace\Freeform\Library\Logging\FreeformLogger;
use Solspace\Freeform\Records\IntegrationRecord;
use yii\base\Event;

class IntegrationsBundle extends FeatureBundle
{
    public function __construct(
        private IntegrationLoggerProvider $loggerProvider,
    ) {
        Event::on(
            APIIntegrationInterface::class,
            APIIntegrationInterface::EVENT_PROCESS_VALUE,
            [$this, 'processValue']
        );

        Event::on(
            IntegrationInterface::class,
            IntegrationInterface::EVENT_ON_FAILED_REQUEST,
            [$this, 'logException']
        );

        Event::on(
            APIIntegrationInterface::class,
            APIIntegrationInterface::EVENT_TRIGGER_AUTHORIZED,
            [$this, 'triggerAuthorized']
        );

        $path = \Craft::getAlias('@freeform/Integrations');
        BundleLoader::loadBundles($path);
    }

    public function processValue(ProcessValueEvent $event): void
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

                $event->setValue($value);

                break;

            case FieldObject::TYPE_NUMERIC:
                $event->setValue((int) preg_replace('/\D/', '', $value) ?: '');

                break;

            case FieldObject::TYPE_FLOAT:
                $event->setValue((float) preg_replace('/[^0-9,.]/', '', $value) ?: '');

                break;

            case FieldObject::TYPE_DATE:
                if ($freeformField instanceof DatetimeField) {
                    $carbon = $freeformField->getCarbon();
                    if ($carbon) {
                        $event->setValue($carbon->toDateString());
                    }
                }

                break;

            case FieldObject::TYPE_DATETIME:
                if ($freeformField instanceof DatetimeField) {
                    $carbon = $freeformField->getCarbon();
                    if ($carbon) {
                        $event->setValue($carbon->toAtomString());
                    }
                }

                break;

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

                        $event->setValue($timestamp);
                    }
                }

                break;

            case FieldObject::TYPE_BOOLEAN:
                $event->setValue((bool) $value);

                break;

            case FieldObject::TYPE_STRING:
            default:
                $event->setValue((string) $value);

                break;
        }
    }

    public function logException(FailedRequestEvent $event): void
    {
        if ($event->isRetry() || !$event->isValid) {
            return;
        }

        $form = $event->getForm();
        $integration = $event->getIntegration();
        $logger = $this->loggerProvider->getLogger($integration);
        $exception = $event->getException();

        $message = $exception->getMessage();
        if ($exception instanceof RequestException) {
            $response = $exception->getResponse();
            if ($response && method_exists($response, 'getBody')) {
                $message = (string) $response->getBody();
            }
        }

        $context = [
            'integration' => $integration->getHandle(),
        ];

        if ($form) {
            $context['form'] = $form->getHandle();
        }

        $json = json_decode($message, true);
        if (\JSON_ERROR_NONE === json_last_error()) {
            $context['response'] = $json;
            $message = 'Failed request';
        }

        $logger->error($message, $context);

        $this->plugin()
            ->logger
            ->getLogger(FreeformLogger::INTEGRATION)
            ->error($integration->getTypeDefinition()->name.': '.$message, $context)
        ;
    }

    public function triggerAuthorized(AuthorizeIntegrationEvent $event): void
    {
        $integration = $event->getIntegration();
        if (!$integration instanceof APIIntegrationInterface) {
            return;
        }

        $record = IntegrationRecord::findOne(['id' => $integration->getId()]);
        if ($record) {
            $record->connectionEstablished = true;
            $record->save();
        }
    }
}

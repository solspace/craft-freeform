<?php

namespace Solspace\Freeform\Integrations\PaymentGateways\PayPal\EventListeners;

use GuzzleHttp\Exception\RequestException;
use Solspace\Freeform\Events\Integrations\FailedRequestEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Integrations\PaymentGateways\PayPal\PayPal;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use yii\base\Event;

class PayPalErrorHandler extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            IntegrationInterface::class,
            IntegrationInterface::EVENT_ON_FAILED_REQUEST,
            [$this, 'handleFailedRequest']
        );
    }

    public function handleFailedRequest(FailedRequestEvent $event): void
    {
        $integration = $event->getIntegration();
        if (!$integration instanceof PayPal) {
            return;
        }

        $exception = $event->getException();
        if (!$exception instanceof RequestException) {
            return;
        }

        $response = $exception->getResponse();
        if (!$response || 401 !== $response->getStatusCode()) {
            return;
        }

        // Clear the cached token on 401 error
        $integration->setAccessToken('');
        $integration->setIssuedAt(0);
        $integration->setExpiresIn(0);

        // Save the integration to persist the cleared token
        $integrationModel = Freeform::getInstance()->integrations->getById($integration->getId());
        if ($integrationModel) {
            Freeform::getInstance()->integrations->save($integrationModel, $integration);
        }

        // Trigger retry so the client provider can fetch a new token
        $event->triggerRetry();
    }
}

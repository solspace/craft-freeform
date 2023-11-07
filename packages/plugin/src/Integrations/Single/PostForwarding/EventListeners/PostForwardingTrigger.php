<?php

namespace Solspace\Freeform\Integrations\Single\PostForwarding\EventListeners;

use GuzzleHttp\Client;
use GuzzleHttp\Psr7\Request;
use GuzzleHttp\RequestOptions;
use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Events\Forms\SubmitEvent;
use Solspace\Freeform\Events\PostForwarding\PostForwardingEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Integrations\Single\PostForwarding\PostForwarding;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Logging\FreeformLogger;
use yii\base\Event;

class PostForwardingTrigger extends FeatureBundle
{
    public function __construct(
        private FormIntegrationsProvider $integrationsProvider,
    ) {
        Event::on(
            Form::class,
            Form::EVENT_AFTER_SUBMIT,
            [$this, 'sendPostPayload']
        );
    }

    public function sendPostPayload(SubmitEvent $event): void
    {
        $form = $event->getForm();
        $submission = $form->getSubmission();

        if ($form->isDisabled()->payload || $form->isMarkedAsSpam()) {
            return;
        }

        $integration = $this->integrationsProvider->getSingleton($form, PostForwarding::class);
        if (!$integration) {
            return;
        }

        $url = $integration->getUrl();
        $triggerPhrase = $integration->getErrorTrigger();

        if (!$url) {
            return;
        }

        $payload = [];
        foreach ($form->getLayout()->getFields() as $field) {
            if (!$field->getHandle()) {
                continue;
            }

            $payload[$field->getHandle()] = $field->getValue();
        }

        $csrfTokenName = \Craft::$app->config->general->csrfTokenName;

        $payload[$csrfTokenName] = \Craft::$app->request->csrfToken;
        $payload['submission-id'] = $submission->id;
        $payload['submission-token'] = $submission->token;
        $payload['submission-title'] = $submission->title;
        $payload['submission-ip'] = $submission->ip;

        $payloadEvent = new PostForwardingEvent(
            new Client(),
            new Request('POST', $url),
            $url,
            [],
            $payload
        );

        Event::trigger(PostForwarding::class, PostForwarding::EVENT_POST_FORWARDING, $payloadEvent);
        if (!$payloadEvent->isValid) {
            return;
        }

        $client = $payloadEvent->getClient();
        $request = $payloadEvent->getRequest();

        $options = $payloadEvent->getOptions();
        $payload = $payloadEvent->getPayload();

        if (!array_intersect(array_keys($options), [RequestOptions::FORM_PARAMS, RequestOptions::JSON, RequestOptions::BODY])) {
            $options[RequestOptions::FORM_PARAMS] = $payload;
        }

        $logger = Freeform::getInstance()->logger->getLogger(FreeformLogger::PAYLOAD_FORWARDING);

        try {
            $response = $client->send($request, $options);
            $status = $response->getStatusCode();

            $logContext = [
                'url' => $url,
                'form' => $form->getHandle(),
                'submission' => $submission?->id,
                'response' => (string) $response->getBody(),
            ];

            if ($status >= 200 && $status < 300) {
                if ($triggerPhrase) {
                    if (false !== strripos($logContext['response'], $triggerPhrase)) {
                        $logger->error('POST forwarding failed', [$logContext]);
                    }
                }
            } else {
                $logger->error('POST forwarding failed', [$logContext]);
            }
        } catch (\Exception $e) {
            $logger->error(
                'POST forwarding could not send payload',
                [
                    'url' => $url,
                    'form' => $form->getHandle(),
                    'submission' => $submission?->id,
                    'message' => $e->getMessage(),
                ]
            );
        }
    }
}

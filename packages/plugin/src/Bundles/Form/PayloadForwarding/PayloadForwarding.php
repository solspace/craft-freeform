<?php

namespace Solspace\Freeform\Bundles\Form\PayloadForwarding;

use GuzzleHttp\Client;
use GuzzleHttp\Psr7\Request;
use GuzzleHttp\RequestOptions;
use Solspace\Freeform\Events\Forms\HydrateEvent;
use Solspace\Freeform\Events\Forms\SubmitEvent;
use Solspace\Freeform\Events\PayloadForwarding\PayloadForwardEvent;
use Solspace\Freeform\Fields\EmailField;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\Logging\FreeformLogger;
use Solspace\Freeform\Services\Pro\PayloadForwardingService;
use yii\base\Event;

class PayloadForwarding extends FeatureBundle
{
    const BAG_KEY = 'postForwarding';

    const KEY_URL = 'url';
    const KEY_TRIGGER_PHRASE = 'triggerPhrase';

    const EVENT_POST_FORWARDING = 'postForwarding';

    public function __construct()
    {
        Event::on(Form::class, Form::EVENT_AFTER_SUBMIT, [$this, 'forward']);
        Event::on(Form::class, Form::EVENT_HYDRATE_FORM, [$this, 'attachPayloadForwardingProperties']);
    }

    public function attachPayloadForwardingProperties(HydrateEvent $event)
    {
        $bag = $event->getForm()->getPropertyBag();
        $properties = $event->getFormProperties();

        $bag->set(self::BAG_KEY, [
            self::KEY_URL => $properties->getExtraPostUrl(),
            self::KEY_TRIGGER_PHRASE => $properties->getExtraPostTriggerPhrase(),
        ]);
    }

    public function forward(SubmitEvent $event)
    {
        $form = $event->getForm();
        $submission = $event->getSubmission();

        if ($form->getSuppressors()->isPayload() || $form->isMarkedAsSpam()) {
            return;
        }

        $payloadForwarding = $form->getPropertyBag()->get(self::BAG_KEY, []);

        $url = $payloadForwarding[self::KEY_URL] ?? null;
        $triggerPhrase = $payloadForwarding[self::KEY_TRIGGER_PHRASE] ?? null;

        if (!$url) {
            return;
        }

        $logger = FreeformLogger::getInstance(FreeformLogger::PAYLOAD_FORWARDING);

        $payload = [];
        foreach ($form->getLayout()->getFields() as $field) {
            if (!$field->getHandle()) {
                continue;
            }

            if ($field instanceof EmailField) {
                $value = $field->getValueAsString();
            } else {
                $value = $field->getValue();
            }

            $payload[$field->getHandle()] = $value;
        }

        $csrfTokenName = \Craft::$app->config->general->csrfTokenName;

        $payload[$csrfTokenName] = \Craft::$app->request->csrfToken;
        $payload['submission-id'] = $submission->id;
        $payload['submission-token'] = $submission->token;
        $payload['submission-title'] = $submission->title;
        $payload['submission-ip'] = $submission->ip;

        $payloadEvent = new PayloadForwardEvent(
            new Client(),
            new Request('POST', $url),
            $url,
            [],
            $payload
        );

        // @deprecated remove in v4
        Event::trigger(PayloadForwardingService::class, PayloadForwardingService::BEFORE_PAYLOAD_FORWARD, $payloadEvent);
        Event::trigger(self::class, self::EVENT_POST_FORWARDING, $payloadEvent);

        if (!$payloadEvent->isValid) {
            return;
        }

        $client = $payloadEvent->getClient();
        $request = $payloadEvent->getRequest();

        $options = $payloadEvent->getOptions();
        $payload = $payloadEvent->getPayload();

        if (!array_intersect_key(array_keys($options), [RequestOptions::FORM_PARAMS, RequestOptions::JSON, RequestOptions::BODY])) {
            $options[RequestOptions::FORM_PARAMS] = $payload;
        }

        try {
            $response = $client->send($request, $options);
            $status = $response->getStatusCode();

            $logContext = [
                'url' => $url,
                'form' => $form->getHandle(),
                'submission' => $submission ? $submission->id : null,
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
                    'submission' => $submission ? $submission->id : null,
                    'message' => $e->getMessage(),
                ]
            );
        }
    }
}

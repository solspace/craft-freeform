<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2019, Solspace, Inc.
 * @link          https://docs.solspace.com/craft/freeform
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Psr7\Request;
use GuzzleHttp\RequestOptions;
use Solspace\Freeform\Events\Forms\AfterSubmitEvent;
use Solspace\Freeform\Events\PayloadForwarding\PayloadForwardEvent;
use Solspace\Freeform\Library\Logging\FreeformLogger;

class PayloadForwardingService extends BaseService
{
    const BEFORE_PAYLOAD_FORWARD = 'beforePayloadForward';

    /**
     * @param AfterSubmitEvent $event
     */
    public function forward(AfterSubmitEvent $event)
    {
        $form       = $event->getForm();
        $submission = $event->getSubmission();

        if ($form->getSuppressors()->isPayload()) {
            return;
        }

        if ($form->getExtraPostUrl()) {
            $logger = FreeformLogger::getInstance(FreeformLogger::PAYLOAD_FORWARDING);
            $url    = $form->getExtraPostUrl();
            $phrase = $form->getExtraPostTriggerPhrase();

            $payload = [];
            foreach ($form->getLayout()->getFields() as $field) {
                if (!$field->getHandle()) {
                    continue;
                }

                $payload[$field->getHandle()] = $field->getValue();
            }

            $payloadEvent = new PayloadForwardEvent(
                new Client(),
                new Request('POST', $url),
                $url,
                [],
                $payload
            );
            $this->trigger(self::BEFORE_PAYLOAD_FORWARD, $payloadEvent);

            if (!$payloadEvent->isValid) {
                return;
            }

            $client  = $payloadEvent->getClient();
            $request = $payloadEvent->getRequest();

            $options = $payloadEvent->getOptions();
            $payload = $payloadEvent->getPayload();

            if (!isset($options[RequestOptions::FORM_PARAMS], $options[RequestOptions::JSON], $options[RequestOptions::BODY])) {
                $options[RequestOptions::FORM_PARAMS] = $payload;
            }

            try {
                $response = $client->send($request, $options);
                $status   = $response->getStatusCode();

                $logContext = [
                    'url'        => $url,
                    'form'       => $form->getHandle(),
                    'submission' => $submission ? $submission->id : null,
                    'response'   => (string) $response->getBody(),
                ];

                if ($status >= 200 && $status < 300) {
                    if ($phrase){
                        if (strripos($logContext['response'], $phrase) !== false) {
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
                        'url'        => $url,
                        'form'       => $form->getHandle(),
                        'submission' => $submission ? $submission->id : null,
                        'message'    => $e->getMessage(),
                    ]
                );
            }
        }
    }
}
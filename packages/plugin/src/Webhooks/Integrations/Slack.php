<?php

namespace Solspace\Freeform\Webhooks\Integrations;

use GuzzleHttp\Client;
use Solspace\Freeform\Events\Forms\AfterSubmitEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Webhooks\AbstractWebhook;

class Slack extends AbstractWebhook
{
    public function triggerWebhook(AfterSubmitEvent $event): bool
    {
        $form = $event->getForm();
        $submission = $event->getSubmission();

        $client = new Client();

        $message = $this->getSetting('message', '');
        $message = \Craft::$app->view->renderString($message, [
            'form' => $form,
            'submission' => $submission,
        ]);

        if (!$message) {
            Freeform::getInstance()->logger
                ->getLogger($this->getProviderName())
                ->warning('Slack integration has no message set')
            ;

            return false;
        }

        try {
            $client->post($this->getWebhook(), ['json' => ['text' => $message]]);

            return true;
        } catch (\Exception $e) {
            Freeform::getInstance()->logger->getLogger($this->getProviderName())->error($e->getMessage());
        }

        return false;
    }
}

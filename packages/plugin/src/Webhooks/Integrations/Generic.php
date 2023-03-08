<?php

namespace Solspace\Freeform\Webhooks\Integrations;

use GuzzleHttp\Client;
use Solspace\Freeform\Events\Submissions\ProcessSubmissionEvent;
use Solspace\Freeform\Fields\Implementations\FileUploadField;
use Solspace\Freeform\Fields\Interfaces\NoStorageInterface;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Webhooks\AbstractWebhook;

class Generic extends AbstractWebhook
{
    public function triggerWebhook(ProcessSubmissionEvent $event): bool
    {
        $form = $event->getForm();
        $submission = $event->getSubmission();

        $json = [
            'form' => [
                'id' => $form->getId(),
                'name' => $form->getName(),
                'handle' => $form->getHandle(),
                'color' => $form->getColor(),
                'description' => $form->getDescription(),
                'returnUrl' => $form->getReturnUrl(),
            ],
        ];

        if ($submission) {
            $json['id'] = $submission->id;
            $json['dateCreated'] = $submission->dateCreated;
            $json['uid'] = $submission->uid;
            $json['token'] = $submission->token;
        }

        foreach ($form->getLayout()->getFields() as $field) {
            if ($field instanceof NoStorageInterface) {
                continue;
            }

            if ($field instanceof FileUploadField) {
                $value = Freeform::getInstance()->files->getAssetUrlsFromIds($field->getValue());
            } else {
                $value = $field->getValue();
            }

            $json[$field->getHandle()] = $value;
        }

        $client = new Client();

        try {
            $client->post($this->getWebhook(), ['json' => $json]);

            return true;
        } catch (\Exception $e) {
            Freeform::getInstance()->logger->getLogger($this->getProviderName())->error($e->getMessage());
        }

        return false;
    }
}

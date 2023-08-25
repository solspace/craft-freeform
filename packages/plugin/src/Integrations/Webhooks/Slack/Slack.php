<?php

namespace Solspace\Freeform\Integrations\Webhooks\Slack;

use GuzzleHttp\Client;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Input\TextArea;
use Solspace\Freeform\Attributes\Property\Validators\Required;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Integrations\Types\Webhooks\WebhookIntegration;

#[Type(
    name: 'Slack',
    readme: __DIR__.'/README.md',
    iconPath: __DIR__.'/icon.svg',
)]
class Slack extends WebhookIntegration
{
    #[Required]
    #[TextArea(
        label: 'Message',
        instructions: 'The message to send to Slack. You can use Twig syntax to render dynamic content.',
        placeholder: 'A new submission has been received for {{ form.name }}',
        rows: 10,
    )]
    protected string $message = '';

    public function trigger(Form $form): void
    {
        $submission = $form->getSubmission();

        $message = $this->message;
        $message = \Craft::$app->view->renderString($message, [
            'form' => $form,
            'submission' => $submission,
        ]);

        if (!$message) {
            $this
                ->getLogger(self::LOG_CATEGORY)
                ->warning('Slack integration has no message set')
            ;

            return;
        }

        try {
            $client = new Client();
            $client->post($this->getUrl(), ['json' => ['text' => $message]]);
        } catch (\Exception $e) {
            $this->processException($e);
        }
    }
}

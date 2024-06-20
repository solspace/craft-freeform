<?php

namespace Solspace\Freeform\Integrations\Single\PostForwarding;

use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Edition;
use Solspace\Freeform\Attributes\Property\Input\Boolean;
use Solspace\Freeform\Attributes\Property\Input\Text;
use Solspace\Freeform\Attributes\Property\Input\TextArea;
use Solspace\Freeform\Library\Integrations\BaseIntegration;
use Solspace\Freeform\Library\Integrations\EnabledByDefault\EnabledByDefaultTrait;
use Solspace\Freeform\Library\Integrations\SingletonIntegrationInterface;

#[Edition(Edition::PRO)]
#[Type(
    name: 'Post Forwarding',
    type: Type::TYPE_SINGLE,
    readme: __DIR__.'/README.md',
    iconPath: __DIR__.'/icon.svg',
)]
class PostForwarding extends BaseIntegration implements SingletonIntegrationInterface
{
    use EnabledByDefaultTrait;

    public const EVENT_POST_FORWARDING = 'post-forwarding';

    #[Text(
        label: 'URL',
        instructions: 'Enter the URL where the POST request should be sent.',
        placeholder: 'https://example.com',
    )]
    protected string $url = '';

    #[TextArea(
        label: 'Error Trigger',
        instructions: "Provide a keyword or phrase Freeform should check for in the output of the external POST URL to know if and when there's an error to log, e.g. 'error' or 'an error occurred'.",
    )]
    protected string $errorTrigger = '';

    #[Boolean(
        label: 'Include Uploaded Files',
        instructions: 'If files are present in the form submission, they will be attached to the payload and sent as multipart form data.',
    )]
    protected bool $sendFiles = false;

    public function getUrl(): string
    {
        return $this->getProcessedValue($this->url);
    }

    public function getErrorTrigger(): string
    {
        return $this->getProcessedValue($this->errorTrigger);
    }

    public function isSendFiles(): bool
    {
        return $this->sendFiles;
    }
}

<?php

namespace Solspace\Freeform\Integrations\Singleton\Honeypot;

use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Input\Text;
use Solspace\Freeform\Attributes\Property\Input\TextArea;
use Solspace\Freeform\Library\Integrations\BaseIntegration;
use Solspace\Freeform\Library\Integrations\EnabledByDefault\EnabledByDefaultTrait;
use Solspace\Freeform\Library\Integrations\SingletonIntegrationInterface;

#[Type(
    name: 'Honeypot',
    readme: __DIR__.'/README.md',
    iconPath: __DIR__.'/icon.svg',
)]
class Honeypot extends BaseIntegration implements SingletonIntegrationInterface
{
    use EnabledByDefaultTrait;
    public const EVENT_RENDER_HONEYPOT = 'render-honeypot';

    private const DEFAULT_INPUT_NAME = 'freeform_form_handle';

    #[Text(
        label: 'Custom Honeypot Field Name',
        instructions: 'If you wish to change the default name of the Freeform Honeypot field, specify a value here.',
        placeholder: self::DEFAULT_INPUT_NAME,
    )]
    protected string $inputName = '';

    #[TextArea(
        label: 'Custom Honeypot Error Message',
        instructions: 'If you wish to change the default error message of the Freeform Honeypot field, specify a value here. (Only applied if spam behaviour set to display error messages)',
        placeholder: 'Form honeypot is invalid',
    )]
    protected string $errorMessage = '';

    public function getInputName(): string
    {
        return $this->getProcessedValue($this->inputName) ?: self::DEFAULT_INPUT_NAME;
    }

    public function getErrorMessage(): string
    {
        return $this->getProcessedValue($this->errorMessage);
    }
}

<?php

namespace Solspace\Freeform\Integrations\Singleton\Honeypot;

use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Input\Text;
use Solspace\Freeform\Attributes\Property\Input\TextArea;
use Solspace\Freeform\Attributes\Property\Middleware;
use Solspace\Freeform\Library\Integrations\BaseIntegration;
use Solspace\Freeform\Library\Integrations\EnabledByDefault\EnabledByDefaultTrait;
use Solspace\Freeform\Library\Integrations\SingletonIntegrationInterface;

#[Type(
    name: 'Honeypot',
    type: Type::TYPE_SINGLE,
    readme: __DIR__.'/README.md',
    iconPath: __DIR__.'/icon.svg',
)]
class Honeypot extends BaseIntegration implements SingletonIntegrationInterface
{
    use EnabledByDefaultTrait;
    public const EVENT_RENDER_HONEYPOT = 'render-honeypot';

    private const DEFAULT_INPUT_NAME = 'freeform_form_handle';
    private const DEFAULT_MESSAGE = 'Form honeypot is invalid';

    #[Middleware('handle')]
    #[Text(
        label: 'Custom Input Name',
        instructions: "Enter a new value to rename the default Freeform Honeypot input name. The default is 'freeform_form_handle'.",
        placeholder: 'e.g. freeform_form_handle',
    )]
    protected string $inputName = '';

    #[TextArea(
        label: 'Custom Error Message',
        instructions: 'Enter a new value to change the default error message for the Freeform Honeypot. This is only applied if the Spam Behavior setting is set to Display Error Messages.',
        placeholder: self::DEFAULT_MESSAGE,
    )]
    protected string $errorMessage = '';

    public function getInputName(): string
    {
        return $this->getProcessedValue($this->inputName) ?: self::DEFAULT_INPUT_NAME;
    }

    public function getErrorMessage(): string
    {
        return $this->getProcessedValue($this->errorMessage) ?: self::DEFAULT_MESSAGE;
    }
}

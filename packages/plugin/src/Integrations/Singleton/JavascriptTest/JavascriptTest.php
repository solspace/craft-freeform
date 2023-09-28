<?php

namespace Solspace\Freeform\Integrations\Singleton\JavascriptTest;

use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Input\Text;
use Solspace\Freeform\Attributes\Property\Input\TextArea;
use Solspace\Freeform\Library\Integrations\BaseIntegration;
use Solspace\Freeform\Library\Integrations\EnabledByDefault\EnabledByDefaultTrait;
use Solspace\Freeform\Library\Integrations\SingletonIntegrationInterface;

/**
 * @internal
 *
 * @coversNothing
 */
#[Type(
    name: 'Javascript Test',
    readme: __DIR__.'/README.md',
    iconPath: __DIR__.'/icon.svg',
)]
class JavascriptTest extends BaseIntegration implements SingletonIntegrationInterface
{
    use EnabledByDefaultTrait;

    private const DEFAULT_INPUT_NAME = 'freeform_check';
    private const DEFAULT_MESSAGE = 'Javascript must be enabled to submit this form';

    #[Text(
        label: 'Custom Input Name',
        instructions: 'If you wish to change the default name of the Javascript Test input, specify a value here.',
        placeholder: 'freeform_form_handle',
    )]
    protected string $inputName = '';

    #[TextArea(
        label: 'Custom Error Message',
        instructions: 'If you wish to change the default error message of the Javascript Test, specify a value here. (Only applied if spam behaviour set to display error messages)',
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

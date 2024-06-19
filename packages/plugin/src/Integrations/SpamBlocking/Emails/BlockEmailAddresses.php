<?php

namespace Solspace\Freeform\Integrations\SpamBlocking\Emails;

use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Message;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Attributes\Property\ValueTransformers\SeparatedStringToArrayTransformer;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Fields\Implementations\EmailField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\DataObjects\SpamReason;
use Solspace\Freeform\Library\Helpers\ComparisonHelper;
use Solspace\Freeform\Library\Integrations\EnabledByDefault\EnabledByDefaultTrait;
use Solspace\Freeform\Library\Integrations\Types\SpamBlocking\SpamBlockingIntegration;

#[Type(
    name: 'Email Addresses',
    type: Type::TYPE_SPAM_BLOCK,
    readme: __DIR__.'/README.md',
    iconPath: __DIR__.'/icon.svg',
)]
class BlockEmailAddresses extends SpamBlockingIntegration
{
    use EnabledByDefaultTrait;

    #[Input\Boolean(
        label: 'Display errors about blocked email(s) under each email field',
        instructions: "Enable this if you'd like field-based errors to display under the email field(s) that the user has entered blocked emails for. Not recommended for regular use, but helpful if trying to troubleshoot submission issues.",
    )]
    protected bool $errorsBelowFields = false;

    #[VisibilityFilter('Boolean(values.errorsBelowFields)')]
    #[Input\Text(
        label: 'Blocked Emails Error Message',
        instructions: 'The message shown to users when blocked emails are submitted. Can use the `{email}` variable.',
        placeholder: 'Invalid Email Address',
    )]
    protected string $errorMessage = '';

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(SeparatedStringToArrayTransformer::class)]
    #[Input\TextArea(
        label: 'Blocked Email Addresses',
        instructions: 'Enter email addresses you would like blocked from being used in Email fields. Use asterisks for wildcards (e.g. *@hotmail.ru), and separate multiples on new lines.',
        rows: 8,
    )]
    #[Message('The values entered here will apply only to this form, and will be in addition to the default values set for the main integration')]
    protected array $emails = [];

    #[Flag(self::FLAG_AS_READONLY_IN_INSTANCE)]
    #[ValueTransformer(SeparatedStringToArrayTransformer::class)]
    #[Input\TextArea(
        label: 'Default Blocked Email Addresses',
        instructions: 'Enter email addresses you would like blocked from being used in Email fields. Use asterisks for wildcards (e.g. *@hotmail.ru), and separate multiples on new lines.',
        rows: 8,
    )]
    protected array $defaultEmails = [];

    public function validate(Form $form, bool $displayErrors): void
    {
        $emails = $this->getCombinedEmails();
        if (!$emails) {
            return;
        }

        $fields = $form->getLayout()->getFields(EmailField::class);
        foreach ($fields as $field) {
            $value = $field->getValue();
            if (empty($value)) {
                continue;
            }

            foreach ($emails as $email) {
                if (ComparisonHelper::stringContainsWildcardKeyword($email, $value)) {
                    if ($this->errorsBelowFields) {
                        $message = $this->errorMessage ?: 'Invalid Email Address';
                        $field->addError(Freeform::t($message, ['email' => $value]));
                    }

                    if ($displayErrors) {
                        $form->addError(Freeform::t('Form contains a blocked email'));
                    } else {
                        $form->markAsSpam(
                            SpamReason::TYPE_BLOCKED_EMAIL_ADDRESS,
                            sprintf(
                                'Email field "%s" contains a blocked email address "%s"',
                                $field->getHandle(),
                                $email
                            )
                        );
                    }

                    break;
                }
            }
        }
    }

    private function getCombinedEmails(): array
    {
        return array_merge($this->emails, $this->defaultEmails);
    }
}

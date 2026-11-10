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
    name: 'Blocked Email Addresses',
    type: Type::TYPE_SPAM_BLOCK,
    readme: __DIR__.'/README.md',
    iconPath: __DIR__.'/icon.svg',
)]
class BlockEmailAddresses extends SpamBlockingIntegration
{
    use EnabledByDefaultTrait;

    #[VisibilityFilter('Boolean(enabled)')]
    #[Input\Boolean(label: 'Advanced settings', instructions: 'Additional checks and field error messages.', order: 90)]
    protected bool $showAdvanced = false;

    #[VisibilityFilter('Boolean(values.showAdvanced)')]
    #[VisibilityFilter('Boolean(enabled)')]
    #[Input\BooleanEnv(
        order: 100,
        label: 'Check Email Domains',
        instructions: 'Check for mail or address records on the email domain. This does not verify that the mailbox exists.',
    )]
    protected string $checkMxRecord = 'false';

    #[VisibilityFilter('Boolean(values.showAdvanced)')]
    #[VisibilityFilter('Boolean(enabled)')]
    #[Input\BooleanEnv(
        order: 110,
        label: 'Show Field Errors',
        instructions: 'Show a message beside fields with blocked values. Helpful when troubleshooting submissions.',
    )]
    protected string $errorsBelowFields = 'false';

    #[VisibilityFilter('Boolean(values.showAdvanced)')]
    #[VisibilityFilter('Boolean(enabled)')]
    #[VisibilityFilter('Boolean(values.errorsBelowFields)')]
    #[Flag(self::FLAG_ENV_SUGGEST)]
    #[Input\Text(
        order: 120,
        label: 'Error Message',
        instructions: 'Shown beside a blocked email field. You can use `{email}` for the submitted address.',
        placeholder: 'Invalid Email Address',
    )]
    protected string $errorMessage = '';

    #[VisibilityFilter('Boolean(enabled)')]
    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(SeparatedStringToArrayTransformer::class)]
    #[Input\TextArea(
        order: 11,
        label: 'Blocked Email Addresses for this Form',
        instructions: 'One email address or pattern per line, such as `person@example.com` or `*@example.com`.',
        rows: 8,
    )]
    #[Message('Added to the default block list for this form only.')]
    protected array $emails = [];

    #[VisibilityFilter('Boolean(enabled)')]
    #[Flag(self::FLAG_AS_READONLY_IN_INSTANCE)]
    #[ValueTransformer(SeparatedStringToArrayTransformer::class)]
    #[Input\TextArea(
        order: 10,
        label: 'Default Blocked Email Addresses',
        instructions: 'One email address or pattern per line, such as `person@example.com` or `*@example.com`.',
        rows: 8,
    )]
    #[Message('Used by every form with this integration. Add form-specific entries in the form builder.')]
    protected array $defaultEmails = [];

    public function isCheckMxRecord(): bool
    {
        return $this->getProcessedBoolean($this->checkMxRecord);
    }

    public function isErrorsBelowFields(): bool
    {
        return $this->getProcessedBoolean($this->errorsBelowFields);
    }

    public function validate(Form $form, bool $displayErrors): void
    {
        $fields = $form->getLayout()->getFields(EmailField::class);
        foreach ($fields as $field) {
            $value = $field->getValue();
            if (empty($value)) {
                continue;
            }

            $emails = $this->getCombinedEmails();
            foreach ($emails as $email) {
                if (ComparisonHelper::stringMatchesWildcard($email, $value)) {
                    if ($this->isErrorsBelowFields()) {
                        $message = $this->errorMessage ?: 'Invalid Email Address';
                        $field->addError(Freeform::t($message, ['email' => $value]));
                    }

                    $form->markAsSpam(
                        SpamReason::TYPE_BLOCKED_EMAIL_ADDRESS,
                        \sprintf(
                            'Email field "%s" contains a blocked email address "%s"',
                            $field->getHandle(),
                            $email
                        )
                    );

                    if ($displayErrors) {
                        $form->addError(Freeform::t('Form contains a blocked email'));
                    }

                    break;
                }
            }

            if ($this->isCheckMxRecord() && !$this->hasMXRecord($value)) {
                $form->markAsSpam(
                    SpamReason::TYPE_BLOCKED_EMAIL_ADDRESS,
                    \sprintf(
                        'Email field "%s" with email address "%s" does not have a MX record',
                        $field->getHandle(),
                        $value,
                    )
                );

                if ($displayErrors) {
                    $form->addError(Freeform::t('Form contains a blocked email'));
                }

                break;
            }
        }
    }

    private function getCombinedEmails(): array
    {
        return array_merge($this->emails, $this->defaultEmails);
    }

    private function hasMXRecord(string $email): bool
    {
        $at = strrpos($email, '@');
        if (false === $at) {
            return false;
        }

        $domain = substr($email, $at + 1);
        if (empty($domain)) {
            return false;
        }

        $previousTimeout = ini_set('default_socket_timeout', '2');

        try {
            $result
                = @checkdnsrr($domain, 'MX')
                || @checkdnsrr($domain, 'A');
        } finally {
            if (false !== $previousTimeout) {
                ini_set('default_socket_timeout', $previousTimeout);
            }
        }

        return $result;
    }
}

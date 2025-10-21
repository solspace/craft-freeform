<?php

namespace Solspace\Freeform\Integrations\SpamBlocking\Gibberish;

use craft\helpers\Json;
use delaneymethod\spamshield\SpamShield;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Message;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Attributes\Property\ValueTransformers\SeparatedStringToArrayTransformer;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\DataObjects\SpamReason;
use Solspace\Freeform\Library\Integrations\EnabledByDefault\EnabledByDefaultTrait;
use Solspace\Freeform\Library\Integrations\Types\SpamBlocking\SpamBlockingIntegration;

#[Type(
    name: 'Block Gibberish',
    type: Type::TYPE_SPAM_BLOCK,
    readme: __DIR__.'/README.md',
    iconPath: __DIR__.'/icon.svg',
)]
class BlockGibberish extends SpamBlockingIntegration
{
    use EnabledByDefaultTrait;

    #[VisibilityFilter('Boolean(enabled)')]
    #[Input\Integer(min: 0)]
    protected int $gibberishWordLength = 6;

    #[VisibilityFilter('Boolean(enabled)')]
    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(SeparatedStringToArrayTransformer::class)]
    #[Input\Textarea(
        label: 'Field Handles',
        instructions: 'Enter any field handles you would like checked for gibberish, and separate multiples on new lines. By default textarea type fields are automatically checked.',
        rows: 8,
    )]
    #[Message('The values entered here will only apply to this form and will be in addition to the default values set for the main integration.')]
    protected array $fieldHandles = [];

    #[VisibilityFilter('Boolean(enabled)')]
    #[Input\Boolean(
        label: 'Check MX Record',
        instructions: 'If enabled, email field values will be checked for valid MX record.',
    )]
    protected bool $checkMxRecord = false;

    #[VisibilityFilter('Boolean(enabled)')]
    #[Input\Boolean(
        label: 'Check DNS Block Lists',
        instructions: 'If enabled, users IP address will be checked against DNS block lists.',
    )]
    protected bool $checkDnsBlockLists = false;

    #[VisibilityFilter('Boolean(enabled)')]
    #[VisibilityFilter('Boolean(values.checkDnsBlockLists)')]
    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(SeparatedStringToArrayTransformer::class)]
    #[Input\TextArea(
        label: 'DNS Block Lists',
        instructions: 'Enter DNS block lists you would like to be used, and separate multiples on new lines.',
        rows: 8,
    )]
    #[Message('The values entered here will only apply to this form and will be in addition to the default values set for the main integration.')]
    protected array $dnsBlockLists = [];

    #[VisibilityFilter('Boolean(enabled)')]
    #[VisibilityFilter('Boolean(values.checkDnsBlockLists)')]
    #[Flag(self::FLAG_AS_READONLY_IN_INSTANCE)]
    #[ValueTransformer(SeparatedStringToArrayTransformer::class)]
    #[Input\TextArea(
        label: 'Default DNS Block Lists',
        instructions: 'Enter DNS block lists you would like to be used, and separate multiples on new lines.',
        rows: 8,
    )]
    #[Message('The values entered here will apply to all forms that use this integration. Additionally, form-specific blocks can be set inside the form builder.')]
    protected array $defaultDnsBlockLists = ['zen.spamhaus.org', 'bl.spamcop.net'];

    public function validate(Form $form, bool $displayErrors): void
    {
        if (!class_exists(SpamShield::class)) {
            \Craft::warning('SpamShield package not installed; skipping Block Gibberish check.', 'freeform');

            return;
        }

        try {
            $payload = $form->getSubmission()->getFormFieldValues();

            $meta = [
                'ip' => \Craft::$app->request->getRemoteIP() ?? '',
                'field_handles' => $this->fieldHandles,
                'check_mx_record' => $this->checkMxRecord,
                'check_dns_block_lists' => $this->checkDnsBlockLists,
                'gibberish_word_length' => $this->gibberishWordLength,
            ];

            $spamShield = new SpamShield();

            if ($this->checkDnsBlockLists) {
                $spamShield->setDnsBlockLists($this->getCombinedDnsBlockLists());
            }

            $result = $spamShield->score($payload, $meta);

            if (!$result['is_spam']) {
                return;
            }

            if ($displayErrors) {
                $form->addError(Freeform::t('Your submission has been blocked'));
            }

            $form->markAsSpam(
                SpamReason::TYPE_BLOCK_GIBBERISH,
                'Gibberish check failed',
                Json::encode($result, \JSON_UNESCAPED_SLASHES | \JSON_UNESCAPED_UNICODE | \JSON_PRETTY_PRINT)
            );
        } catch (\Throwable $exception) {
            \Craft::error('Block Gibberish check failed: '.$exception->getMessage(), 'freeform');

            // let Freeform proceed
            return;
        }
    }

    private function getCombinedDnsBlockLists(): array
    {
        return array_values(array_unique(array_filter(
            array_map('trim', array_merge($this->defaultDnsBlockLists, $this->dnsBlockLists)),
            static fn ($value) => \is_string($value) && '' !== $value,
        )));
    }
}

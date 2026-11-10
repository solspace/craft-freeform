<?php

namespace Solspace\Freeform\Integrations\SpamBlocking\Keywords;

use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Message;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Attributes\Property\ValueTransformers\SeparatedStringToArrayTransformer;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Fields\Interfaces\TextInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\DataObjects\SpamReason;
use Solspace\Freeform\Library\Helpers\ComparisonHelper;
use Solspace\Freeform\Library\Integrations\EnabledByDefault\EnabledByDefaultTrait;
use Solspace\Freeform\Library\Integrations\Types\SpamBlocking\SpamBlockingIntegration;

#[Type(
    name: 'Blocked Keywords',
    type: Type::TYPE_SPAM_BLOCK,
    readme: __DIR__.'/README.md',
    iconPath: __DIR__.'/icon.svg',
)]
class BlockKeywords extends SpamBlockingIntegration
{
    use EnabledByDefaultTrait;

    #[VisibilityFilter('Boolean(enabled)')]
    #[Input\Boolean(label: 'Advanced settings', instructions: 'Field error messages for troubleshooting.', order: 90)]
    protected bool $showAdvanced = false;

    #[VisibilityFilter('Boolean(values.showAdvanced)')]
    #[VisibilityFilter('Boolean(enabled)')]
    #[Input\BooleanEnv(
        order: 100,
        label: 'Show Field Errors',
        instructions: 'Show a message beside fields with blocked values. Helpful when troubleshooting submissions.',
    )]
    protected string $errorsBelowFields = 'false';

    #[VisibilityFilter('Boolean(values.showAdvanced)')]
    #[VisibilityFilter('Boolean(enabled)')]
    #[VisibilityFilter('Boolean(values.errorsBelowFields)')]
    #[Flag(self::FLAG_ENV_SUGGEST)]
    #[Input\Text(
        order: 110,
        label: 'Error Message',
        instructions: 'Shown beside a field with a blocked keyword. You can use `{value}` and `{keyword}`.',
        placeholder: 'Invalid Entry Data',
    )]
    protected string $errorMessage = '';

    #[VisibilityFilter('Boolean(enabled)')]
    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(SeparatedStringToArrayTransformer::class)]
    #[Input\TextArea(
        order: 11,
        label: 'Blocked Keywords for this Form',
        instructions: 'One word or pattern per line. Use quotes for phrases and `*` for partial matches, such as `lead*`.',
        rows: 8,
    )]
    #[Message('Added to the default block list for this form only.')]
    protected array $keywords = [];

    #[VisibilityFilter('Boolean(enabled)')]
    #[Flag(self::FLAG_AS_READONLY_IN_INSTANCE)]
    #[ValueTransformer(SeparatedStringToArrayTransformer::class)]
    #[Input\TextArea(
        order: 10,
        label: 'Default Blocked Keywords',
        instructions: 'One word or pattern per line. Use quotes for phrases and `*` for partial matches, such as `lead*`.',
        rows: 8,
    )]
    #[Message('Used by every form with this integration. Add form-specific entries in the form builder.')]
    protected array $defaultKeywords = [];

    public function isErrorsBelowFields(): bool
    {
        return $this->getProcessedBoolean($this->errorsBelowFields);
    }

    public function validate(Form $form, bool $displayErrors): void
    {
        $keywords = $this->getCombinedKeywords();
        if (!$keywords) {
            return;
        }

        $fields = $form->getLayout()->getFields(TextInterface::class);
        foreach ($fields as $field) {
            $value = $field->getValue();
            if (empty($value)) {
                continue;
            }

            foreach ($keywords as $keyword) {
                if (ComparisonHelper::stringContainsWildcardKeyword($keyword, $value)) {
                    if ($this->isErrorsBelowFields()) {
                        $message = $this->errorMessage ?: 'Invalid Entry Data';
                        $field->addError(Freeform::t($message, [
                            'value' => $value,
                            'keyword' => $keyword,
                        ]));
                    }

                    $form->markAsSpam(
                        SpamReason::TYPE_BLOCKED_KEYWORDS,
                        \sprintf(
                            'Field "%s" contains a blocked keyword "%s" in the string "%s"',
                            $field->getHandle(),
                            $keyword,
                            $value
                        )
                    );

                    if ($displayErrors) {
                        $form->addError(Freeform::t('Form contains a restricted keyword'));
                    }

                    break;
                }
            }
        }
    }

    private function getCombinedKeywords(): array
    {
        return array_merge($this->keywords, $this->defaultKeywords);
    }
}

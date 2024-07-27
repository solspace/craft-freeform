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
    #[Input\Boolean(
        label: 'Display Errors about Blocked Keywords under each Field',
        instructions: "Enable this if you'd like field-based errors to display under the field(s) that the user has entered blocked keywords for. Not recommended for regular use, but helpful if trying to troubleshoot submission issues.",
    )]
    protected bool $errorsBelowFields = false;

    #[VisibilityFilter('Boolean(enabled)')]
    #[VisibilityFilter('Boolean(values.errorsBelowFields)')]
    #[Input\Text(
        label: 'Error Message',
        instructions: 'The message shown to users when blocked keywords are submitted. Can use `{value}` and `{keyword}` variables.',
        placeholder: 'Invalid Entry Data',
    )]
    protected string $errorMessage = '';

    #[VisibilityFilter('Boolean(enabled)')]
    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(SeparatedStringToArrayTransformer::class)]
    #[Input\TextArea(
        label: 'Blocked Keywords for this Form',
        instructions: 'Enter keywords you would like blocked from being used in all text and textarea fields. Use quotes for phrases (e.g. "generate new leads"), asterisks for wildcards (e.g. lead*), and separate multiples on new lines. When attempting to block individual characters (e.g. Russian letters) or partial words or strings, be sure to make good use of the wildcard character by placing one before and after.',
        rows: 8,
    )]
    #[Message('The values entered here will only apply to this form and will be in addition to the default values set for the main integration.')]
    protected array $keywords = [];

    #[VisibilityFilter('Boolean(enabled)')]
    #[Flag(self::FLAG_AS_READONLY_IN_INSTANCE)]
    #[ValueTransformer(SeparatedStringToArrayTransformer::class)]
    #[Input\TextArea(
        label: 'Default Blocked Keywords',
        instructions: 'Enter keywords you would like blocked from being used in all text and textarea fields. Use quotes for phrases (e.g. "generate new leads"), asterisks for wildcards (e.g. lead*), and separate multiples on new lines. When attempting to block individual characters (e.g. Russian letters) or partial words or strings, be sure to make good use of the wildcard character by placing one before and after.',
        rows: 8,
    )]
    #[Message('The values entered here will apply to all forms that use this integration. Additionally, form-specific blocks can be set inside the form builder.')]
    protected array $defaultKeywords = [];

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
                    if ($this->errorsBelowFields) {
                        $message = $this->errorMessage ?: 'Invalid Entry Data';
                        $field->addError(Freeform::t($message, [
                            'value' => $value,
                            'keyword' => $keyword,
                        ]));
                    }

                    if ($displayErrors) {
                        $form->addError(Freeform::t('Form contains a restricted keyword'));
                    } else {
                        $form->markAsSpam(
                            SpamReason::TYPE_BLOCKED_KEYWORDS,
                            sprintf(
                                'Field "%s" contains a blocked keyword "%s" in the string "%s"',
                                $field->getHandle(),
                                $keyword,
                                $value
                            )
                        );
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

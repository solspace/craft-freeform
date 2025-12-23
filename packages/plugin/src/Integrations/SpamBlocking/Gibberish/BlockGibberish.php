<?php

namespace Solspace\Freeform\Integrations\SpamBlocking\Gibberish;

use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Message;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Attributes\Property\ValueTransformers\SeparatedStringToArrayTransformer;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Fields\Interfaces\SkipGibberishCheckInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\DataObjects\SpamReason;
use Solspace\Freeform\Library\Helpers\GibberishHelper;
use Solspace\Freeform\Library\Integrations\EnabledByDefault\EnabledByDefaultTrait;
use Solspace\Freeform\Library\Integrations\Types\SpamBlocking\SpamBlockingIntegration;
use yii\helpers\Json;

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
    #[Input\Integer(
        label: 'Gibberish Word Minimum Length',
        instructions: 'Minimum word length used to detect gibberish. Lower values increase sensitivity but may flag valid words.',
        min: 0
    )]
    protected int $gibberishWordMinimumLength = 6;

    #[VisibilityFilter('Boolean(enabled)')]
    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(SeparatedStringToArrayTransformer::class)]
    #[Input\TextArea(
        label: 'Allowed Terms for this Form',
        instructions: 'Enter words or abbreviations that should be ignored by gibberish detection. Add one per line (e.g., RFP, ABB, KUKA, or other technical terms).',
        rows: 8,
    )]
    #[Message('The values entered here will only apply to this form and will be in addition to the default values set for the main integration.')]
    protected array $allowedTerms = [];

    #[VisibilityFilter('Boolean(enabled)')]
    #[Flag(self::FLAG_AS_READONLY_IN_INSTANCE)]
    #[ValueTransformer(SeparatedStringToArrayTransformer::class)]
    #[Input\TextArea(
        label: 'Default Allowed Terms',
        instructions: 'Enter words or abbreviations that should be ignored by gibberish detection. Add one per line (e.g., RFP, ABB, KUKA, or other technical terms).',
        rows: 8,
    )]
    #[Message('The values entered here will apply to all forms that use this integration. Additionally, form-specific blocks can be set inside the form builder.')]
    protected array $defaultAllowedTerms = [];

    public function validate(Form $form, bool $displayErrors): void
    {
        $debugReports = [];
        $gibberishHits = 0;

        foreach ($form->getLayout()->getFields() as $field) {
            if ($field instanceof SkipGibberishCheckInterface) {
                continue;
            }

            if (empty($field->getValue())) {
                continue;
            }

            $analysis = GibberishHelper::analyzeGibberish($field->getValue(), $this->getGibberishWordMinimumLength(), $this->getCombinedAllowedTerms());
            if ($analysis['is_gibberish']) {
                ++$gibberishHits;
            }

            // Always keep the analysis for debugging/reporting:
            if (!empty($analysis['bad_word_count']) || !empty($analysis['short_word_junk_count']) || !empty($analysis['words'])) {
                $debugReports[$field->getHandle()] = $analysis;
            }
        }

        if (0 === $gibberishHits) {
            return;
        }

        if ($displayErrors) {
            $form->addError(Freeform::t('Your submission has been blocked'));
        }

        $form->markAsSpam(SpamReason::TYPE_GIBBERISH, 'Gibberish check failed', Json::encode($debugReports, \JSON_PRETTY_PRINT | \JSON_UNESCAPED_SLASHES | \JSON_UNESCAPED_UNICODE));
    }

    private function getCombinedAllowedTerms(): array
    {
        return array_values(array_unique(array_filter(array_map('trim', array_merge($this->allowedTerms, $this->defaultAllowedTerms)), static fn ($value) => \is_string($value) && '' !== $value)));
    }

    private function getGibberishWordMinimumLength(): int
    {
        return $this->gibberishWordMinimumLength;
    }
}

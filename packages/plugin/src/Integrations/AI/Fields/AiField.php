<?php

namespace Solspace\Freeform\Integrations\AI\Fields;

use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Attributes\Property\Implementations\Integrations\IntegrationTransformer;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Section;
use Solspace\Freeform\Attributes\Property\Validators\Required;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Fields\AbstractField;
use Solspace\Freeform\Fields\Interfaces\ExtraFieldInterface;
use Solspace\Freeform\Fields\Interfaces\NoRenderInterface;
use Solspace\Freeform\Fields\Interfaces\TextInterface;
use Solspace\Freeform\Integrations\AI\AiIntegrationInterface;
use Solspace\Freeform\Library\Attributes\Attributes;
use Solspace\Freeform\Library\Helpers\HashHelper;

#[Type(
    name: 'AI',
    typeShorthand: 'ai',
    iconPath: __DIR__.'/../Icons/ai.svg',
    previewTemplatePath: __DIR__.'/../Templates/ai-field-preview.ejs',
)]
class AiField extends AbstractField implements NoRenderInterface, ExtraFieldInterface, TextInterface
{
    #[Required]
    #[ValueTransformer(IntegrationTransformer::class)]
    #[Input\ApplicationStateSelect(
        label: 'AI Integration',
        instructions: 'Select an AI integration to use for this field.',
        emptyOption: 'No integration selected.',
        source: 'integrations',
        optionValue: 'uid',
        optionLabel: 'name',
        filters: [
            'Boolean(enabled)',
            'type === "ai"',
        ],
    )]
    protected ?AiIntegrationInterface $integration = null;

    #[Section(
        handle: 'ai-configuration',
        label: 'AI Configuration',
        icon: __DIR__.'/../Icons/ai.svg',
        order: 1,
    )]
    #[Required]
    #[Input\TextArea(
        label: 'System Prompt',
        instructions: 'Instructions for the AI on how to process the form data. You can use this for categorization, summarization, sentiment analysis, content generation, or any other AI task. Be specific about the desired output format.',
        placeholder: 'e.g. Analyze the provided fields and categorize this submission into one of these categories: Pre-sales Questions, Support Issue, Account Help. Respond with only the category name.',
        rows: 6,
    )]
    protected string $systemPrompt = '';

    #[Section('ai-configuration')]
    #[Required]
    #[Input\AiBox(
        label: 'Fields to Process',
        instructions: 'Select which form fields to send to the AI for processing. Use the dropdown or type @ to search for fields.',
        availableFieldTypes: ['*'],
    )]
    protected string $fieldsToAnalyze = '';

    #[Section('ai-configuration')]
    #[Input\Boolean(
        label: 'Include Field Labels',
        instructions: 'When enabled, field labels will be included in the content sent to AI (e.g., "Name: John Doe" instead of just "John Doe").',
    )]
    protected bool $includeFieldLabels = true;

    #[Section('ai-configuration')]
    #[Input\Integer(
        label: 'Max Tokens Override',
        instructions: 'Leave empty to use integration settings. Override only if you need different max tokens for this field.',
        min: 1,
        max: 128000,
    )]
    protected ?int $maxTokens = null;

    #[Section('ai-configuration')]
    #[Input\Text(
        label: 'Temperature Override',
        instructions: 'Leave empty to use integration settings. Override only if you need different temperature for this field. Enter a value between 0.0 and 1.0.',
        placeholder: '0.7',
    )]
    protected ?string $temperature = null;

    #[VisibilityFilter('false')]
    protected bool $required = false;

    #[VisibilityFilter('false')]
    protected string $instructions = '';

    public function getType(): string
    {
        return 'ai';
    }

    public function isRequired(): bool
    {
        return false;
    }

    public function getIntegration(): ?AiIntegrationInterface
    {
        return $this->integration;
    }

    public function getSystemPrompt(): string
    {
        return $this->systemPrompt;
    }

    public function getFieldsToProcess(): array
    {
        if (empty($this->fieldsToAnalyze)) {
            return [];
        }

        // Check if using @ syntax for all fields
        if ('@' === trim($this->fieldsToAnalyze)) {
            return ['@all'];
        }

        // Parse the field selection format from the AI field component
        // Extract field handles from the format like "field:handle1 field:handle2"
        preg_match_all('/field:([a-zA-Z0-9_]+)/', $this->fieldsToAnalyze, $matches);

        if (!empty($matches[1])) {
            return $matches[1];
        }

        // Also check for the tagify format (just the handle names)
        $handles = array_filter(array_map('trim', explode(' ', $this->fieldsToAnalyze)));
        if (!empty($handles)) {
            return $handles;
        }

        // Fallback to the old line-based format for backward compatibility
        return array_filter(array_map('trim', explode("\n", $this->fieldsToAnalyze)));
    }

    public function isIncludeFieldLabels(): bool
    {
        return $this->includeFieldLabels;
    }

    public function getMaxTokens(): int
    {
        if (null !== $this->maxTokens) {
            return $this->maxTokens;
        }

        return $this->integration?->getMaxTokens() ?? 150;
    }

    public function getTemperature(): float
    {
        if (null !== $this->temperature && !empty($this->temperature)) {
            $temp = (float) $this->temperature;

            // Validate and clamp to valid range
            if ($temp < 0.0) {
                return 0.0;
            }
            if ($temp > 2.0) {
                return 2.0;
            }

            return $temp;
        }

        return $this->integration?->getTemperature() ?? 0.7;
    }

    public function getModel(): ?string
    {
        return $this->integration?->getModel();
    }

    protected function getInputHtml(): string
    {
        $id = HashHelper::hash([
            $this->getForm()->getId(),
            $this->integration?->getId() ?? 0,
            $this->getId(),
        ]);

        $output = '<div'.$this->getAttributes()->getInput().'>';

        $inputAttributes = (new Attributes())
            ->set('data-freeform-ai-field')
            ->set('name', $this->getHandle())
            ->set('type', 'hidden')
            ->set('value', $this->getValue())
        ;
        $output .= '<input'.$inputAttributes.' />';

        if (!$this->integration) {
            $output .= '<p class="error" style="color: #cf1124;">No AI integration selected</p>';
        }

        $output .= '</div>';

        return $output;
    }
}

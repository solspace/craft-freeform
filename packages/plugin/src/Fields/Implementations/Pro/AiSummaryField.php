<?php

namespace Solspace\Freeform\Fields\Implementations\Pro;

use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Section;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Fields\AbstractField;
use Solspace\Freeform\Fields\Implementations\CheckboxesField;
use Solspace\Freeform\Fields\Implementations\CheckboxField;
use Solspace\Freeform\Fields\Implementations\ConfirmationField;
use Solspace\Freeform\Fields\Implementations\DatetimeField;
use Solspace\Freeform\Fields\Implementations\DropdownField;
use Solspace\Freeform\Fields\Implementations\EmailField;
use Solspace\Freeform\Fields\Implementations\FileDragAndDropField;
use Solspace\Freeform\Fields\Implementations\FileUploadField;
use Solspace\Freeform\Fields\Implementations\GroupField;
use Solspace\Freeform\Fields\Implementations\HiddenField;
use Solspace\Freeform\Fields\Implementations\HtmlField;
use Solspace\Freeform\Fields\Implementations\InvisibleField;
use Solspace\Freeform\Fields\Implementations\MultipleSelectField;
use Solspace\Freeform\Fields\Implementations\NumberField;
use Solspace\Freeform\Fields\Implementations\OpinionScaleField;
use Solspace\Freeform\Fields\Implementations\PasswordField;
use Solspace\Freeform\Fields\Implementations\PhoneField;
use Solspace\Freeform\Fields\Implementations\RadiosField;
use Solspace\Freeform\Fields\Implementations\RatingField;
use Solspace\Freeform\Fields\Implementations\RegexField;
use Solspace\Freeform\Fields\Implementations\RichTextField;
use Solspace\Freeform\Fields\Implementations\SignatureField;
use Solspace\Freeform\Fields\Implementations\TableField;
use Solspace\Freeform\Fields\Implementations\TextareaField;
use Solspace\Freeform\Fields\Implementations\TextField;
use Solspace\Freeform\Fields\Implementations\WebsiteField;
use Solspace\Freeform\Fields\Interfaces\ExtraFieldInterface;
use Solspace\Freeform\Fields\Interfaces\NoRenderInterface;
use Solspace\Freeform\Fields\Interfaces\TextInterface;
use Solspace\Freeform\Freeform;

#[Type(
    name: 'AI',
    typeShorthand: 'ai-summary',
    iconPath: __DIR__.'/../Icons/ai-summary.svg',
)]
class AiSummaryField extends AbstractField implements NoRenderInterface, ExtraFieldInterface, TextInterface
{
    #[Section(
        handle: 'ai-configuration',
        label: 'AI Processing Configuration',
        icon: __DIR__.'/../../SectionIcons/ai.svg',
        order: 1,
    )]
    #[Input\TextArea(
        label: 'System Prompt',
        instructions: 'Instructions for the AI on how to process the form data. You can use this for categorization, summarization, sentiment analysis, or any other AI task. Be specific about the desired output format.',
        placeholder: 'You are an AI assistant that analyzes form submissions. Based on the provided content, categorize this submission into one of these categories: Pre-sales Questions, Support Issue, Account Help. Respond with only the category name.',
        rows: 6,
    )]
    protected string $systemPrompt = '';

    #[Section('ai-configuration')]
    #[Input\AiSummaryBox(
        label: 'Fields to Analyze',
        instructions: 'Select the fields to analyze using the @ syntax. Type @ to see available fields. Selected fields will be displayed as a comma-separated list.',
        availableFieldTypes: [
            TextField::class,
            TextareaField::class,
            EmailField::class,
            NumberField::class,
            PhoneField::class,
            WebsiteField::class,
            DropdownField::class,
            MultipleSelectField::class,
            RadiosField::class,
            CheckboxField::class,
            CheckboxesField::class,
            FileUploadField::class,
            FileDragAndDropField::class,
            RichTextField::class,
            DatetimeField::class,
            RatingField::class,
            OpinionScaleField::class,
            SignatureField::class,
            TableField::class,
            ConfirmationField::class,
            GroupField::class,
            HiddenField::class,
            InvisibleField::class,
            HtmlField::class,
            PasswordField::class,
            RegexField::class,
        ],
    )]
    protected string $fieldsToAnalyze = '';

    #[Section('ai-configuration')]
    #[Input\Boolean(
        label: 'Include field labels in analysis',
        instructions: 'Whether to include field labels when sending data to AI.',
    )]
    protected bool $includeFieldLabels = true;

    #[Section('ai-configuration')]
    #[Input\Integer(
        label: 'Max Tokens Override',
        instructions: 'Leave empty to use global AI settings. Override only if you need different token limits for this field.',
        min: 10,
        max: 1000,
    )]
    protected ?int $maxTokens = null;

    #[Section('ai-configuration')]
    #[Input\Number(
        label: 'Temperature Override',
        instructions: 'Leave empty to use global AI settings. Override only if you need different temperature for this field.',
        min: 0.0,
        max: 1.0,
        step: 0.1,
    )]
    protected ?float $temperature = null;

    #[Section('ai-configuration')]
    #[Input\Boolean(
        label: 'Enable caching override',
        instructions: 'Leave unchecked to use global AI settings. Override only if you need different caching for this field.',
    )]
    protected ?bool $enableCaching = null;

    #[VisibilityFilter('false')]
    protected bool $required = false;

    public function getType(): string
    {
        return 'ai-summary';
    }

    public function isRequired(): bool
    {
        return false;
    }

    public function getSystemPrompt(): string
    {
        return $this->systemPrompt;
    }

    public function getFieldsToAnalyze(): array
    {
        if (empty($this->fieldsToAnalyze)) {
            return [];
        }

        // Parse the field selection format (similar to calculation box)
        // Extract field handles from the format like "field:handle1 field:handle2"
        preg_match_all('/field:([a-zA-Z0-9_]+)/', $this->fieldsToAnalyze, $matches);

        if (!empty($matches[1])) {
            return $matches[1];
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

        $settings = Freeform::getInstance()->settings->getSettingsModel();

        return $settings->aiMaxTokens;
    }

    public function getTemperature(): float
    {
        if (null !== $this->temperature) {
            return $this->temperature;
        }

        $settings = Freeform::getInstance()->settings->getSettingsModel();

        return $settings->aiTemperature;
    }

    public function isEnableCaching(): bool
    {
        if (null !== $this->enableCaching) {
            return $this->enableCaching;
        }

        $settings = Freeform::getInstance()->settings->getSettingsModel();

        return $settings->aiCacheEnabled;
    }

    public function getAiProvider(): ?string
    {
        // Use global settings - no field-level override for provider
        $settings = Freeform::getInstance()->settings->getSettingsModel();

        return $settings->aiProvider;
    }

    public function getAiModel(): string
    {
        // Use global settings - no field-level override for model
        $settings = Freeform::getInstance()->settings->getSettingsModel();

        return $settings->aiModel ?: 'gpt-3.5-turbo';
    }

    public function getInputHtml(): string
    {
        // This field is hidden from users, so return empty string
        return '';
    }

    public function includeInGqlSchema(): bool
    {
        return false;
    }
}

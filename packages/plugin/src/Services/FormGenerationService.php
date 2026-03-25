<?php

namespace Solspace\Freeform\Services;

use craft\helpers\StringHelper;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationClientProvider;
use Solspace\Freeform\Bundles\Transformers\Builder\Form\FormTransformer;
use Solspace\Freeform\controllers\api\FormsController;
use Solspace\Freeform\Events\Forms\PersistFormEvent;
use Solspace\Freeform\Fields\Implementations\CheckboxesField;
use Solspace\Freeform\Fields\Implementations\CheckboxField;
use Solspace\Freeform\Fields\Implementations\DropdownField;
use Solspace\Freeform\Fields\Implementations\EmailField;
use Solspace\Freeform\Fields\Implementations\FileUploadField;
use Solspace\Freeform\Fields\Implementations\HiddenField;
use Solspace\Freeform\Fields\Implementations\HtmlField;
use Solspace\Freeform\Fields\Implementations\MultipleSelectField;
use Solspace\Freeform\Fields\Implementations\NumberField;
use Solspace\Freeform\Fields\Implementations\Pro\CalculationField;
use Solspace\Freeform\Fields\Implementations\Pro\CardsField;
use Solspace\Freeform\Fields\Implementations\Pro\ConfirmationField;
use Solspace\Freeform\Fields\Implementations\Pro\DatetimeField;
use Solspace\Freeform\Fields\Implementations\Pro\FileDragAndDropField;
use Solspace\Freeform\Fields\Implementations\Pro\ImageField;
use Solspace\Freeform\Fields\Implementations\Pro\OpinionScaleField;
use Solspace\Freeform\Fields\Implementations\Pro\PasswordField;
use Solspace\Freeform\Fields\Implementations\Pro\PhoneField;
use Solspace\Freeform\Fields\Implementations\Pro\RatingField;
use Solspace\Freeform\Fields\Implementations\Pro\RegexField;
use Solspace\Freeform\Fields\Implementations\Pro\RichTextField;
use Solspace\Freeform\Fields\Implementations\Pro\SignatureField;
use Solspace\Freeform\Fields\Implementations\Pro\WebsiteField;
use Solspace\Freeform\Fields\Implementations\RadiosField;
use Solspace\Freeform\Fields\Implementations\TextareaField;
use Solspace\Freeform\Fields\Implementations\TextField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Form\Types\Regular;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Integrations\AI\AiIntegrationInterface;
use Solspace\Freeform\Library\Helpers\SitesHelper;
use Solspace\Freeform\Services\Integrations\IntegrationsService;
use yii\base\Event;

class FormGenerationService
{
    private const PROMPT_MAX_LENGTH = 1000;
    private const AI_MAX_TOKENS = 3000;
    private const AI_TIMEOUT_SECONDS = 30;

    /** Field types that take the full row (one per row). Others share 2 per row. */
    private const FULL_WIDTH_TYPES = [
        'Textarea', 'RichText', 'Html', 'FileUpload', 'FileDragAndDrop', 'Image',
        'Signature', 'Cards', 'OpinionScale', 'Calculation',
    ];

    /** @var array<string, string> short type => typeClass (all Freeform field types) */
    private const ALLOWED_FIELD_TYPES = [
        'Text' => TextField::class,
        'Email' => EmailField::class,
        'Textarea' => TextareaField::class,
        'Number' => NumberField::class,
        'Dropdown' => DropdownField::class,
        'Checkbox' => CheckboxField::class,
        'Checkboxes' => CheckboxesField::class,
        'Radios' => RadiosField::class,
        'Hidden' => HiddenField::class,
        'Html' => HtmlField::class,
        'FileUpload' => FileUploadField::class,
        'MultipleSelect' => MultipleSelectField::class,
        'Phone' => PhoneField::class,
        'Website' => WebsiteField::class,
        'Datetime' => DatetimeField::class,
        'Rating' => RatingField::class,
        'OpinionScale' => OpinionScaleField::class,
        'Password' => PasswordField::class,
        'Confirmation' => ConfirmationField::class,
        'RichText' => RichTextField::class,
        'Signature' => SignatureField::class,
        'Regex' => RegexField::class,
        'Image' => ImageField::class,
        'FileDragAndDrop' => FileDragAndDropField::class,
        'Cards' => CardsField::class,
        'Calculation' => CalculationField::class,
    ];

    public function __construct(
        private IntegrationsService $integrationsService,
        private IntegrationClientProvider $clientProvider,
        private PropertyProvider $propertyProvider,
        private FormTransformer $formTransformer,
    ) {}

    public function generate(
        string $prompt,
        ?string $name,
        string $integrationUid,
        ?int $timeout = self::AI_TIMEOUT_SECONDS
    ): Form {
        $prompt = trim($prompt);
        if (mb_strlen($prompt) > self::PROMPT_MAX_LENGTH) {
            throw new \InvalidArgumentException(Freeform::t('Prompt must be at most {n} characters.', ['n' => self::PROMPT_MAX_LENGTH]));
        }

        $integration = $this->integrationsService->getIntegrationObjectByUid($integrationUid);
        if (!$integration instanceof AiIntegrationInterface || !$integration->isEnabled()) {
            throw new \InvalidArgumentException(Freeform::t('Selected AI integration is not available or not enabled.'));
        }

        $client = $this->clientProvider->getAuthorizedClient($integration);
        $systemPrompt = $this->getSystemPrompt();
        $userContent = $this->buildUserPrompt($prompt, $name);

        $options = [
            'model' => $integration->getModel(),
            'max_tokens' => self::AI_MAX_TOKENS,
        ];
        if (null !== $timeout) {
            $options['timeout'] = $timeout;
        }

        $response = $integration->processAiRequest($client, $systemPrompt, $userContent, $options);
        $parsed = $this->parseAiResponse($response);
        $formName = $parsed['name'] ?? $name ?? Freeform::t('AI Generated Form');
        $formHandle = $this->generateHandle($formName);
        $fieldsData = $parsed['fields'] ?? [];

        $payload = $this->buildPersistPayload($formName, $formHandle, $fieldsData, $parsed['pages'] ?? null);
        $event = new PersistFormEvent($payload);

        if (empty(trim($formName))) {
            $event->addErrorsToResponse('form', ['name' => [Freeform::t('Name cannot be empty')]]);
        }

        Event::trigger(FormsController::class, FormsController::EVENT_CREATE_FORM, $event);
        Event::trigger(FormsController::class, FormsController::EVENT_UPSERT_FORM, $event);

        if ($event->hasErrors()) {
            $errors = $event->getResponseData()['errors'] ?? [];

            throw new \RuntimeException(Freeform::t('Form generation failed: {errors}', ['errors' => json_encode($errors)]));
        }

        $form = $event->getForm();
        if (!$form instanceof Form) {
            throw new \RuntimeException(Freeform::t('Form could not be created.'));
        }

        return $form;
    }

    public function getSystemPrompt(): string
    {
        $typeList = implode(', ', array_keys(self::ALLOWED_FIELD_TYPES));

        $manifest = $this->getManifestSample();

        return <<<PROMPT
            You are a form builder assistant. You must respond with valid JSON only, no markdown or explanation.

            Allowed field types (use exactly these for "type"): {$typeList}

            You can structure the form in one of two ways:
            1) Single-page form:
               {"name": "Form Name", "fields": [ ... ]}
            2) Multi-page form:
               {
                 "name": "Form Name",
                 "pages": [
                   { "label": "Page 1 label", "fields": [ ... ] },
                   { "label": "Page 2 label", "fields": [ ... ] }
                 ]
               }

            For each field you output, the field object must have: "type", "label", "handle". Optional properties by type:

            - Text, Email, Phone, Website, Hidden, Regex: "placeholder", "instructions", "required", "defaultValue"
            - Textarea: "placeholder", "instructions", "required", "rows" (number)
            - Number: "instructions", "required", "defaultValue", "min", "max"
            - Dropdown, Radios, Checkboxes, MultipleSelect, Cards: "instructions", "required", "defaultValue", and MUST include "options" (array e.g. ["A", "B"] or [{"label": "A", "value": "a"}, ...])
            - Checkbox: "instructions", "defaultValue" (true/false for checked by default)
            - Datetime: "instructions", "required", "defaultValue" (e.g. "now" or "today")
            - Rating: "instructions", "required", "maxValue" (number 1-10, default 5)
            - OpinionScale: "instructions", "required", "options" (array of scale values/labels)
            - Password: "placeholder", "instructions", "required"
            - Confirmation: "instructions", "required" (use when confirming email/password; label often "Confirm Email" etc.)
            - RichText, Html: "content" (HTML string), and optionally "instructions". Use these for static sections, headings, or helper text. Keep content short and well-structured HTML (paragraphs, lists, small headings).
            - Signature: "instructions", "required"
            - FileUpload, Image, FileDragAndDrop: "instructions", "required"
            - Calculation: "instructions", "defaultValue" (formula or display value)

            Sample output (manifest):
            {$manifest}

            Rules:
            - "name": string, optional form title.
            - "handle" must be camelCase or snake_case, unique in the form (e.g. fullName, emailAddress, messageBody).
            - Use the correct "type" for each field. Include "options" for Dropdown, Radios, Checkboxes, MultipleSelect, Cards, OpinionScale.
            - Return only the JSON object, no code block or other text.
            PROMPT;
    }

    public function buildUserPrompt(string $userDescription, ?string $suggestedName): string
    {
        $out = 'Generate a form with these requirements: '.$userDescription;
        if (null !== $suggestedName && '' !== trim($suggestedName)) {
            $out .= "\nPreferred form name: ".trim($suggestedName);
        }

        return $out;
    }

    public function transformForm(Form $form): object
    {
        return $this->formTransformer->transform($form);
    }

    private function getManifestSample(): string
    {
        $sample = [
            'name' => 'Contact Form',
            'fields' => [
                ['type' => 'Text', 'label' => 'Full Name', 'handle' => 'fullName', 'required' => true, 'placeholder' => 'Your name'],
                ['type' => 'Email', 'label' => 'Email Address', 'handle' => 'emailAddress', 'required' => true],
                ['type' => 'Phone', 'label' => 'Phone', 'handle' => 'phone', 'placeholder' => '(555) 000-0000'],
                ['type' => 'Textarea', 'label' => 'Message', 'handle' => 'message', 'required' => true, 'rows' => 4],
                ['type' => 'RichText', 'label' => 'Introduction', 'handle' => 'introduction', 'content' => '<p>Please fill out this form and we&apos;ll get back to you as soon as possible.</p>'],
                ['type' => 'Dropdown', 'label' => 'Subject', 'handle' => 'subject', 'required' => true, 'options' => ['General', 'Support', 'Sales']],
                ['type' => 'Rating', 'label' => 'Satisfaction', 'handle' => 'satisfaction', 'maxValue' => 5],
                ['type' => 'Checkbox', 'label' => 'Subscribe to newsletter', 'handle' => 'subscribe', 'defaultValue' => false],
            ],
        ];

        return json_encode($sample, \JSON_UNESCAPED_SLASHES | \JSON_PRETTY_PRINT);
    }

    /**
     * @return array{
     *   name?: string,
     *   fields: list<array{
     *     type: string,
     *     label: string,
     *     handle: string,
     *     pageIndex?: int,
     *     required?: bool,
     *     placeholder?: string,
     *     instructions?: string,
     *     rows?: int,
     *     options?: array,
     *     defaultValue?: mixed
     *   }>,
     *   pages?: list<array{label: string}>
     * }
     */
    private function parseAiResponse(string $response): array
    {
        $response = trim($response);
        if (preg_match('/```(?:json)?\s*([\s\S]*?)```/', $response, $m)) {
            $response = trim($m[1]);
        }
        $decoded = json_decode($response, true);
        if (!\is_array($decoded)) {
            $extracted = $this->extractJsonObject($response);
            if (null !== $extracted) {
                $decoded = $extracted;
            }
        }
        if (!\is_array($decoded)) {
            throw new \RuntimeException(Freeform::t('AI did not return valid JSON. Please try again or rephrase your request.'));
        }
        $name = isset($decoded['name']) && \is_string($decoded['name']) ? trim($decoded['name']) : null;

        $pagesMeta = [];
        $normalized = [];

        // Prefer explicit pages if provided.
        if (isset($decoded['pages']) && \is_array($decoded['pages']) && \count($decoded['pages']) > 0) {
            foreach ($decoded['pages'] as $pageIndex => $page) {
                if (!\is_array($page)) {
                    continue;
                }

                $pageLabel = isset($page['label']) && \is_string($page['label'])
                    ? trim($page['label'])
                    : Freeform::t('Page {n}', ['n' => $pageIndex + 1]);

                $pagesMeta[] = ['label' => $pageLabel];

                $fields = isset($page['fields']) && \is_array($page['fields']) ? $page['fields'] : [];
                foreach ($fields as $i => $field) {
                    if (!\is_array($field)) {
                        continue;
                    }

                    $normalized[] = $this->normalizeFieldFromAi($field, $i, $pageIndex);
                }
            }
        } else {
            // Fallback: single-page form with flat fields array.
            $fields = isset($decoded['fields']) && \is_array($decoded['fields']) ? $decoded['fields'] : [];
            foreach ($fields as $i => $field) {
                if (!\is_array($field)) {
                    continue;
                }

                $normalized[] = $this->normalizeFieldFromAi($field, $i, 0);
            }

            if (\count($normalized) > 0) {
                $pagesMeta[] = ['label' => Freeform::t('Page 1')];
            }
        }

        return ['name' => $name, 'fields' => $normalized, 'pages' => $pagesMeta];
    }

    /**
     * Normalize a single AI-provided field into our internal structure.
     *
     * @param array<string, mixed> $field
     *
     * @return array<string, mixed>
     */
    private function normalizeFieldFromAi(array $field, int $index, int $pageIndex): array
    {
        $type = isset($field['type']) && \is_string($field['type']) ? trim($field['type']) : 'Text';
        if (!isset(self::ALLOWED_FIELD_TYPES[$type])) {
            $type = 'Text';
        }
        $label = isset($field['label']) && \is_string($field['label']) ? trim($field['label']) : ('Field '.($index + 1));
        $handle = isset($field['handle']) && \is_string($field['handle']) ? trim($field['handle']) : $this->handleFromLabel($label, $index);

        $item = [
            'type' => $type,
            'label' => $label,
            'handle' => $handle,
            'pageIndex' => max(0, $pageIndex),
        ];

        if (isset($field['required'])) {
            $item['required'] = (bool) $field['required'];
        }
        if (isset($field['placeholder']) && \is_string($field['placeholder'])) {
            $item['placeholder'] = trim($field['placeholder']);
        }
        if (isset($field['instructions']) && \is_string($field['instructions'])) {
            $item['instructions'] = trim($field['instructions']);
        }
        if (isset($field['rows']) && is_numeric($field['rows'])) {
            $item['rows'] = (int) $field['rows'];
        }
        if (isset($field['options']) && \is_array($field['options'])) {
            $item['options'] = $field['options'];
        }
        if (\array_key_exists('defaultValue', $field)) {
            $item['defaultValue'] = $field['defaultValue'];
        }
        if (\array_key_exists('min', $field) && is_numeric($field['min'])) {
            $item['min'] = (int) $field['min'];
        }
        if (\array_key_exists('max', $field) && is_numeric($field['max'])) {
            $item['max'] = (int) $field['max'];
        }
        if (\array_key_exists('maxValue', $field) && is_numeric($field['maxValue'])) {
            $item['maxValue'] = (int) $field['maxValue'];
        }
        if (isset($field['content']) && \is_string($field['content'])) {
            $item['content'] = trim($field['content']);
        }

        return $item;
    }

    /**
     * Try to extract a JSON object from text that may have leading/trailing content or minor syntax issues.
     */
    private function extractJsonObject(string $text): ?array
    {
        $start = strpos($text, '{');
        if (false === $start) {
            return null;
        }
        $depth = 0;
        $inString = false;
        $escape = false;
        $quote = null;
        $len = \strlen($text);
        for ($i = $start; $i < $len; ++$i) {
            $c = $text[$i];
            if ($escape) {
                $escape = false;

                continue;
            }
            if ('\\' === $c && $inString) {
                $escape = true;

                continue;
            }
            if ($inString) {
                if ($c === $quote) {
                    $inString = false;
                }

                continue;
            }
            if ('"' === $c || "'" === $c) {
                $inString = true;
                $quote = $c;

                continue;
            }
            if ('{' === $c) {
                ++$depth;

                continue;
            }
            if ('}' === $c) {
                --$depth;
                if (0 === $depth) {
                    $chunk = substr($text, $start, $i - $start + 1);
                    $chunk = preg_replace('/,\s*([}\]])/', '$1', $chunk);
                    $decoded = json_decode($chunk, true);

                    return \is_array($decoded) ? $decoded : null;
                }
            }
        }

        return null;
    }

    private function handleFromLabel(string $label, int $index): string
    {
        $handle = preg_replace('/[^a-zA-Z0-9]+/', '', $label);

        return lcfirst($handle) ?: 'field'.$index;
    }

    private function generateHandle(string $name): string
    {
        $handle = preg_replace('/[^a-zA-Z0-9]+/', '_', $name);
        $handle = trim($handle, '_') ?: 'form';

        return strtolower($handle);
    }

    /**
     * Assigns each field to a row index. Full-width types (Textarea, FileUpload, etc.) get their own row;
     * compact types (Text, Email, Dropdown, etc.) share 2 per row.
     *
     * @param list<array{type: string, ...}> $fieldsData
     *
     * @return list<int> row index for each field
     */
    private function computeRowIndices(array $fieldsData): array
    {
        $indices = [];
        $currentRow = 0;
        $slotsUsed = 0;
        $slotsPerRow = 2;

        foreach ($fieldsData as $item) {
            $type = $item['type'] ?? 'Text';
            $fullWidth = \in_array($type, self::FULL_WIDTH_TYPES, true);

            if ($fullWidth) {
                if ($slotsUsed > 0) {
                    ++$currentRow;
                    $slotsUsed = 0;
                }
                $indices[] = $currentRow;
                ++$currentRow;
                $slotsUsed = 0;
            } else {
                if ($slotsUsed >= $slotsPerRow) {
                    ++$currentRow;
                    $slotsUsed = 0;
                }
                $indices[] = $currentRow;
                ++$slotsUsed;
            }
        }

        return $indices;
    }

    /**
     * Builds a persist payload that matches Freeform's form + layout structure so the
     * generated form looks and behaves like one created in the CP (settings, page buttons, rows, pages).
     *
     * @param list<array{
     *   type: string,
     *   label: string,
     *   handle: string,
     *   pageIndex?: int,
     *   required?: bool,
     *   placeholder?: string,
     *   instructions?: string,
     *   rows?: int,
     *   options?: array,
     *   defaultValue?: mixed,
     *   min?: int,
     *   max?: int
     * }> $fieldsData
     * @param null|list<array{label: string}> $pagesMeta
     */
    private function buildPersistPayload(string $formName, string $formHandle, array $fieldsData, ?array $pagesMeta = null): \stdClass
    {
        $formUid = StringHelper::UUID();
        $layoutUid = StringHelper::UUID();
        $form = (object) [
            'uid' => $formUid,
            'type' => Regular::class,
            'settings' => (object) [
                'general' => (object) [
                    'name' => $formName,
                    'handle' => $formHandle,
                    'type' => Regular::class,
                    'formattingTemplate' => '',
                    'storeData' => true,
                    'sites' => SitesHelper::getEditableSiteIds(),
                    'description' => '',
                ],
            ],
        ];

        // Build page metadata (single or multi-page), plus one layout per page.
        $pagesMeta = $pagesMeta && \count($pagesMeta) > 0 ? array_values($pagesMeta) : [['label' => Freeform::t('Page 1')]];

        $layouts = [];
        $pageLayoutUids = [];
        foreach ($pagesMeta as $index => $_meta) {
            $uid = StringHelper::UUID();
            $pageLayoutUids[$index] = $uid;
            $layouts[] = (object) ['uid' => $uid];
        }

        $pageButtons = (object) [
            'layout' => 'submit',
            'submitLabel' => Freeform::t('Submit'),
            'back' => false,
            'backLabel' => Freeform::t('Back'),
            'save' => false,
            'saveLabel' => Freeform::t('Save'),
            'saveRedirectUrl' => '',
        ];
        // Build pages, each tied to its own layout.
        $pages = [];
        foreach ($pagesMeta as $index => $meta) {
            $pageUid = StringHelper::UUID();
            $pages[] = (object) [
                'uid' => $pageUid,
                'layoutUid' => $pageLayoutUids[$index] ?? $layoutUid,
                'order' => $index,
                'label' => $meta['label'] ?? Freeform::t('Page {n}', ['n' => $index + 1]),
                'buttons' => $pageButtons,
            ];
        }

        // Group fields by page index.
        $grouped = [];
        foreach ($fieldsData as $idx => $item) {
            $pageIndex = isset($item['pageIndex']) && \is_int($item['pageIndex'])
                ? max(0, $item['pageIndex'])
                : 0;

            if (!isset($grouped[$pageIndex])) {
                $grouped[$pageIndex] = [];
            }

            $grouped[$pageIndex][] = ['index' => $idx, 'item' => $item];
        }

        ksort($grouped);

        $rows = [];
        $fields = [];
        $rowOrder = 0;

        foreach ($grouped as $pageIndex => $entries) {
            $layoutForPage = $pageLayoutUids[$pageIndex] ?? $layoutUid;

            // Compute row indices for this page's fields.
            $pageFields = array_map(static fn ($entry) => $entry['item'], $entries);
            $localRowIndices = $this->computeRowIndices($pageFields);

            // Create rows for this page.
            $pageRowUids = [];
            $maxLocalRow = \count($localRowIndices) > 0 ? max($localRowIndices) : -1;
            for ($i = 0; $i <= $maxLocalRow; ++$i) {
                $rowUid = StringHelper::UUID();
                $pageRowUids[$i] = $rowUid;
                $rows[] = (object) [
                    'uid' => $rowUid,
                    'layoutUid' => $layoutForPage,
                    'order' => $rowOrder++,
                ];
            }

            // Assign fields to rows for this page.
            foreach ($entries as $i => $entry) {
                $originalIndex = $entry['index'];
                $fieldData = $entry['item'];
                $localRowIndex = $localRowIndices[$i] ?? 0;
                $rowUid = $pageRowUids[$localRowIndex] ?? reset($pageRowUids);

                $typeClass = self::ALLOWED_FIELD_TYPES[$fieldData['type']] ?? TextField::class;
                $properties = $this->mergeFieldProperties($typeClass, $fieldData);
                $fields[] = (object) [
                    'uid' => StringHelper::UUID(),
                    'rowUid' => $rowUid,
                    'typeClass' => $typeClass,
                    'order' => $originalIndex,
                    'properties' => (object) $properties,
                ];
            }
        }

        $layout = (object) [
            'pages' => $pages,
            'layouts' => $layouts,
            'rows' => $rows,
            'fields' => $fields,
        ];

        return (object) [
            'form' => $form,
            'layout' => $layout,
        ];
    }

    /**
     * Merges AI-provided field data with type defaults. Converts "options" into
     * "optionConfiguration" for Dropdown/Radios/Checkboxes.
     *
     * @param array<string, mixed> $fromAi type, label, handle, and optional required, placeholder, instructions, rows, options, defaultValue, min, max
     */
    private function mergeFieldProperties(string $typeClass, array $fromAi): array
    {
        $optionTypes = [
            DropdownField::class,
            RadiosField::class,
            CheckboxesField::class,
            MultipleSelectField::class,
        ];

        if (isset($fromAi['options']) && \in_array($typeClass, $optionTypes, true)) {
            $fromAi['optionConfiguration'] = [
                'source' => 'custom',
                'useCustomValues' => false,
                'options' => $this->normalizeOptions($fromAi['options']),
            ];
            unset($fromAi['options']);
        }

        if (OpinionScaleField::class === $typeClass && isset($fromAi['options']) && \is_array($fromAi['options'])) {
            $scales = [];
            foreach ($fromAi['options'] as $i => $opt) {
                $value = \is_string($opt) ? $opt : (string) ($opt['value'] ?? $opt['label'] ?? $i);
                $label = \is_array($opt) && isset($opt['label']) ? (string) $opt['label'] : $value;
                $scales[] = ['value' => $value, 'label' => $label];
            }
            $fromAi['scales'] = $scales;
            unset($fromAi['options']);
        }

        if (RatingField::class === $typeClass && isset($fromAi['maxValue']) && is_numeric($fromAi['maxValue'])) {
            $max = (int) $fromAi['maxValue'];
            $fromAi['maxValue'] = max(1, min(10, $max));
        }

        if (NumberField::class === $typeClass && (\array_key_exists('min', $fromAi) || \array_key_exists('max', $fromAi))) {
            $fromAi['minMaxValues'] = [$fromAi['min'] ?? null, $fromAi['max'] ?? null];
            unset($fromAi['min'], $fromAi['max']);
        }

        unset($fromAi['type']);

        $properties = $this->propertyProvider->getEditableProperties($typeClass);
        $merged = [];
        foreach ($properties as $property) {
            $handle = $property->handle;
            $merged[$handle] = $fromAi[$handle] ?? $property->value;
        }
        foreach ($fromAi as $k => $v) {
            if (!\array_key_exists($k, $merged)) {
                $merged[$k] = $v;
            }
        }

        return $merged;
    }

    /**
     * @param array<int, array{label?: string, value?: string}|string> $options
     *
     * @return list<array{label: string, value: string, optgroup: bool}>
     */
    private function normalizeOptions(array $options): array
    {
        $out = [];
        foreach ($options as $opt) {
            if (\is_string($opt)) {
                $out[] = ['label' => $opt, 'value' => $opt, 'optgroup' => false];
            } elseif (\is_array($opt) && (isset($opt['label']) || isset($opt['value']))) {
                $label = $opt['label'] ?? $opt['value'] ?? '';
                $value = $opt['value'] ?? $opt['label'] ?? $label;
                $out[] = ['label' => (string) $label, 'value' => (string) $value, 'optgroup' => (bool) ($opt['optgroup'] ?? false)];
            }
        }

        return $out;
    }
}

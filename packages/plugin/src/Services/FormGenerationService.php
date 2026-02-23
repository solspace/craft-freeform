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
use Solspace\Freeform\Fields\Implementations\HiddenField;
use Solspace\Freeform\Fields\Implementations\NumberField;
use Solspace\Freeform\Fields\Implementations\Pro\PhoneField;
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

    /** Number of fields per row in the layout (creates a grid-style form). */
    private const FIELDS_PER_ROW = 2;

    /** @var array<string, string> short type => typeClass (v1 safe subset) */
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
        'Phone' => PhoneField::class,
        'Website' => WebsiteField::class,
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

        $payload = $this->buildPersistPayload($formName, $formHandle, $fieldsData);
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

            Output format:
            {"name": "Form Name", "fields": [ ... ]}

            Each field must have: "type", "label", "handle". You may include optional properties so the form renders correctly (not everything as a plain text box):

            - Text, Email, Phone, Website, Hidden: optional "placeholder", "instructions", "required" (boolean), "defaultValue"
            - Textarea: optional "placeholder", "instructions", "required", "rows" (number, e.g. 3 or 4)
            - Number: optional "instructions", "required", "defaultValue", "min", "max"
            - Dropdown, Radios, Checkboxes: optional "instructions", "required", "defaultValue", and MUST include "options" (array of option labels, e.g. ["Option A", "Option B"] or [{"label": "Display A", "value": "valueA"}, ...])
            - Checkbox: optional "instructions", "defaultValue" (e.g. true/false for checked by default)

            Sample output (manifest):
            {$manifest}

            Rules:
            - "name": string, optional form title.
            - "handle" must be camelCase or snake_case, unique in the form (e.g. fullName, emailAddress, messageBody).
            - Use the correct "type" for each field (Email for emails, Textarea for long text, Dropdown/Radios for choices, etc.) and include "options" for any choice field.
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
                ['type' => 'Textarea', 'label' => 'Message', 'handle' => 'message', 'required' => true, 'rows' => 4],
                ['type' => 'Dropdown', 'label' => 'Subject', 'handle' => 'subject', 'required' => true, 'options' => ['General', 'Support', 'Sales']],
            ],
        ];

        return json_encode($sample, \JSON_UNESCAPED_SLASHES | \JSON_PRETTY_PRINT);
    }

    /**
     * @return array{name?: string, fields: list<array{type: string, label: string, handle: string, required?: bool, placeholder?: string, instructions?: string, rows?: int, options?: array, defaultValue?: mixed}>}
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
        $fields = isset($decoded['fields']) && \is_array($decoded['fields']) ? $decoded['fields'] : [];
        $normalized = [];
        foreach ($fields as $i => $field) {
            if (!\is_array($field)) {
                continue;
            }
            $type = isset($field['type']) && \is_string($field['type']) ? trim($field['type']) : 'Text';
            if (!isset(self::ALLOWED_FIELD_TYPES[$type])) {
                $type = 'Text';
            }
            $label = isset($field['label']) && \is_string($field['label']) ? trim($field['label']) : ('Field '.($i + 1));
            $handle = isset($field['handle']) && \is_string($field['handle']) ? trim($field['handle']) : $this->handleFromLabel($label, $i);

            $item = ['type' => $type, 'label' => $label, 'handle' => $handle];

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

            $normalized[] = $item;
        }

        return ['name' => $name, 'fields' => $normalized];
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
     * Builds a persist payload that matches Freeform's form + layout structure so the
     * generated form looks and behaves like one created in the CP (settings, page buttons, rows).
     *
     * @param list<array{type: string, label: string, handle: string, required?: bool, placeholder?: string, instructions?: string, rows?: int, options?: array, defaultValue?: mixed, min?: int, max?: int}> $fieldsData
     */
    private function buildPersistPayload(string $formName, string $formHandle, array $fieldsData): \stdClass
    {
        $formUid = StringHelper::UUID();
        $layoutUid = StringHelper::UUID();
        $pageUid = StringHelper::UUID();

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

        $layouts = [(object) ['uid' => $layoutUid]];

        $pageButtons = (object) [
            'layout' => 'submit',
            'submitLabel' => Freeform::t('Submit'),
            'back' => false,
            'backLabel' => Freeform::t('Back'),
            'save' => false,
            'saveLabel' => Freeform::t('Save'),
            'saveRedirectUrl' => '',
        ];

        $pages = [(object) [
            'uid' => $pageUid,
            'layoutUid' => $layoutUid,
            'order' => 0,
            'label' => Freeform::t('Page 1'),
            'buttons' => $pageButtons,
        ]];

        $rowUids = [];
        $rows = [];
        $numRows = (int) ceil(\count($fieldsData) / self::FIELDS_PER_ROW) ?: 1;
        for ($i = 0; $i < $numRows; ++$i) {
            $rowUid = StringHelper::UUID();
            $rowUids[] = $rowUid;
            $rows[] = (object) [
                'uid' => $rowUid,
                'layoutUid' => $layoutUid,
                'order' => $i,
            ];
        }

        $fields = [];
        foreach ($fieldsData as $order => $item) {
            $rowIndex = (int) floor($order / self::FIELDS_PER_ROW);
            $rowUid = $rowUids[$rowIndex] ?? $rowUids[0];

            $typeClass = self::ALLOWED_FIELD_TYPES[$item['type']] ?? TextField::class;
            $properties = $this->mergeFieldProperties($typeClass, $item);
            $fields[] = (object) [
                'uid' => StringHelper::UUID(),
                'rowUid' => $rowUid,
                'typeClass' => $typeClass,
                'order' => $order,
                'properties' => (object) $properties,
            ];
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
        ];

        if (isset($fromAi['options']) && \in_array($typeClass, $optionTypes, true)) {
            $fromAi['optionConfiguration'] = [
                'source' => 'custom',
                'useCustomValues' => false,
                'options' => $this->normalizeOptions($fromAi['options']),
            ];
            unset($fromAi['options']);
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

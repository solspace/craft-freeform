<?php

namespace Solspace\Freeform\Integrations\CRM\Freshdesk;

use Carbon\Carbon;
use GuzzleHttp\Client;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Validators;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\Types\CRM\CRMIntegration;

#[Type(
    name: 'Freshdesk',
    readme: __DIR__.'/README.md',
    iconPath: __DIR__.'/icon.svg',
)]
class Freshdesk extends CRMIntegration
{
    public const LOG_CATEGORY = 'Freshdesk';

    #[Flag(self::FLAG_ENCRYPTED)]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Validators\Required]
    #[Input\Text(
        label: 'API Key',
        instructions: 'Enter your Freshdesk API key here.',
    )]
    protected string $apiKey = '';

    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Validators\Required]
    #[Input\Text(
        instructions: "Enter your Freshdesk Domain here, e.g. 'https://example.freshdesk.com'.",
    )]
    protected string $domain = '';

    #[Input\Text(
        label: 'Default Type (Optional)',
        instructions: "Set the default Type for tickets, e.g. 'Question'.",
    )]
    protected string $type = '';

    #[Input\Text(
        label: 'Default Priority (Optional)',
        instructions: "Set the default Priority for tickets, e.g. '1' (low).",
    )]
    protected string $priority = '';

    #[Input\Text(
        label: 'Default Status (Optional)',
        instructions: "Set the default Status for tickets, e.g. '2' (open).",
    )]
    protected string $status = '';

    #[Input\Text(
        label: 'Default Source (Optional)',
        instructions: "Set the default Source for tickets, e.g. '1' (email), '2' (portal), etc.",
    )]
    protected string $source = '';

    public function getApiKey(): string
    {
        return $this->getProcessedValue($this->apiKey);
    }

    public function getDomain(): string
    {
        return $this->getProcessedValue($this->domain);
    }

    public function getType(): string
    {
        return $this->getProcessedValue($this->type);
    }

    public function getPriority(): string
    {
        return $this->getProcessedValue($this->priority);
    }

    public function getStatus(): string
    {
        return $this->getProcessedValue($this->status);
    }

    public function getSource(): string
    {
        return $this->getProcessedValue($this->source);
    }

    public function initiateAuthentication(): void
    {
    }

    /**
     * Push objects to the CRM.
     *
     * @param null|mixed $formFields
     */
    public function push(array $keyValueList, $formFields = null): bool
    {
        $requestType = 'json';

        $values = $customValues = [];
        foreach ($keyValueList as $key => $value) {
            if (\is_string($value) && preg_match('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/', $value)) {
                $value = new Carbon($value, 'UTC');

                if (str_starts_with($key, 'cf_')) {
                    $value = $value->toDateString();
                } else {
                    $value = $value->toIso8601ZuluString();
                }
            }

            if (str_starts_with($key, 'cf_')) {
                if (!empty($value)) {
                    $customValues[$key] = $value;
                }
            } else {
                $values[$key] = $value;
            }
        }

        if ($customValues) {
            $values['custom_fields'] = $customValues;
        }

        if (!isset($values['status']) || !$values['status']) {
            $values['status'] = (int) ($this->getStatus() ?? 2);
        }

        if (!isset($values['priority']) || !$values['priority']) {
            $values['priority'] = (int) ($this->getPriority() ?? 1);
        }

        if (!isset($values['source']) || !$values['source']) {
            $values['source'] = (int) ($this->getSource() ?? 2);
        }

        if (!isset($values['type']) || !$values['type']) {
            $defaultType = $this->getType();
            if ($defaultType) {
                $values['type'] = $defaultType;
            }
        }

        if (isset($values['attachments']) && empty($values['attachments'])) {
            unset($values['attachments']);
        }

        if (isset($values['description']) && !empty($values['description'])) {
            $values['description'] = nl2br($values['description']);
        }

        if (isset($values['attachments']) && !empty($values['attachments'])) {
            $assetData = [];
            foreach ($values['attachments'] as $assetId) {
                if (is_numeric($assetId)) {
                    $asset = \Craft::$app->getAssets()->getAssetById($assetId);
                    if ($asset) {
                        $assetData[] = [
                            'name' => 'attachments[]',
                            'contents' => $asset->getStream(),
                            'headers' => ['Content-Type' => $asset->mimeType],
                        ];
                    }
                }
            }

            unset($values['attachments']);
            if (!empty($assetData)) {
                $multipartValues = [];
                foreach ($values as $key => $value) {
                    $multipartValues[] = [
                        'name' => $key,
                        'contents' => $value,
                        'headers' => ['Content-Type' => 'text'],
                    ];
                }
                $values = $multipartValues;

                $values = array_merge($values, $assetData);
                $requestType = 'multipart';
            }
        }

        $response = $this
            ->generateAuthorizedClient()
            ->post(
                $this->getEndpoint('/tickets'),
                [$requestType => $values]
            )
        ;

        return 200 === $response->getStatusCode();
    }

    /**
     * Check if it's possible to connect to the API.
     */
    public function checkConnection(): bool
    {
        $response = $this
            ->generateAuthorizedClient()
            ->get($this->getEndpoint('/tickets'))
        ;

        return 200 === $response->getStatusCode();
    }

    /**
     * Fetch the custom fields from the integration.
     *
     * @return FieldObject[]
     */
    public function fetchFields(): array
    {
        $fieldList = [
            new FieldObject('name', 'Name', FieldObject::TYPE_STRING),
            new FieldObject('email', 'Email', FieldObject::TYPE_STRING),
            new FieldObject('phone', 'Phone', FieldObject::TYPE_STRING),
            new FieldObject('unique_external_id', 'Unique External ID', FieldObject::TYPE_STRING),
            new FieldObject('subject', 'Subject', FieldObject::TYPE_STRING),
            new FieldObject('type', 'Type', FieldObject::TYPE_STRING),
            new FieldObject('status', 'Status', FieldObject::TYPE_NUMERIC),
            new FieldObject('priority', 'Priority', FieldObject::TYPE_NUMERIC),
            new FieldObject('description', 'Description', FieldObject::TYPE_STRING),
            new FieldObject('responder_id', 'Responder ID', FieldObject::TYPE_NUMERIC),
            new FieldObject('attachments', 'Attachments', FieldObject::TYPE_ARRAY),
            new FieldObject('cc_emails', 'CC Emails', FieldObject::TYPE_ARRAY),
            new FieldObject('due_by', 'Due By', FieldObject::TYPE_DATETIME),
            new FieldObject('email_config_id', 'Email Config ID', FieldObject::TYPE_NUMERIC),
            new FieldObject('fr_due_by', 'First Response Due By', FieldObject::TYPE_DATETIME),
            new FieldObject('group_id', 'Group ID', FieldObject::TYPE_NUMERIC),
            new FieldObject('product_id', 'Product ID', FieldObject::TYPE_NUMERIC),
            new FieldObject('source', 'Source', FieldObject::TYPE_NUMERIC),
            new FieldObject('tags', 'Tags', FieldObject::TYPE_ARRAY),
            new FieldObject('company_id', 'Company ID', FieldObject::TYPE_NUMERIC),
        ];

        $response = $this
            ->getAuthorizedClient()
            ->get($this->getEndpoint('/ticket_fields'))
        ;

        $data = json_decode($response->getBody(), false);
        foreach ($data as $field) {
            if ($field->default) {
                continue;
            }

            $type = null;

            switch ($field->type) {
                case 'custom_text':
                case 'custom_dropdown':
                case 'custom_paragraph':
                    $type = FieldObject::TYPE_STRING;

                    break;

                case 'custom_date':
                    $type = FieldObject::TYPE_DATETIME;

                    break;

                case 'custom_checkbox':
                    $type = FieldObject::TYPE_BOOLEAN;

                    break;

                case 'custom_decimal':
                case 'custom_number':
                    $type = FieldObject::TYPE_NUMERIC;

                    break;
            }

            if (null === $type) {
                continue;
            }

            $fieldObject = new FieldObject(
                $field->name,
                $field->label,
                $type,
                $field->required_for_customers
            );

            $fieldList[] = $fieldObject;
        }

        return $fieldList;
    }

    public function getApiRootUrl(): string
    {
        return sprintf('https://%s.freshdesk.com/api/v2/', $this->getSubdomain());
    }

    public function generateAuthorizedClient(): Client
    {
        return new Client([
            'headers' => ['Content-Type' => 'application/json'],
            'auth' => [$this->getApiKey(), 'password'],
        ]);
    }

    private function getSubdomain(): string
    {
        $domain = $this->getDomain();

        if (preg_match('/https:\/\/(.*).freshdesk.com/', $domain, $matches)) {
            return $matches[1];
        }

        return $domain ?? 'invalid';
    }
}

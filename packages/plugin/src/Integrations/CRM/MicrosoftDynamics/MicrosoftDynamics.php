<?php

namespace Solspace\Freeform\Integrations\CRM\MicrosoftDynamics;

use GuzzleHttp\Client;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Delimiter;
use Solspace\Freeform\Attributes\Property\Edition;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Implementations\FieldMapping\FieldMapping;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Input\Special\Properties\FieldMappingTransformer;
use Solspace\Freeform\Attributes\Property\Validators\Required;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\Types\CRM\CRMIntegration;

#[Edition(Edition::PRO)]
#[Type(
    name: 'Microsoft Dynamics 365',
    type: Type::TYPE_CRM,
    version: 'v9.2',
    readme: __DIR__.'/README.md',
    iconPath: __DIR__.'/icon.svg',
)]
class MicrosoftDynamics extends CRMIntegration
{
    public const CATEGORY_LEAD = 'lead';
    public const CATEGORY_CONTACT = 'contact';

    protected const LOG_CATEGORY = 'Microsoft Dynamics 365';

    private const ENTITY_SETS = [self::CATEGORY_LEAD => 'leads', self::CATEGORY_CONTACT => 'contacts'];

    #[Required]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Flag(self::FLAG_ENV_SUGGEST)]
    #[Input\Text(
        label: 'Environment URL',
        instructions: 'Enter the Dynamics 365 environment URL, e.g. `https://yourorg.crm.dynamics.com`, without an API path. Commercial cloud environments only.',
        order: 1,
    )]
    protected string $environmentUrl = '';

    #[Required]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Flag(self::FLAG_ENV_SUGGEST)]
    #[Input\Text(label: 'Directory (Tenant) ID', instructions: 'Enter the tenant ID from your Microsoft Entra app registration.', order: 2)]
    protected string $tenantId = '';

    #[Required]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Flag(self::FLAG_ENV_SUGGEST)]
    #[Input\Text(label: 'Application (Client) ID', instructions: 'Enter the client ID from your Microsoft Entra app registration.', order: 3)]
    protected string $clientId = '';

    #[Required]
    #[Flag(self::FLAG_ENCRYPTED)]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Flag(self::FLAG_ENV_SUGGEST)]
    #[Input\Text(label: 'Client Secret', instructions: 'Enter the client secret value, not its ID. The app also needs a Dataverse application user with permission to create the mapped records.', order: 4)]
    protected string $clientSecret = '';

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[VisibilityFilter('Boolean(enabled)')]
    #[Delimiter('Leads')]
    #[Input\Boolean(label: 'Map to Leads', instructions: 'Create a new Lead for each submission. Existing Leads are not updated.', order: 10)]
    protected bool $mapLeads = false;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(FieldMappingTransformer::class)]
    #[VisibilityFilter('Boolean(enabled)')]
    #[VisibilityFilter('values.mapLeads')]
    #[Input\Special\Properties\FieldMapping(
        instructions: 'Map Freeform fields to writable Dynamics Lead fields. Use the underlying numeric values for choice fields.',
        order: 11,
        source: 'api/integrations/crm/fields/'.self::CATEGORY_LEAD,
        parameterFields: ['id' => 'id'],
    )]
    protected ?FieldMapping $leadMapping = null;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[VisibilityFilter('Boolean(enabled)')]
    #[Delimiter('Contacts')]
    #[Input\Boolean(label: 'Map to Contacts', instructions: 'Create a new Contact for each submission. Existing Contacts are not updated.', order: 20)]
    protected bool $mapContacts = false;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(FieldMappingTransformer::class)]
    #[VisibilityFilter('Boolean(enabled)')]
    #[VisibilityFilter('values.mapContacts')]
    #[Input\Special\Properties\FieldMapping(
        instructions: 'Map Freeform fields to writable Dynamics Contact fields. Use the underlying numeric values for choice fields.',
        order: 21,
        source: 'api/integrations/crm/fields/'.self::CATEGORY_CONTACT,
        parameterFields: ['id' => 'id'],
    )]
    protected ?FieldMapping $contactMapping = null;

    public function getEnvironmentUrl(): string
    {
        $url = rtrim(trim((string) $this->getProcessedValue($this->environmentUrl)), '/');
        // Keep bearer tokens on supported Microsoft hosts and reject paths, credentials and ports.
        if (!preg_match('~^https://[a-z0-9][a-z0-9-]*\.(?:api\.)?crm\d*\.dynamics\.com$~iD', $url)) {
            throw new IntegrationException('Enter a commercial Dynamics 365 HTTPS environment URL, such as https://yourorg.crm.dynamics.com, without an API path.');
        }

        return strtolower($url);
    }

    public function getTenantId(): string
    {
        return $this->getGuidSetting($this->tenantId, 'Directory (Tenant) ID');
    }

    public function getClientId(): string
    {
        return $this->getGuidSetting($this->clientId, 'Application (Client) ID');
    }

    public function getClientSecret(): string
    {
        $secret = (string) $this->getProcessedValue($this->clientSecret);
        if ('' === trim($secret)) {
            throw new IntegrationException('Enter the Microsoft Dynamics client secret value.');
        }

        return $secret;
    }

    public function getApiRootUrl(): string
    {
        return $this->getEnvironmentUrl().'/api/data/v9.2';
    }

    public function onBeforeSave(): void
    {
        $this->getEnvironmentUrl();
        $this->getTenantId();
        $this->getClientId();
        $this->getClientSecret();
    }

    public function checkConnection(Client $client): bool
    {
        $response = $client->get($this->getEndpoint('WhoAmI'));
        $data = json_decode((string) $response->getBody(), true);

        return 200 === $response->getStatusCode() && !empty($data['UserId']);
    }

    public function fetchFields(string $category, Client $client): array
    {
        $this->getEntitySet($category);
        $endpoint = "EntityDefinitions(LogicalName='{$category}')/Attributes";
        $attributes = $this->getMetadata($client, $endpoint, [
            '$select' => 'LogicalName,DisplayName,AttributeType,AttributeTypeName,IsValidForCreate,IsLogical,AttributeOf,RequiredLevel',
            '$filter' => 'IsValidForCreate eq true',
        ]);

        $details = [];
        $metadataTypes = [
            'Picklist' => 'PicklistAttributeMetadata',
            'MultiSelectPicklistType' => 'MultiSelectPicklistAttributeMetadata',
            'DateTime' => 'DateTimeAttributeMetadata',
        ];
        foreach ($metadataTypes as $type => $metadataType) {
            if (!array_filter($attributes, fn (array $attribute) => $type === $this->getAttributeType($attribute))) {
                continue;
            }

            $query = ['$select' => 'LogicalName', '$filter' => 'IsValidForCreate eq true'];
            if ('DateTime' === $type) {
                $query['$select'] .= ',DateTimeBehavior';
            } else {
                $query['$expand'] = 'OptionSet,GlobalOptionSet';
            }

            foreach ($this->getMetadata($client, $endpoint.'/Microsoft.Dynamics.CRM.'.$metadataType, $query) as $attribute) {
                $details[$attribute['LogicalName']] = $attribute;
            }
        }

        $fields = [];
        foreach ($attributes as $attribute) {
            if (true !== ($attribute['IsValidForCreate'] ?? false)
                || ($attribute['IsLogical'] ?? false)
                || !empty($attribute['AttributeOf'])
            ) {
                continue;
            }

            $handle = $attribute['LogicalName'];
            $attributeType = $this->getAttributeType($attribute);
            $type = match ($attributeType) {
                'String', 'Memo' => FieldObject::TYPE_STRING,
                'Integer', 'Picklist' => FieldObject::TYPE_NUMERIC,
                'Decimal', 'Double' => FieldObject::TYPE_FLOAT,
                'Boolean' => FieldObject::TYPE_BOOLEAN,
                'MultiSelectPicklistType' => FieldObject::TYPE_ARRAY,
                'DateTime' => match ($details[$handle]['DateTimeBehavior']['Value'] ?? null) {
                    'DateOnly' => FieldObject::TYPE_DATE,
                    'UserLocal' => FieldObject::TYPE_DATETIME,
                    default => null,
                },
                default => null,
            };
            if (null === $type) {
                continue;
            }

            $options = null;
            if (\in_array($attributeType, ['Picklist', 'MultiSelectPicklistType'], true)) {
                $choices = $details[$handle]['OptionSet']['Options'] ?? $details[$handle]['GlobalOptionSet']['Options'] ?? null;
                if (!\is_array($choices)) {
                    throw new IntegrationException('Microsoft Dynamics did not return choices for '.$handle.'. Refresh the integration fields.');
                }

                $options = [];
                foreach ($choices as $option) {
                    $options[] = ['key' => $option['Value'], 'label' => $this->getLabel($option['Label'] ?? [], (string) $option['Value'])];
                }
            }

            $fields[] = new FieldObject(
                $handle,
                $this->getLabel($attribute['DisplayName'] ?? [], $handle),
                $type,
                $category,
                \in_array($attribute['RequiredLevel']['Value'] ?? '', ['SystemRequired', 'ApplicationRequired'], true),
                $options,
            );
        }

        return $fields;
    }

    public function push(Form $form, Client $client): void
    {
        $payloads = [];
        foreach ([self::CATEGORY_LEAD => $this->mapLeads, self::CATEGORY_CONTACT => $this->mapContacts] as $category => $enabled) {
            if (!$enabled) {
                continue;
            }

            $mapping = $this->processMapping($form, $this->{$category.'Mapping'}, $category);
            $mapping = array_filter($mapping, static fn ($value) => null !== $value && '' !== $value && [] !== $value);
            if ($mapping) {
                $payloads[$category] = $this->triggerPushEvent($category, $mapping);
            }
        }

        // Prepare every mapping before writing, so a local conversion error cannot cause a partial push.
        foreach ($payloads as $category => $payload) {
            if (!$payload) {
                continue;
            }

            $response = $client->post($this->getEndpoint($this->getEntitySet($category)), [
                'headers' => ['Prefer' => 'return=minimal', 'MSCRM.SuppressDuplicateDetection' => 'false'],
                'json' => $payload,
            ]);
            if (!\in_array($response->getStatusCode(), [201, 204], true)) {
                throw new IntegrationException('Microsoft Dynamics did not confirm creation of the '.$category.'.');
            }

            $this->triggerAfterResponseEvent($category, $response);
            $this->logger->info('Microsoft Dynamics '.$category.' created.');
        }
    }

    private function getEntitySet(string $category): string
    {
        if (!isset(self::ENTITY_SETS[$category])) {
            throw new IntegrationException('Unsupported Microsoft Dynamics record type.');
        }

        return self::ENTITY_SETS[$category];
    }

    private function getGuidSetting(string $value, string $label): string
    {
        $value = trim((string) $this->getProcessedValue($value));
        if (!preg_match('/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/iD', $value)) {
            throw new IntegrationException('Enter a valid Microsoft '.$label.'.');
        }

        return $value;
    }

    private function getAttributeType(array $attribute): string
    {
        if ('MultiSelectPicklistType' === ($attribute['AttributeTypeName']['Value'] ?? null)) {
            return 'MultiSelectPicklistType';
        }

        return $attribute['AttributeType'] ?? '';
    }

    private function getLabel(array $label, string $fallback): string
    {
        return $label['UserLocalizedLabel']['Label'] ?? $label['LocalizedLabels'][0]['Label'] ?? $fallback;
    }

    private function getMetadata(Client $client, string $endpoint, array $query): array
    {
        $response = $client->get($this->getEndpoint($endpoint), ['query' => $query]);
        $data = json_decode((string) $response->getBody(), true);
        // Dataverse metadata queries return all matching definitions without paging.
        if (200 !== $response->getStatusCode() || !isset($data['value']) || !\is_array($data['value'])) {
            throw new IntegrationException('Microsoft Dynamics returned invalid field metadata.');
        }

        foreach ($data['value'] as $attribute) {
            if (!\is_array($attribute) || !isset($attribute['LogicalName']) || !\is_string($attribute['LogicalName'])) {
                throw new IntegrationException('Microsoft Dynamics returned an invalid field definition.');
            }
        }

        return $data['value'];
    }
}

<?php

namespace Solspace\Freeform\Integrations\Other\Supabase;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use GuzzleHttp\Exception\RequestException;
use Psr\Http\Message\ResponseInterface;
use Solspace\Freeform\Attributes\Integration\Type;
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
use Solspace\Freeform\Library\Integrations\Types\CRM\CRMIntegration;

#[Edition(Edition::PRO)]
#[Type(
    name: 'Supabase',
    type: Type::TYPE_OTHER,
    version: 'v1',
    readme: __DIR__.'/README.md',
    iconPath: __DIR__.'/icon.svg',
)]
class Supabase extends CRMIntegration
{
    public const TYPE_JSON = 'supabase-json';

    #[Required]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Flag(self::FLAG_ENV_SUGGEST)]
    #[Input\Text(
        label: 'Project URL',
        instructions: 'Enter your Supabase HTTPS project URL without an API path, e.g. `https://your-project.supabase.co`.',
        order: 1,
    )]
    protected string $projectUrl = '';

    #[Required]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Flag(self::FLAG_ENV_SUGGEST)]
    #[Flag(self::FLAG_ENCRYPTED)]
    #[Input\Text(
        label: 'Secret API Key',
        instructions: 'Enter a Supabase secret key (`sb_secret_...`) or legacy service-role key. This server-side key bypasses Row Level Security. Use an environment variable to keep it out of project config.',
        order: 2,
    )]
    protected string $apiKey = '';

    #[Required]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Flag(self::FLAG_ENV_SUGGEST)]
    #[Input\Text(
        label: 'Database Schema',
        instructions: 'Enter the schema exposed through the Supabase Data API. Usually `public`.',
        order: 3,
    )]
    protected string $schema = 'public';

    #[Required]
    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[VisibilityFilter('Boolean(enabled)')]
    #[Input\DynamicSelect(
        label: 'Supabase Table',
        instructions: 'Choose the table that should receive a new row for each submission.',
        order: 4,
        emptyOption: 'Select a table',
        source: 'api/supabase/tables',
        parameterFields: ['id' => 'integrationId'],
    )]
    protected string $table = '';

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[VisibilityFilter('Boolean(enabled)')]
    #[VisibilityFilter('Boolean(values.table)')]
    #[Input\Text(
        label: 'Submission UID Column (optional)',
        instructions: 'To prevent duplicate inserts, enter a text or UUID column with a UNIQUE constraint. Freeform fills it with the saved submission UID and ignores repeat deliveries. Requires submission storage to be enabled.',
        order: 5,
        placeholder: 'freeform_submission_uid',
    )]
    protected string $submissionUidColumn = '';

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(FieldMappingTransformer::class)]
    #[VisibilityFilter('Boolean(enabled)')]
    #[VisibilityFilter('Boolean(values.table)')]
    #[Input\Special\Properties\FieldMapping(
        instructions: 'Map Freeform fields to Supabase columns. Leave columns with database defaults unmapped. Custom values can include submission metadata.',
        order: 6,
        source: 'api/supabase/fields',
        parameterFields: ['id' => 'integrationId', 'values.table' => 'table'],
    )]
    protected ?FieldMapping $fieldMapping = null;

    public function getProjectUrl(): string
    {
        $url = rtrim(trim((string) $this->getProcessedValue($this->projectUrl)), '/');
        $parts = parse_url($url);
        if (!filter_var($url, \FILTER_VALIDATE_URL) || !$parts
            || 'https' !== strtolower($parts['scheme'] ?? '') || empty($parts['host'])
            || isset($parts['user']) || isset($parts['pass'])
            || isset($parts['query']) || isset($parts['fragment']) || !empty($parts['path'])
        ) {
            throw new IntegrationException('Enter a Supabase HTTPS project URL without credentials, an API path, query parameters, or a fragment.');
        }

        return 'https://'.strtolower($parts['host']).(isset($parts['port']) ? ':'.$parts['port'] : '');
    }

    public function getApiKey(): string
    {
        $key = trim((string) $this->getProcessedValue($this->apiKey));
        if (preg_match('/^sb_secret_[A-Za-z0-9_-]+$/D', $key)) {
            return $key;
        }

        // Only accept legacy server keys, not public anon JWTs or user tokens.
        $parts = explode('.', $key);
        if (3 === \count($parts) && preg_match('/^[A-Za-z0-9_.-]+$/D', $key)) {
            $claims = json_decode((string) base64_decode(strtr($parts[1], '-_', '+/'), true), true);
            if (\is_array($claims) && 'service_role' === ($claims['role'] ?? null)) {
                return $key;
            }
        }

        throw new IntegrationException('Enter a Supabase secret API key or legacy service-role key, not a publishable or anon key.');
    }

    public function getSchema(): string
    {
        return SupabaseSchema::identifier(trim((string) $this->getProcessedValue($this->schema)));
    }

    public function getApiRootUrl(): string
    {
        return $this->getProjectUrl().'/rest/v1';
    }

    public function getFieldCategory(string $table): string
    {
        return $this->getSchema().'.'.SupabaseSchema::identifier($table);
    }

    public function onBeforeSave(): void
    {
        $this->getProjectUrl();
        $this->getApiKey();
        $this->getSchema();
    }

    public function checkConnection(Client $client): bool
    {
        $this->getOpenApi($client);

        return true;
    }

    public function fetchTables(Client $client): array
    {
        return SupabaseSchema::tables($this->getOpenApi($client));
    }

    public function fetchFields(string $category, Client $client): array
    {
        $prefix = $this->getSchema().'.';
        if (!str_starts_with($category, $prefix)) {
            throw new IntegrationException('The Supabase field schema does not match the configured database schema.');
        }
        $table = SupabaseSchema::identifier(substr($category, \strlen($prefix)));

        return SupabaseSchema::fields($this->getOpenApi($client), $table, $category);
    }

    public function push(Form $form, Client $client): void
    {
        if (!$this->table || null === $this->fieldMapping) {
            return;
        }

        $category = $this->getFieldCategory($this->table);
        $mapping = $this->processMapping($form, $this->fieldMapping, $category);
        // Omit empty values so database defaults can apply. Preserve zero, false and JSON/array values.
        $mapping = array_filter($mapping, static fn ($value) => null !== $value && '' !== $value);
        if (!$mapping) {
            return;
        }
        $mapping = $this->triggerPushEvent($category, $mapping);
        if (!$mapping) {
            return;
        }

        $options = ['headers' => ['Prefer' => 'return=minimal']];
        if ('' !== trim($this->submissionUidColumn)) {
            $column = SupabaseSchema::identifier(trim($this->submissionUidColumn));
            $uid = $form->getSubmission()?->uid;
            if (!$uid) {
                throw new IntegrationException('Supabase duplicate prevention requires a saved Freeform submission. Enable submission storage or clear the Submission UID Column setting.');
            }
            $mapping[$column] = $uid;
            $options['headers']['Prefer'] .= ',resolution=ignore-duplicates';
            $options['query'] = ['on_conflict' => $column];
        }
        $options['json'] = $mapping;

        $response = $this->request($client, 'POST', SupabaseSchema::identifier($this->table), $options);
        if (!\in_array($response->getStatusCode(), [200, 201, 204], true)) {
            throw new IntegrationException('Supabase did not confirm the table insert.');
        }

        $this->triggerAfterResponseEvent($category, $response);
        $this->logger->info('Supabase table insert completed.', ['schema' => $this->getSchema(), 'table' => $this->table]);
    }

    private function getOpenApi(Client $client): array
    {
        $response = $this->request($client, 'GET', '', ['headers' => ['Accept' => 'application/openapi+json']]);
        $data = json_decode((string) $response->getBody(), true);
        if (200 !== $response->getStatusCode() || !\is_array($data)
            || !isset($data['paths'], $data['definitions'])
            || !\is_array($data['paths']) || !\is_array($data['definitions'])
        ) {
            throw new IntegrationException('Supabase did not return table metadata. Enable the Data API and OpenAPI support for the configured schema.');
        }

        return $data;
    }

    private function request(Client $client, string $method, string $endpoint, array $options = []): ResponseInterface
    {
        try {
            $response = $client->request($method, $this->getEndpoint(rawurlencode($endpoint)), $options);
        } catch (GuzzleException $exception) {
            $status = $exception instanceof RequestException ? $exception->getResponse()?->getStatusCode() : null;

            // Do not retain the original Guzzle exception: its request contains the secret key.
            throw new IntegrationException(null === $status
                ? 'Could not reach Supabase. Check the project URL and network connection.'
                : 'Supabase request failed (HTTP '.$status.'). Check the API key, schema, table grants, column types, and constraints.');
        }
        if ($response->getStatusCode() >= 300) {
            throw new IntegrationException('Supabase request failed (HTTP '.$response->getStatusCode().'). Check the API key, schema, table grants, column types, and constraints.');
        }

        return $response;
    }
}

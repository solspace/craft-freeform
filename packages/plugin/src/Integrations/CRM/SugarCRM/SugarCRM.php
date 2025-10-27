<?php

namespace Solspace\Freeform\Integrations\CRM\SugarCRM;

use craft\helpers\StringHelper;
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
use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2PasswordTrait;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2RefreshTokenTrait;
use Solspace\Freeform\Library\Integrations\Types\CRM\CRMIntegration;

#[Edition(Edition::PRO)]
#[Type(
    name: 'SugarCRM',
    type: Type::TYPE_CRM,
    version: 'v1',
    readme: __DIR__.'/README.md',
    iconPath: __DIR__.'/icon.svg',
)]
class SugarCRM extends CRMIntegration implements SugarIntegrationInterface
{
    use OAuth2PasswordTrait;
    use OAuth2RefreshTokenTrait;

    protected const LOG_CATEGORY = 'SugarCRM';

    protected const CATEGORY_LEAD = 'Leads';
    protected const CATEGORY_OPPORTUNITY = 'Opportunities';
    protected const CATEGORY_ACCOUNT = 'Accounts';
    protected const CATEGORY_CONTACT = 'Contacts';

    protected const CATEGORIES = [
        self::CATEGORY_LEAD,
        self::CATEGORY_OPPORTUNITY,
        self::CATEGORY_ACCOUNT,
        self::CATEGORY_CONTACT,
    ];

    #[Required]
    #[Flag(self::FLAG_ENV_SUGGEST)]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Input\Text(
        label: 'Domain Name',
        instructions: 'Enter the full domain name of the SugarCRM instance, e.g. `https://your-domain.sugarcrm.eu`',
    )]
    protected string $domain = '';

    #[Flag(IntegrationInterface::FLAG_ENCRYPTED)]
    #[Flag(IntegrationInterface::FLAG_INTERNAL)]
    #[Input\Hidden]
    protected string $accessToken = '';

    #[Flag(IntegrationInterface::FLAG_ENCRYPTED)]
    #[Flag(IntegrationInterface::FLAG_INTERNAL)]
    #[Input\Hidden]
    protected string $downloadToken = '';

    #[Flag(IntegrationInterface::FLAG_INTERNAL)]
    #[Input\Hidden]
    protected string $scope = '';

    // ==========================================
    //                  Leads
    // ==========================================

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[VisibilityFilter('Boolean(enabled)')]
    #[Delimiter('Leads')]
    #[Input\Boolean(
        label: 'Map to Leads',
        instructions: 'Map submission data to create Leads in SugarCRM.',
        order: 4,
    )]
    protected bool $mapLeads = false;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(FieldMappingTransformer::class)]
    #[VisibilityFilter('Boolean(enabled)')]
    #[VisibilityFilter('values.mapLeads')]
    #[Input\Special\Properties\FieldMapping(
        instructions: 'Select the Freeform fields to be mapped to the applicable SugarCRM Lead fields.',
        order: 10,
        source: 'api/integrations/crm/fields/'.self::CATEGORY_LEAD,
        parameterFields: ['id' => 'id'],
    )]
    protected ?FieldMapping $leadMapping = null;

    // ==========================================
    //                 Contacts
    // ==========================================

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[VisibilityFilter('Boolean(enabled)')]
    #[Delimiter('Contacts')]
    #[Input\Boolean(
        label: 'Map to Contacts',
        instructions: 'Map submission data to create Contacts in SugarCRM.',
        order: 20,
    )]
    protected bool $mapContacts = false;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(FieldMappingTransformer::class)]
    #[VisibilityFilter('Boolean(enabled)')]
    #[VisibilityFilter('values.mapContacts')]
    #[Input\Special\Properties\FieldMapping(
        instructions: 'Select the Freeform fields to be mapped to the applicable SugarCRM Contact fields.',
        order: 24,
        source: 'api/integrations/crm/fields/'.self::CATEGORY_CONTACT,
        parameterFields: ['id' => 'id'],
    )]
    protected ?FieldMapping $contactMapping = null;

    // ==========================================
    //                 Accounts
    // ==========================================

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[VisibilityFilter('Boolean(enabled)')]
    #[Delimiter('Accounts')]
    #[Input\Boolean(
        label: 'Map to Accounts',
        instructions: 'Map submission data to create Accounts in SugarCRM.',
        order: 16,
    )]
    protected bool $mapAccounts = false;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(FieldMappingTransformer::class)]
    #[VisibilityFilter('Boolean(enabled)')]
    #[VisibilityFilter('values.mapAccounts')]
    #[Input\Special\Properties\FieldMapping(
        instructions: 'Select the Freeform fields to be mapped to the applicable SugarCRM Account fields.',
        order: 19,
        source: 'api/integrations/crm/fields/'.self::CATEGORY_ACCOUNT,
        parameterFields: ['id' => 'id'],
    )]
    protected ?FieldMapping $accountMapping = null;

    // ==========================================
    //               Opportunities
    // ==========================================

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[VisibilityFilter('Boolean(enabled)')]
    #[Delimiter('Opportunities')]
    #[Input\Boolean(
        label: 'Map to Opportunities',
        instructions: 'Map submission data to create Opportunities in SugarCRM.',
        order: 11,
    )]
    protected bool $mapOpportunities = false;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(FieldMappingTransformer::class)]
    #[VisibilityFilter('Boolean(enabled)')]
    #[VisibilityFilter('values.mapOpportunities')]
    #[Input\Special\Properties\FieldMapping(
        instructions: 'Select the Freeform fields to be mapped to the applicable SugarCRM Opportunity fields.',
        order: 15,
        source: 'api/integrations/crm/fields/'.self::CATEGORY_OPPORTUNITY,
        parameterFields: ['id' => 'id'],
    )]
    protected ?FieldMapping $opportunityMapping = null;

    public function getDomain(): string
    {
        return $this->getProcessedValue($this->domain);
    }

    public function getAccessToken(): string
    {
        return $this->accessToken;
    }

    public function setAccessToken(string $accessToken): self
    {
        $this->accessToken = $accessToken;

        return $this;
    }

    public function getDownloadToken(): string
    {
        return $this->downloadToken;
    }

    public function setDownloadToken(string $downloadToken): void
    {
        $this->downloadToken = $downloadToken;
    }

    public function getScope(): string
    {
        return $this->scope;
    }

    public function setScope(string $scope): void
    {
        $this->scope = $scope;
    }

    public function getApiRootUrl(): string
    {
        return $this->getDomain().'/rest/v11';
    }

    public function checkConnection(Client $client): bool
    {
        $response = $client->get($this->getEndpoint('/Leads'));

        return 200 === $response->getStatusCode();
    }

    public function getAuthorizeUrl(): string
    {
        return $this->getApiRootUrl().'/oauth2/authorize';
    }

    public function getAccessTokenUrl(): string
    {
        return $this->getApiRootUrl().'/oauth2/token';
    }

    public function push(Form $form, Client $client): void
    {
        foreach (self::CATEGORIES as $category) {
            $this->processData($category, $form, $client);
        }
    }

    public function fetchFields(string $category, Client $client): array
    {
        $response = $client->get($this->getEndpoint('/metadata'), [
            'query' => [
                'type_filter' => 'modules',
                'module_filter' => $category,
            ],
        ]);

        $json = json_decode((string) $response->getBody());

        $fields = $json->modules->{$category}->fields;
        if (!$fields) {
            throw new IntegrationException('Could not fetch fields for '.$category);
        }

        $supportedFields = [
            'text',
            'varchar',
            'char',
            'enum',
            'multienum',
            'phone',
            'exact',
            'url',
            'link',
            'email',
            'name',
            'yim',
            'int',
            'bool',
            'time',
            'date',
            'datetime',
        ];

        $fieldList = [];
        foreach ($fields as $handle => $field) {
            if (!\is_object($field)) {
                continue;
            }

            $type = $field->type;
            if (!\in_array($type, $supportedFields, true)) {
                continue;
            }

            $type = match ($field->type) {
                'date' => FieldObject::TYPE_DATE,
                'datetime' => FieldObject::TYPE_DATETIME,
                'multienum' => FieldObject::TYPE_ARRAY,
                'int' => FieldObject::TYPE_NUMERIC,
                'bool' => FieldObject::TYPE_BOOLEAN,
                default => 'string',
            };

            $fieldList[] = new FieldObject(
                $handle,
                StringHelper::humanize($field->name),
                $type,
                $category,
                false,
                null,
            );
        }

        return $fieldList;
    }

    private function processData(string $category, Form $form, Client $client): void
    {
        if (!$this->{'map'.$category}) {
            $this->logger->debug("No {$category} mapped, skipping.");

            return;
        }

        $singular = rtrim($category, 's');
        $mappingProperty = lcfirst($singular).'Mapping';

        $mapping = $this->processMapping($form, $this->{$mappingProperty}, $category);
        if (!$mapping) {
            return;
        }

        $mapping = $this->triggerPushEvent($category, $mapping);

        [$response, $json] = $this->getJsonResponse(
            $client->post(
                $this->getEndpoint($category),
                ['json' => $mapping],
            )
        );

        $this->logger->info("New {$category} created", ['id' => $json->id]);
        $this->logger->debug('With Mapping', $mapping);

        $this->triggerAfterResponseEvent($category, $response);
    }
}

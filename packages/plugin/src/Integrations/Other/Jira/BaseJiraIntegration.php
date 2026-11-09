<?php

namespace Solspace\Freeform\Integrations\Other\Jira;

use GuzzleHttp\Client;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Validators;
use Solspace\Freeform\Attributes\Property\ValueGenerator;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2ConnectorInterface;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2RefreshTokenInterface;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2RefreshTokenTrait;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2Trait;
use Solspace\Freeform\Library\Integrations\OAuth\ReturnURLValueGenerator;
use Solspace\Freeform\Library\Integrations\PushableInterface;
use Solspace\Freeform\Library\Integrations\Rules\RulesBasedInterface;
use Solspace\Freeform\Library\Integrations\Rules\RulesTrait;
use Solspace\Freeform\Library\Integrations\Types\CRM\CRMIntegration;

abstract class BaseJiraIntegration extends CRMIntegration implements JiraIntegrationInterface, OAuth2ConnectorInterface, OAuth2RefreshTokenInterface, PushableInterface, RulesBasedInterface
{
    use OAuth2RefreshTokenTrait;
    use OAuth2Trait;
    use RulesTrait;

    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Flag(self::FLAG_READONLY)]
    #[ValueGenerator(ReturnURLValueGenerator::class)]
    #[Input\Text(
        label: 'OAuth Callback URL',
        instructions: 'Copy this URL into the Callback URL field in your Jira app. It must match exactly.',
        order: 10,
    )]
    protected string $redirectUri = '';

    #[Flag(self::FLAG_ENCRYPTED)]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Flag(self::FLAG_ENV_SUGGEST)]
    #[Validators\Required]
    #[Input\Text(
        label: 'Client ID',
        instructions: 'Copy the client ID from your Jira app.',
        order: 20,
    )]
    protected string $clientId = '';

    #[Flag(self::FLAG_ENCRYPTED)]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Flag(self::FLAG_ENV_SUGGEST)]
    #[Validators\Required]
    #[Input\Text(
        label: 'Client Secret',
        instructions: 'Copy the client secret from your Jira app. This stays on your server.',
        order: 30,
    )]
    protected string $clientSecret = '';

    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Flag(self::FLAG_ENV_SUGGEST)]
    #[Input\Text(
        label: 'Jira Site URL',
        instructions: 'Enter your Jira site URL. Leave blank to use the first site available to the authorizing account.',
        placeholder: 'https://your-team.atlassian.net',
        order: 40,
    )]
    protected string $instanceUrl = '';

    #[Flag(self::FLAG_INTERNAL)]
    #[Input\Hidden]
    protected string $cloudId = '';

    public function getInstanceUrl(): string
    {
        return $this->getProcessedValue($this->instanceUrl);
    }

    public function setInstanceUrl(string $instanceUrl): self
    {
        $this->instanceUrl = $instanceUrl;

        return $this;
    }

    public function getCloudId(): string
    {
        return $this->cloudId;
    }

    public function setCloudId(string $cloudId): self
    {
        $this->cloudId = $cloudId;

        return $this;
    }

    public function getAccessTokenUrl(): string
    {
        return 'https://auth.atlassian.com/oauth/token';
    }

    public function getAuthorizeUrl(): string
    {
        return 'https://auth.atlassian.com/authorize';
    }

    public function getApiRootUrl(): string
    {
        return 'https://api.atlassian.com/ex/jira/'.$this->cloudId.'/rest/api/3';
    }

    public function checkConnection(Client $client): bool
    {
        [, $json] = $this->getJsonResponse(
            $client->get('https://api.atlassian.com/oauth/token/accessible-resources')
        );

        return \count($json) >= 1;
    }
}

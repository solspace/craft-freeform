<?php

namespace Solspace\Freeform\Library\Integrations\OAuth;

use craft\helpers\App;
use craft\helpers\UrlHelper;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Validators;
use Solspace\Freeform\Attributes\Property\ValueGenerator;
use Solspace\Freeform\Library\Integrations\IntegrationInterface;

trait OAuth2Trait
{
    #[Flag(IntegrationInterface::FLAG_ENCRYPTED)]
    #[Flag(IntegrationInterface::FLAG_INTERNAL)]
    #[Input\Hidden]
    protected string $accessToken = '';

    #[Flag(IntegrationInterface::FLAG_GLOBAL_PROPERTY)]
    #[Flag(IntegrationInterface::FLAG_READONLY)]
    #[ValueGenerator(ReturnURLValueGenerator::class)]
    #[Input\Text(
        label: 'OAuth 2.0 Return URI',
        instructions: 'You must specify this as the Return URI in your app settings to be able to authorize your credentials. DO NOT CHANGE THIS.',
    )]
    protected string $redirectUri = '';

    #[Flag(IntegrationInterface::FLAG_ENCRYPTED)]
    #[Flag(IntegrationInterface::FLAG_GLOBAL_PROPERTY)]
    #[Validators\Required]
    #[Input\Text(
        label: 'Client ID',
        instructions: 'Enter the Client ID of your app here.',
    )]
    protected string $clientId = '';

    #[Flag(IntegrationInterface::FLAG_ENCRYPTED)]
    #[Flag(IntegrationInterface::FLAG_GLOBAL_PROPERTY)]
    #[Validators\Required]
    #[Input\Text(
        instructions: 'Enter the Client Secret of your app here.',
    )]
    protected string $clientSecret = '';

    public function getAccessToken(): string
    {
        return $this->accessToken;
    }

    public function setAccessToken(string $accessToken): self
    {
        $this->accessToken = $accessToken;

        return $this;
    }

    public function getClientId(): string
    {
        return App::parseEnv($this->clientId);
    }

    public function getClientSecret(): string
    {
        return App::parseEnv($this->clientSecret);
    }

    public function getRedirectUri(): string
    {
        if ($this->isLegacy()) {
            return $this->getLegacyRedirectUri();
        }

        return $this->redirectUri;
    }

    /**
     * This is a legacy method that returns the old redirect URI.
     * It is used for compatibility with previous flow that expected a CP Firewalled Url.
     *
     * @deprecated will be removed in Freeform 6.0
     */
    private function getLegacyRedirectUri(): string
    {
        return UrlHelper::cpUrl('freeform/oauth/authorize');
    }
}

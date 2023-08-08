<?php

namespace Solspace\Freeform\Library\Integrations\OAuth;

use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Validators\Required;
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
    #[Required]
    #[Input\Text(
        label: 'Client ID',
        instructions: 'Enter the Client ID of your app here.',
    )]
    protected string $clientId = '';

    #[Flag(IntegrationInterface::FLAG_ENCRYPTED)]
    #[Flag(IntegrationInterface::FLAG_GLOBAL_PROPERTY)]
    #[Required]
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
        return $this->clientId;
    }

    public function getClientSecret(): string
    {
        return $this->clientSecret;
    }

    public function getRedirectUri(): string
    {
        return $this->redirectUri;
    }
}

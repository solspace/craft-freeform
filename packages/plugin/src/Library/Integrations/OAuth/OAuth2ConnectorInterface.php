<?php

namespace Solspace\Freeform\Library\Integrations\OAuth;

use Solspace\Freeform\Library\Integrations\IntegrationInterface;

interface OAuth2ConnectorInterface extends IntegrationInterface
{
    public const EVENT_INITIATE_AUTHENTICATION_FLOW = 'initiate-authentication-flow';
    public const EVENT_BEFORE_AUTHORIZE = 'before-authorize';
    public const EVENT_AFTER_AUTHORIZE = 'after-authorize';

    public function getAccessToken(): string;

    public function setAccessToken(string $accessToken): self;

    /**
     * URL pointing to the OAuth2 authorization endpoint.
     */
    public function getAuthorizeUrl(): string;

    public function getClientId(): string;

    public function getClientSecret(): string;

    public function getRedirectUri(): string;

    /**
     * URL pointing to the OAuth2 access token endpoint.
     */
    public function getAccessTokenUrl(): string;
}

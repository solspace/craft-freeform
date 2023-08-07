<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2022, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Library\Integrations\Types\CRM;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use JetBrains\PhpStorm\NoReturn;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Validators;
use Solspace\Freeform\Attributes\Property\ValueGenerator;
use Solspace\Freeform\Events\Integrations\TokensRefreshedEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\OAuth\RefreshTokenInterface;
use Solspace\Freeform\Library\Integrations\OAuth\ReturnURLValueGenerator;
use yii\base\Event;

abstract class CRMOAuthConnector extends CRMIntegration
{
    public const FLASH_INTEGRATION_ID_KEY = 'oauth-integration-id';
    public const EVENT_TOKENS_REFRESHED = 'tokens-refreshed';

    #[Flag(self::FLAG_ENCRYPTED)]
    #[Flag(self::FLAG_INTERNAL)]
    #[Input\Text]
    protected string $accessToken = '';

    #[Flag(self::FLAG_ENCRYPTED)]
    #[Flag(self::FLAG_INTERNAL)]
    #[Input\Text]
    protected string $refreshToken = '';

    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Flag(self::FLAG_READONLY)]
    #[ValueGenerator(ReturnURLValueGenerator::class)]
    #[Input\Text(
        label: 'OAuth 2.0 Return URI',
        instructions: 'You must specify this as the Return URI in your app settings to be able to authorize your credentials. DO NOT CHANGE THIS.',
    )]
    protected string $returnUri = '';

    #[Flag(self::FLAG_ENCRYPTED)]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Validators\Required]
    #[Input\Text(
        label: 'Client ID',
        instructions: 'Enter the Client ID of your app here.',
    )]
    protected string $clientId = '';

    #[Flag(self::FLAG_ENCRYPTED)]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Validators\Required]
    #[Input\Text(
        instructions: 'Enter the Client Secret of your app here.',
    )]
    protected string $clientSecret = '';

    private static array $refreshedTokens = [];

    #[NoReturn]
    public function initiateAuthentication(): void
    {
        $payload = [
            'response_type' => 'code',
            'client_id' => $this->getClientId(),
            'redirect_uri' => $this->getReturnUri(),
            'state' => $this->getId(),
        ];

        $this->onAuthentication($payload);

        $queryString = http_build_query($payload);

        header('Location: '.$this->getAuthorizeUrl().'?'.$queryString);

        exit;
    }

    public function generateAuthorizedClient(): Client
    {
        if ($this instanceof RefreshTokenInterface) {
            $this->refreshTokens();
        }

        return new Client([
            'headers' => [
                'Authorization' => 'Bearer '.$this->getAccessToken(),
                'Content-Type' => 'application/json',
            ],
        ]);
    }

    public function fetchTokens(string $code): string
    {
        $client = new Client();

        $payload = [
            'grant_type' => 'authorization_code',
            'client_id' => $this->getClientId(),
            'client_secret' => $this->getClientSecret(),
            'redirect_uri' => $this->getReturnUri(),
            'code' => $code,
        ];

        $this->onBeforeFetchAccessToken($payload);

        try {
            $response = $client->post(
                $this->getAccessTokenUrl(),
                ['form_params' => $payload]
            );
        } catch (RequestException $e) {
            throw new IntegrationException((string) $e->getResponse()->getBody());
        }

        $json = json_decode((string) $response->getBody());

        if (!isset($json->access_token)) {
            throw new IntegrationException(
                Freeform::t(
                    "No 'access_token' present in auth response for {serviceProvider}",
                    ['serviceProvider' => $this->getServiceProvider()]
                )
            );
        }

        $this->accessToken = $json->access_token;

        if ($this instanceof RefreshTokenInterface) {
            if (!isset($json->refresh_token)) {
                throw new IntegrationException(
                    Freeform::t(
                        "No 'refresh_token' present in auth response for {serviceProvider}. Enable offline-access for your app.",
                        ['serviceProvider' => $this->getServiceProvider()]
                    )
                );
            }

            $this->refreshToken = $json->refresh_token;
        }

        $this->onAfterFetchAccessToken($json);

        return $this->getAccessToken();
    }

    protected function getAccessToken(): string
    {
        return $this->accessToken;
    }

    protected function getRefreshToken(): string
    {
        return $this->refreshToken;
    }

    protected function onAuthentication(array &$payload): void
    {
    }

    protected function onBeforeFetchAccessToken(array &$payload): void
    {
    }

    protected function onAfterFetchAccessToken(\stdClass $responseData): void
    {
    }

    protected function getClientId(): string
    {
        return $this->getProcessedValue($this->clientId);
    }

    protected function getClientSecret(): string
    {
        return $this->getProcessedValue($this->clientSecret);
    }

    protected function getReturnUri(): string
    {
        return $this->returnUri;
    }

    /**
     * URL pointing to the OAuth2 authorization endpoint.
     */
    abstract protected function getAuthorizeUrl(): string;

    /**
     * URL pointing to the OAuth2 access token endpoint.
     */
    abstract protected function getAccessTokenUrl(): string;

    protected function refreshTokens(): void
    {
        if (\in_array($this->getId(), self::$refreshedTokens, true)) {
            return;
        }

        $clientId = $this->getClientId();
        $clientSecret = $this->getClientSecret();
        $refreshToken = $this->getRefreshToken();

        if (!$clientId || !$clientSecret || !$refreshToken) {
            throw new IntegrationException('Some or all of the configuration values are missing');
        }

        $client = new Client();

        $payload = [
            'refresh_token' => $refreshToken,
            'client_id' => $clientId,
            'client_secret' => $clientSecret,
            'grant_type' => 'refresh_token',
        ];

        try {
            $response = $client->post($this->getAccessTokenUrl(), ['form_params' => $payload]);

            $json = json_decode($response->getBody(), false);

            if (!isset($json->access_token)) {
                throw new IntegrationException(
                    Freeform::t(
                        "No 'access_token' present in auth response for {serviceProvider}",
                        ['serviceProvider' => $this->getServiceProvider()]
                    )
                );
            }

            $this->accessToken = $json->access_token;

            if (isset($json->refresh_token)) {
                $this->refreshToken = $json->refresh_token;
            }

            self::$refreshedTokens[] = $this->getId();

            $this->onAfterFetchAccessToken($json);
        } catch (RequestException $e) {
            $responseBody = (string) $e->getResponse()->getBody();
            Freeform::$logger
                ->getLogger('Integrations')
                ->error($responseBody, ['exception' => $e->getMessage()]);

            throw $e;
        }

        Event::trigger(
            self::class,
            self::EVENT_TOKENS_REFRESHED,
            new TokensRefreshedEvent($this)
        );
    }
}

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

namespace Solspace\Freeform\Library\Integrations\CRM;

use craft\helpers\UrlHelper;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use JetBrains\PhpStorm\NoReturn;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Property;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;

abstract class CRMOAuthConnector extends AbstractCRMIntegration
{
    public const SETTING_CLIENT_ID = 'client_id';
    public const SETTING_CLIENT_SECRET = 'client_secret';
    public const SETTING_RETURN_URI = 'return_uri';

    #[Flag(self::FLAG_ENCRYPTED)]
    #[Flag(self::FLAG_INTERNAL)]
    #[Property]
    protected string $accessToken = '';

    #[Flag(self::FLAG_ENCRYPTED)]
    #[Flag(self::FLAG_INTERNAL)]
    #[Property]
    protected string $refreshToken = '';

    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Flag(self::FLAG_READONLY)]
    #[Property(
        label: 'OAuth 2.0 Return URI',
        instructions: 'You must specify this as the Return URI in your app settings to be able to authorize your credentials. DO NOT CHANGE THIS.',
    )]
    protected string $returnUri = '';

    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Property(
        instructions: 'Enter the Client ID of your app here.',
        required: true,
    )]
    protected string $clientId;

    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Property(
        instructions: 'Enter the Client Secret of your app here.',
        required: true,
    )]
    protected string $clientSecret;

    #[NoReturn]
    public function initiateAuthentication()
    {
        $data = [
            'response_type' => 'code',
            'client_id' => $this->getClientId(),
            'redirect_uri' => $this->getReturnUri(),
        ];

        $queryString = http_build_query($data);

        header('Location: '.$this->getAuthorizeUrl().'?'.$queryString);

        exit;
    }

    public function fetchTokens(): string
    {
        $client = new Client();

        $code = $_GET['code'] ?? null;

        if (null === $code) {
            return '';
        }

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
                $this->getTranslator()->translate(
                    "No 'access_token' present in auth response for {serviceProvider}",
                    ['serviceProvider' => $this->getServiceProvider()]
                )
            );
        }

        $this->accessToken = $json->access_token;

        if ($this instanceof RefreshTokenInterface) {
            if (!isset($json->refresh_token)) {
                throw new IntegrationException(
                    $this->getTranslator()->translate(
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

    protected function onBeforeFetchAccessToken(array &$payload)
    {
    }

    protected function onAfterFetchAccessToken(\stdClass $responseData)
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
        return UrlHelper::cpUrl('freeform/settings/crm/'.$this->getHandle());
    }

    /**
     * URL pointing to the OAuth2 authorization endpoint.
     */
    abstract protected function getAuthorizeUrl(): string;

    /**
     * URL pointing to the OAuth2 access token endpoint.
     */
    abstract protected function getAccessTokenUrl(): string;
}

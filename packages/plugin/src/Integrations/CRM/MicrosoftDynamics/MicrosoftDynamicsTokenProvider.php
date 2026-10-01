<?php

namespace Solspace\Freeform\Integrations\CRM\MicrosoftDynamics;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;

class MicrosoftDynamicsTokenProvider
{
    private array $tokens = [];

    public function getAccessToken(MicrosoftDynamics $integration, Client $client): string
    {
        $environment = $integration->getEnvironmentUrl();
        $tenant = $integration->getTenantId();
        $clientId = $integration->getClientId();
        $secret = $integration->getClientSecret();
        $key = hash('sha256', json_encode([$environment, $tenant, $clientId, $secret]));
        $now = time();
        if (isset($this->tokens[$key]) && $this->tokens[$key]['expires'] > $now + 60) {
            return $this->tokens[$key]['token'];
        }

        try {
            $response = $client->post('https://login.microsoftonline.com/'.$tenant.'/oauth2/v2.0/token', [
                'form_params' => [
                    'grant_type' => 'client_credentials',
                    'client_id' => $clientId,
                    'client_secret' => $secret,
                    'scope' => $environment.'/.default',
                ],
                'allow_redirects' => false,
                'http_errors' => false,
                'timeout' => 30,
                'connect_timeout' => 10,
            ]);
        } catch (GuzzleException) {
            // Do not attach the original exception: its request contains the client secret.
            throw new IntegrationException('Could not connect to Microsoft Entra to authenticate Dynamics. Check network access and try again.');
        }

        $data = json_decode((string) $response->getBody(), true);
        if (200 !== $response->getStatusCode()
            || !\is_string($data['access_token'] ?? null)
            || '' === $data['access_token']
            || false !== strpbrk($data['access_token'], "\r\n")
            || !\is_string($data['token_type'] ?? null)
            || 'bearer' !== strtolower($data['token_type'])
            || !is_numeric($data['expires_in'] ?? null)
            || (int) $data['expires_in'] <= 0
        ) {
            $code = $data['error_codes'][0] ?? null;
            $code = \is_int($code) ? ' (AADSTS'.$code.')' : '';

            throw new IntegrationException('Microsoft Dynamics authentication failed'.$code.'. Check the tenant ID, client ID, client secret value and expiry, and Dataverse application user setup.');
        }

        // Reuse only within this PHP process. No tokens or secrets are written to a shared cache.
        $this->tokens[$key] = ['token' => $data['access_token'], 'expires' => $now + (int) $data['expires_in']];

        return $data['access_token'];
    }
}

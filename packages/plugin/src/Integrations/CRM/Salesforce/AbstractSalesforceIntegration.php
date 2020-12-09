<?php

namespace Solspace\Freeform\Integrations\CRM\Salesforce;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Solspace\Freeform\Library\Integrations\CRM\AbstractCRMIntegration;

abstract class AbstractSalesforceIntegration extends AbstractCRMIntegration
{
    abstract protected function getAuthorizationCheckUrl(): string;

    protected function generateAuthorizedClient(bool $refreshTokenIfExpired = true): Client
    {
        $client = new Client([
            'headers' => [
                'Authorization' => 'Bearer '.$this->getAccessToken(),
                'Content-Type' => 'application/json',
            ],
        ]);

        if ($refreshTokenIfExpired) {
            try {
                $endpoint = $this->getAuthorizationCheckUrl();
                $client->get($endpoint);
            } catch (RequestException $e) {
                if (401 === $e->getCode()) {
                    $client = new Client([
                        'headers' => [
                            'Authorization' => 'Bearer '.$this->fetchAccessToken(),
                            'Content-Type' => 'application/json',
                        ],
                    ]);
                }
            }
        }

        return $client;
    }

    /**
     * @return mixed
     */
    protected function query(string $query, array $params = []): array
    {
        $client = $this->generateAuthorizedClient();

        $params = array_map([$this, 'soqlEscape'], $params);
        $query = sprintf($query, ...$params);

        try {
            $response = $client->get(
                $this->getEndpoint('/query'),
                [
                    'query' => [
                        'q' => $query,
                    ],
                ]
            );

            $result = \GuzzleHttp\json_decode($response->getBody());

            if (0 === $result->totalSize || !$result->done) {
                return [];
            }

            return $result->records;
        } catch (RequestException $e) {
            $this->getLogger()->error($e->getMessage(), ['response' => $e->getResponse()]);

            return [];
        }
    }

    /**
     * @return null|mixed
     */
    protected function querySingle(string $query, array $params = [])
    {
        $data = $this->query($query, $params);

        if (\count($data) >= 1) {
            return reset($data);
        }

        return null;
    }

    protected function soqlEscape(string $str = ''): string
    {
        $characters = [
            '\\',
            '\'',
        ];
        $replacement = [
            '\\\\',
            '\\\'',
        ];

        return str_replace($characters, $replacement, $str);
    }
}

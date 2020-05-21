<?php

namespace Solspace\Freeform\Integrations\CRM\Salesforce;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Solspace\Freeform\Library\Integrations\CRM\AbstractCRMIntegration;

abstract class AbstractSalesforceIntegration extends AbstractCRMIntegration
{
    /**
     * @return string
     */
    protected abstract function getAuthorizationCheckUrl(): string;

    /**
     * @param bool $refreshTokenIfExpired
     *
     * @return Client
     */
    protected function generateAuthorizedClient(bool $refreshTokenIfExpired = true): Client
    {
        $client = new Client([
            'headers' => [
                'Authorization' => 'Bearer ' . $this->getAccessToken(),
                'Content-Type'  => 'application/json',
            ],
        ]);

        if ($refreshTokenIfExpired) {
            try {
                $endpoint = $this->getAuthorizationCheckUrl();
                $client->get($endpoint);
            } catch (RequestException $e) {
                if ($e->getCode() === 401) {
                    $client = new Client([
                        'headers' => [
                            'Authorization' => 'Bearer ' . $this->fetchAccessToken(),
                            'Content-Type'  => 'application/json',
                        ],
                    ]);
                }
            }
        }

        return $client;
    }

    /**
     * @param string $query
     * @param array  $params
     *
     * @return mixed
     */
    protected function query(string $query, array $params = []): array
    {
        $client = $this->generateAuthorizedClient();

        $params = array_map([$this, 'soqlEscape'], $params);
        $query  = sprintf($query, ...$params);

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

            if ($result->totalSize === 0 || !$result->done) {
                return [];
            }

            return $result->records;
        } catch (RequestException $e) {
            $this->getLogger()->error($e->getMessage(), ['response' => $e->getResponse()]);

            return [];
        }
    }

    /**
     * @param string $query
     * @param array  $params
     *
     * @return mixed|null
     */
    protected function querySingle(string $query, array $params = [])
    {
        $data = $this->query($query, $params);

        if (\count($data) >= 1) {
            return reset($data);
        }

        return null;
    }

    /**
     * @param string $str
     *
     * @return string
     */
    protected function soqlEscape(string $str = ''): string
    {
        $characters  = [
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

<?php

namespace Solspace\Freeform\Integrations\CRM\Salesforce;

use GuzzleHttp\Exception\RequestException;
use Psr\Log\LoggerInterface;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Exceptions\Integrations\CRMIntegrationNotFoundException;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\OAuth\RefreshTokenInterface;
use Solspace\Freeform\Library\Integrations\Types\CRM\CRMOAuthConnector;

abstract class BaseSalesforceIntegration extends CRMOAuthConnector implements RefreshTokenInterface
{
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Input\Text(
        instructions: 'Enable this if your Salesforce account is in Sandbox mode (connects to "test.salesforce.com" instead of "login.salesforce.com").',
    )]
    protected bool $sandboxMode = false;

    #[Flag(self::FLAG_INTERNAL)]
    #[Input\Text]
    protected string $instanceUrl = '';

    /**
     * Check if it's possible to connect to the API.
     */
    public function checkConnection(): bool
    {
        $client = $this->generateAuthorizedClient();
        $endpoint = $this->getEndpoint('/');

        $response = $client->get($endpoint);

        $json = json_decode((string) $response->getBody(), true);

        return !empty($json);
    }

    public function fetchFields(string $category): array
    {
        $client = $this->generateAuthorizedClient();

        try {
            $response = $client->get($this->getEndpoint("/sobjects/{$category}/describe"));
        } catch (RequestException $e) {
            Freeform::$logger
                ->getLogger('Salesforce')
                ->error(
                    $e->getMessage(),
                    ['response' => $e->getResponse()]
                );

            return [];
        }

        $data = json_decode((string) $response->getBody());

        $fieldList = [];
        foreach ($data->fields as $field) {
            if (!$field->updateable) {
                continue;
            }

            $type = null;

            switch ($field->type) {
                case 'string':
                case 'textarea':
                case 'email':
                case 'url':
                case 'address':
                case 'picklist':
                case 'phone':
                case 'reference':
                    $type = FieldObject::TYPE_STRING;

                    break;

                case 'boolean':
                    $type = FieldObject::TYPE_BOOLEAN;

                    break;

                case 'multipicklist':
                    $type = FieldObject::TYPE_ARRAY;

                    break;

                case 'int':
                case 'number':
                case 'currency':
                    $type = FieldObject::TYPE_NUMERIC;

                    break;

                case 'double':
                    $type = FieldObject::TYPE_FLOAT;

                    break;

                case 'date':
                    $type = FieldObject::TYPE_DATE;

                    break;

                case 'datetime':
                    $type = FieldObject::TYPE_DATETIME;

                    break;
            }

            if (null === $type) {
                continue;
            }

            $fieldList[] = new FieldObject(
                $field->name,
                $field->label,
                $type,
                $category,
                !$field->nillable
            );
        }

        return $fieldList;
    }

    protected function getInstanceUrl(): string
    {
        return $this->instanceUrl;
    }

    abstract protected function getAuthorizationCheckUrl(): string;

    protected function onAfterFetchAccessToken(\stdClass $responseData): void
    {
        if (!isset($responseData->instance_url)) {
            throw new CRMIntegrationNotFoundException("Salesforce response data doesn't contain the instance URL");
        }

        $this->instanceUrl = $responseData->instance_url;
    }

    protected function getSubdomain(): string
    {
        return $this->sandboxMode ? 'test' : 'login';
    }

    protected function getAuthorizeUrl(): string
    {
        return 'https://'.$this->getSubdomain().'.salesforce.com/services/oauth2/authorize';
    }

    protected function getAccessTokenUrl(): string
    {
        return 'https://'.$this->getSubdomain().'.salesforce.com/services/oauth2/token';
    }

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

            $result = json_decode($response->getBody());

            if (0 === $result->totalSize || !$result->done) {
                return [];
            }

            return $result->records;
        } catch (RequestException $e) {
            $this->getLogger()->error($e->getMessage(), ['response' => $e->getResponse()]);

            return [];
        }
    }

    protected function querySingle(string $query, array $params = []): mixed
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

    protected function getLogger(?string $category = null): LoggerInterface
    {
        return parent::getLogger('Salesforce');
    }
}

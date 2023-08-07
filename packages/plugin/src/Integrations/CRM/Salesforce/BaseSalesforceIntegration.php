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

namespace Solspace\Freeform\Integrations\CRM\Salesforce;

use GuzzleHttp\Exception\RequestException;
use Psr\Log\LoggerInterface;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Library\Exceptions\Integrations\CRMIntegrationNotFoundException;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\OAuth\RefreshTokenInterface;
use Solspace\Freeform\Library\Integrations\Types\CRM\CRMOAuthConnector;

abstract class BaseSalesforceIntegration extends CRMOAuthConnector implements RefreshTokenInterface
{
    protected const LOG_CATEGORY = 'Salesforce';

    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Input\Boolean(
        label: 'Use custom URL?',
        instructions: 'Enable this if you connect to your Salesforce account with a custom company URL (e.g. "mycompany.my.salesforce.com").',
        order: 1,
    )]
    protected bool $useCustomUrl = false;

    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Input\Text(
        label: 'Custom URL',
        instructions: 'E.g https://mycompany.develop.my.salesforce.com',
        order: 2,
    )]
    protected ?string $customUrl = null;

    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Input\Text(
        instructions: 'Enable this if your Salesforce account is in Sandbox mode (connects to "test.salesforce.com" instead of "login.salesforce.com" or "mycompany.my.salesforce.com").',
        order: 3,
    )]
    protected bool $sandboxMode = false;

    #[Flag(self::FLAG_INTERNAL)]
    #[Input\Hidden]
    protected string $instanceUrl = '';

    public function checkConnection(): bool
    {
        try {
            $client = $this->generateAuthorizedClient();

            $response = $client->get($this->getEndpoint('/'));

            $json = json_decode((string) $response->getBody(), false);

            return !empty($json);
        } catch (RequestException $exception) {
            throw new IntegrationException($exception->getMessage(), $exception->getCode(), $exception->getPrevious());
        }
    }

    public function fetchFields(string $category): array
    {
        try {
            $client = $this->generateAuthorizedClient();

            $response = $client->get($this->getEndpoint('/sobjects/'.$category.'/describe'));
        } catch (\Exception $exception) {
            $this->processException($exception);
        }

        $json = json_decode((string) $response->getBody());

        if (!isset($json->fields) || !$json->fields) {
            throw new IntegrationException('Could not fetch fields for '.$category);
        }

        $fieldList = [];

        foreach ($json->fields as $field) {
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

    protected function isCustomUrl(): bool
    {
        return $this->useCustomUrl;
    }

    protected function getCustomUrl(): ?string
    {
        return $this->customUrl;
    }

    protected function getInstanceUrl(): string
    {
        return $this->instanceUrl;
    }

    protected function isSandboxMode(): bool
    {
        return $this->sandboxMode;
    }

    protected function onAuthentication(array &$payload): void
    {
        $payload['scope'] = 'refresh_token api';
    }

    protected function onAfterFetchAccessToken(\stdClass $responseData): void
    {
        if (!isset($responseData->instance_url)) {
            throw new CRMIntegrationNotFoundException("Salesforce response data doesn't contain the instance URL");
        }

        $this->instanceUrl = $responseData->instance_url;
    }

    protected function getDomain(): string
    {
        $domain = 'https://login.salesforce.com';

        if ($this->isSandboxMode()) {
            $domain = 'https://test.salesforce.com';
        }

        if ($this->isCustomUrl()) {
            $domain = $this->getCustomUrl();
        }

        return $domain;
    }

    protected function getAuthorizeUrl(): string
    {
        return $this->getDomain().'/services/oauth2/authorize';
    }

    protected function getAccessTokenUrl(): string
    {
        return $this->getDomain().'/services/oauth2/token';
    }

    protected function query(string $query, array $params = []): array
    {
        try {
            $params = array_map([$this, 'soqlEscape'], $params);

            $query = sprintf($query, ...$params);

            $client = $this->generateAuthorizedClient();

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
        } catch (\Exception $exception) {
            $this->processException($exception);
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
        return parent::getLogger($category ?? self::LOG_CATEGORY);
    }

    protected function processException($exception): void
    {
        $message = $exception->getMessage();
        $response = $exception->getResponse();

        if ($exception instanceof RequestException && $response) {
            $json = json_decode((string) $response->getBody(), false);

            if ($json->error && $json->error_info) {
                $usefulErrorMessage = $json->error.', '.$json->error_info;
            } else {
                $usefulErrorMessage = (string) $response->getBody();
            }

            $this->getLogger()->error(
                $usefulErrorMessage,
                [
                    'exception' => $message,
                ],
            );
        } else {
            $this->getLogger()->error(
                $message,
                [
                    'exception' => $message,
                ],
            );
        }

        throw $exception;
    }
}

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

namespace Solspace\Freeform\Integrations\CRM\Pipedrive;

use GuzzleHttp\Exception\RequestException;
use Psr\Log\LoggerInterface;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Library\Exceptions\Integrations\CRMIntegrationNotFoundException;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\OAuth\RefreshTokenInterface;
use Solspace\Freeform\Library\Integrations\Types\CRM\CRMOAuthConnector;

abstract class BasePipedriveIntegration extends CRMOAuthConnector implements RefreshTokenInterface
{
    protected const LOG_CATEGORY = 'Pipedrive';

    #[Flag(self::FLAG_INTERNAL)]
    #[Input\Hidden]
    protected string $apiDomain = '';

    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Input\Text(
        label: 'User ID',
        instructions: 'Enter the Pipedrive User ID you want to assign to new objects.',
        order: 1,
    )]
    protected ?int $userId = null;

    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Input\Boolean(
        instructions: 'Enable this setting to prevent creation of organizations or persons with overlapping names and/or email addresses.',
        order: 2,
    )]
    protected bool $detectDuplicates = false;

    public function checkConnection(): bool
    {
        try {
            $client = $this->generateAuthorizedClient();

            $response = $client->get($this->getEndpoint('/users/me'));

            $json = json_decode((string) $response->getBody(), false);

            return isset($json->success) && true === $json->success;
        } catch (\Exception $exception) {
            throw new IntegrationException($exception->getMessage(), $exception->getCode(), $exception->getPrevious());
        }
    }

    public function fetchFields(string $category): array
    {
        try {
            $client = $this->generateAuthorizedClient();

            $response = $client->get($this->getEndpoint('/'.strtolower($category).'Fields'));
        } catch (\Exception $exception) {
            $this->processException($exception);
        }

        $json = json_decode((string) $response->getBody());

        if (!isset($json->success) || !$json->success) {
            throw new IntegrationException('Could not fetch fields for '.$category);
        }

        $requiredFields = ['name', 'title'];

        $allowedFields = [
            'name',
            'phone',
            'email',
            'title',
            'value',
            'currency',
            'stage_id',
            'status',
            'probability',
            'note',
        ];

        $fieldList = [];

        foreach ($json->data as $field) {
            if (!\in_array($field->key, $allowedFields, true)) {
                continue;
            }

            $type = null;

            switch ($field->field_type) {
                case 'varchar':
                case 'varchar_auto':
                case 'text':
                case 'date': // Why not FieldObject::TYPE_DATE ??
                case 'enum':
                case 'time':
                case 'timerange':
                case 'daterange':
                    $type = FieldObject::TYPE_STRING;

                    break;

                case 'set':
                case 'phone':
                    $type = FieldObject::TYPE_ARRAY;

                    break;

                case 'int':
                case 'double': // Why not FieldObject::TYPE_FLOAT ??
                case 'monetary':
                case 'user':
                case 'org':
                case 'people':
                    $type = FieldObject::TYPE_NUMERIC;

                    break;
            }

            if (null === $type) {
                continue;
            }

            $required = (bool) $field->mandatory_flag;
            if (\in_array($field->key, $requiredFields, true)) {
                $required = true;
            }

            $fieldList[] = new FieldObject(
                $field->key,
                $field->name,
                $type,
                $category,
                $required,
            );
        }

        if ('Organization' === $category) {
            $fieldList[] = new FieldObject(
                'address',
                'Address',
                FieldObject::TYPE_STRING,
                $category,
                false,
            );
        }

        if ('Deal' === $category || 'Lead' === $category) {
            $fieldList[] = new FieldObject(
                'note',
                'Note',
                FieldObject::TYPE_STRING,
                $category,
                false,
            );
        }

        return $fieldList;
    }

    protected function getApiDomain(): string
    {
        return $this->apiDomain;
    }

    protected function getUserId(): ?int
    {
        return $this->getProcessedValue($this->userId);
    }

    protected function isDetectDuplicates(): bool
    {
        return $this->detectDuplicates;
    }

    protected function onAuthentication(array &$payload): void
    {
        $payload['scope'] = 'base search:read contacts:full deals:full leads:full';
    }

    protected function onAfterFetchAccessToken(\stdClass $responseData): void
    {
        if (!isset($responseData->api_domain)) {
            throw new CRMIntegrationNotFoundException("Pipedrive response data doesn't contain the API Domain");
        }

        $this->apiDomain = $responseData->api_domain;
    }

    protected function getAuthorizeUrl(): string
    {
        return 'https://oauth.pipedrive.com/oauth/authorize';
    }

    protected function getAccessTokenUrl(): string
    {
        return 'https://oauth.pipedrive.com/oauth/token';
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

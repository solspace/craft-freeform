<?php

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
    public const PREFIX_ORGANIZATION = 'org';
    public const PREFIX_PERSON = 'prsn';
    public const PREFIX_DEALS = 'deals';

    #[Flag(self::FLAG_INTERNAL)]
    #[Input\Hidden]
    protected string $apiDomain = '';

    #[Input\Text(
        label: 'User ID',
        instructions: 'Enter the Pipedrive User ID you want to assign to new objects.'
    )]
    protected string $userId = '';

    #[Input\Boolean(
        instructions: 'Enable this setting to prevent creation of organizations or persons with overlapping names and/or email addresses.',
    )]
    protected bool $detectDuplicates = false;

    public function getUserId(): ?int
    {
        return $this->userId ? (int) $this->userId : null;
    }

    public function checkConnection(): bool
    {
        try {
            $client = $this->generateAuthorizedClient();
            $response = $client->get($this->getEndpoint('/users/me'));
            $json = json_decode((string) $response->getBody(), false);

            return isset($json->success) && true === $json->success;
        } catch (RequestException $exception) {
            throw new IntegrationException($exception->getMessage(), $exception->getCode(), $exception->getPrevious());
        }
    }

    /**
     * Fetch the custom fields from the integration.
     *
     * @return FieldObject[]
     */
    public function fetchFields(string $category): array
    {
        // TODO: reimplement
        return [];
        /*
        $isLead = $this instanceof PipedriveLeads;

        $endpoints = [
            ['category' => 'prsn', 'label' => 'Person', 'endpoint' => 'personFields'],
            ['category' => 'org', 'label' => 'Organization', 'endpoint' => 'organizationFields'],
            [
                'category' => $isLead ? 'lead' : 'deal',
                'label' => $isLead ? 'Lead' : 'Deal',
                'endpoint' => 'dealFields',
            ],
        ];

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
        foreach ($endpoints as $data) {
            $category = $data['category'];
            $label = $data['label'];
            $endpoint = $data['endpoint'];

            $response = $this->getResponse(
                $this->getEndpoint('/'.$endpoint),
                ['query' => ['limit' => 999]]
            );

            $json = json_decode($response->getBody(), false);

            if (!isset($json->success) || !$json->success) {
                throw new IntegrationException("Could not fetch fields for {$category}");
            }

            foreach ($json->data as $fieldInfo) {
                $validKey = preg_match('/[a-z0-9]{40}/i', $fieldInfo->key);
                $allowedField = \in_array($fieldInfo->key, $allowedFields, true);
                $type = $this->getFieldType($fieldInfo->field_type);

                if (null !== $type && ($validKey || $allowedField)) {
                    $fieldList[] = new FieldObject(
                        "{$category}___{$fieldInfo->key}",
                        "{$fieldInfo->name} ({$label})",
                        $type,
                        \in_array($fieldInfo->key, $requiredFields, true)
                    );
                }
            }

            if ('org' === $category) {
                $fieldList[] = new FieldObject(
                    "{$category}___address",
                    "Address ({$label})",
                    FieldObject::TYPE_STRING,
                    false
                );
            }

            if ($isLead && 'lead' === $category) {
                $fieldList[] = new FieldObject(
                    "{$category}___note",
                    "Note ({$label})",
                    FieldObject::TYPE_STRING,
                    false
                );

                continue;
            }

            $fieldList[] = new FieldObject(
                "note___{$category}",
                "{$label} (Note)",
                FieldObject::TYPE_STRING,
                false
            );
        }

        return $fieldList;
        */
    }

    public function getApiRootUrl(): string
    {
        return $this->apiDomain.'/api/v1/';
    }

    protected function onAuthentication(array &$payload): void
    {
        $payload['scope'] = 'base deals:full leads:full';
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

    protected function pushOrg(array $fieldList)
    {
        // TODO: reimplement
        return false;
        /*
        $fields = $this->getFieldsByCategory(self::PREFIX_ORGANIZATION, $fieldList);

        $organizationId = null;
        if ($fields) {
            $client = $this->generateAuthorizedClient();

            try {
                if ($this->getUserId()) {
                    $fields['owner_id'] = $this->getUserId();
                }

                $orgId = $this->searchForDuplicate(['name' => $fields['name'] ?? null], 'organization');
                if ($orgId) {
                    return $orgId;
                }

                $response = $client->post(
                    $this->getEndpoint('/organizations'),
                    ['json' => $fields]
                );

                $json = json_decode((string) $response->getBody());
                if (isset($json->data->id)) {
                    $organizationId = (int) $json->data->id;
                }

                $this->getHandler()->onAfterResponse($this, $response);
            } catch (RequestException $e) {
                $responseBody = (string) $e->getResponse()->getBody();

                $this->getLogger()->error($responseBody, ['exception' => $e->getMessage()]);
            } catch (\Exception $e) {
                $this->getLogger()->error($e->getMessage());
            }
        }

        return $organizationId;
        */
    }

    protected function pushPerson(array $fieldList, $organizationId = null)
    {
        // TODO: reimplement
        return false;
        /*
        $fields = $this->getFieldsByCategory(self::PREFIX_PERSON, $fieldList);

        $personId = null;
        if ($fields) {
            $client = $this->generateAuthorizedClient();
            $personId = $this->searchForDuplicate(['email' => $fields['email'] ?? null], 'person');

            try {
                if ($this->getUserId()) {
                    $fields['owner_id'] = $this->getUserId();
                }

                if ($organizationId) {
                    $fields['org_id'] = $organizationId;
                }

                if ($personId) {
                    unset($fields['email']);

                    $response = $client->put(
                        $this->getEndpoint("/persons/{$personId}"),
                        ['json' => $fields]
                    );
                } else {
                    $response = $client->post(
                        $this->getEndpoint('/persons'),
                        ['json' => $fields]
                    );
                }

                $json = json_decode((string) $response->getBody());
                if (isset($json->data->id)) {
                    $personId = (int) $json->data->id;
                }

                $this->getHandler()->onAfterResponse($this, $response);
            } catch (RequestException $e) {
                $responseBody = (string) $e->getResponse()->getBody();

                $this->getLogger()->error($responseBody, ['exception' => $e->getMessage()]);
            } catch (\Exception $e) {
                $this->getLogger()->error($e->getMessage());
            }
        }

        return $personId;
        */
    }

    protected function addOrgNote($id = null, $content = null)
    {
        // TODO: reimplement
        return false;
        /*
        if (!$id || empty($content)) {
            return;
        }

        $client = $this->generateAuthorizedClient();
        $client->post(
            $this->getEndpoint('/notes'),
            [
                'json' => [
                    'content' => $content,
                    'org_id' => $id,
                    'pinned_to_organization_flag' => '1',
                ],
            ]
        );
        */
    }

    protected function addNote($idPrefix, $id, $content)
    {
        // TODO: reimplement
        return false;
        /*
        if (!$id || empty($content)) {
            return;
        }

        $pinTarget = 'org' === $idPrefix ? 'organization' : $idPrefix;

        $client = $this->generateAuthorizedClient();
        $client->post(
            $this->getEndpoint('/notes'),
            [
                'json' => [
                    'content' => $content,
                    $idPrefix.'_id' => $id,
                    'pinned_to_'.$pinTarget.'_flag' => '1',
                ],
            ]
        );
        */
    }

    protected function getFieldsByCategory(string $prefix, array $fieldList): array
    {
        // TODO: reimplement
        return [];
        /*
        $matchedFields = [];
        foreach ($fieldList as $key => $value) {
            if (preg_match('/^'.$prefix.'___(.*)$/', $key, $matches)) {
                $matchedFields[$matches[1]] = $value;
            }
        }

        return $matchedFields;
        */
    }

    protected function getFieldType(string $type): ?string
    {
        // TODO: reimplement
        return false;
        /*
        return match ($type) {
            'varchar', 'varchar_auto', 'text', 'date', 'enum', 'time', 'timerange', 'daterange' => FieldObject::TYPE_STRING,
            'set', 'phone' => FieldObject::TYPE_ARRAY,
            'int', 'double', 'monetary', 'user', 'org', 'people' => FieldObject::TYPE_NUMERIC,
            default => null,
        };
        */
    }

    protected function getLogger(?string $category = null): LoggerInterface
    {
        return parent::getLogger('Pipedrive');
    }

    private function searchForDuplicate(array $terms, string $type)
    {
        // TODO: reimplement
        return false;
        /*
        if (!$this->detectDuplicates) {
            return null;
        }

        $client = $this->generateAuthorizedClient();
        $query = $client->getConfig('query');

        foreach ($terms as $field => $searchTerms) {
            if (!\is_array($searchTerms)) {
                $searchTerms = [$searchTerms];
            }

            foreach ($searchTerms as $term) {
                if (\strlen($term) < 2) {
                    continue;
                }

                try {
                    $response = $client->get(
                        $this->getEndpoint('/itemSearch'),
                        [
                            'query' => array_merge(
                                $query,
                                [
                                    'term' => $term,
                                    'item_types' => $type,
                                    'fields' => $field,
                                    'exact_match' => true,
                                    'limit' => 1,
                                ]
                            ),
                        ]
                    );

                    $results = json_decode($response->getBody())->data->items;
                    if (\count($results) > 0) {
                        $result = $results[0]->item;

                        return $result->id;
                    }
                } catch (RequestException $e) {
                }
            }
        }

        return null;
        */
    }
}

<?php

namespace Solspace\Freeform\Integrations\CRM\Pipedrive;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Psr\Http\Message\ResponseInterface;
use Solspace\Freeform\Integrations\CRM\PipedriveLeads;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\CRM\AbstractCRMIntegration;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\IntegrationStorageInterface;
use Solspace\Freeform\Library\Integrations\SettingBlueprint;

abstract class AbstractPipedriveIntegration extends AbstractCRMIntegration
{
    const SETTING_DOMAIN = 'domain';
    const SETTING_API_TOKEN = 'api_token';
    const SETTING_USER_ID = 'user_id';
    const SETTING_STAGE_ID = 'stage_id';
    const SETTING_DETECT_DUPLICATES = 'detect_duplicates';

    const PREFIX_ORGANIZATION = 'org';
    const PREFIX_PERSON = 'prsn';
    const PREFIX_DEALS = 'deals';

    /**
     * Returns a list of additional settings for this integration
     * Could be used for anything, like - AccessTokens.
     *
     * @return SettingBlueprint[]
     */
    public static function getSettingBlueprints(): array
    {
        return [
            new SettingBlueprint(
                SettingBlueprint::TYPE_INTERNAL,
                self::SETTING_DOMAIN,
                'Domain',
                'User specific company domain'
            ),
            new SettingBlueprint(
                SettingBlueprint::TYPE_TEXT,
                self::SETTING_API_TOKEN,
                'API Token',
                'Enter your Pipedrive API token here.',
                true
            ),
            new SettingBlueprint(
                SettingBlueprint::TYPE_TEXT,
                self::SETTING_USER_ID,
                'User ID',
                'Enter the Pipedrive User ID you want to assign to new objects.'
            ),
            new SettingBlueprint(
                SettingBlueprint::TYPE_BOOL,
                self::SETTING_DETECT_DUPLICATES,
                'Detect Duplicates',
                'Enable this setting to prevent creation of organizations or persons with overlapping names and/or email addresses.'
            ),
        ];
    }

    /**
     * Check if it's possible to connect to the API.
     */
    public function checkConnection(): bool
    {
        try {
            $response = $this->getAuthorizedClient()->get($this->getEndpoint('/users/me'));
            $json = json_decode((string) $response->getBody(), false);

            return isset($json->success) && true === $json->success;
        } catch (RequestException $exception) {
            throw new IntegrationException($exception->getMessage(), $exception->getCode(), $exception->getPrevious());
        }
    }

    /**
     * Authorizes the application
     * Returns the access_token.
     *
     * @throws IntegrationException
     */
    public function fetchAccessToken(): string
    {
        return $this->getSetting(self::SETTING_API_TOKEN);
    }

    /**
     * A method that initiates the authentication.
     */
    public function initiateAuthentication()
    {
    }

    /**
     * Perform anything necessary before this integration is saved.
     */
    public function onBeforeSave(IntegrationStorageInterface $model)
    {
        $accessToken = $this->getSetting(self::SETTING_API_TOKEN);

        $model->updateAccessToken($accessToken);
        $this->setAccessToken($accessToken);

        try {
            $response = $this->getAuthorizedClient()->get($this->getEndpoint('/users/me'));
            $domain = (json_decode($response->getBody(), false))->data->company_domain;
        } catch (RequestException $e) {
            $domain = null;
        }

        $this->setSetting(self::SETTING_DOMAIN, $domain);
        $model->updateSettings($this->getSettings());
    }

    /**
     * Fetch the custom fields from the integration.
     *
     * @return FieldObject[]
     */
    public function fetchFields(): array
    {
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
    }

    protected function getResponse(string $endpoint, array $queryOptions = []): ResponseInterface
    {
        $client = new Client();

        return $client->get(
            $endpoint,
            [
                'query' => array_merge(
                    ['api_token' => $this->getAccessToken()],
                    $queryOptions ?? []
                ),
                'headers' => ['Accept' => 'application/json'],
            ]
        );
    }

    protected function getAuthorizedClient(): Client
    {
        return new Client(
            ['query' => ['api_token' => $this->getAccessToken()], 'headers' => ['Accept' => 'application/json']]
        );
    }

    protected function getApiRootUrl(): string
    {
        if ($this->getDomain()) {
            return 'https://'.$this->getDomain().'.pipedrive.com/api/v1/';
        }

        return 'https://api.pipedrive.com/api/v1';
    }

    protected function pushOrg(array $fieldList)
    {
        $fields = $this->getFieldsByCategory(self::PREFIX_ORGANIZATION, $fieldList);

        $organizationId = null;
        if ($fields) {
            $client = $this->getAuthorizedClient();

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
    }

    protected function pushPerson(array $fieldList, $organizationId = null)
    {
        $fields = $this->getFieldsByCategory(self::PREFIX_PERSON, $fieldList);

        $personId = null;
        if ($fields) {
            $client = $this->getAuthorizedClient();
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
    }

    protected function addOrgNote($id = null, $content = null)
    {
        if (!$id || empty($content)) {
            return;
        }

        $this->getAuthorizedClient()->post(
            $this->getEndpoint('/notes'),
            [
                'json' => [
                    'content' => $content,
                    'org_id' => $id,
                    'pinned_to_organization_flag' => '1',
                ],
            ]
        );
    }

    protected function addNote($idPrefix, $id, $content)
    {
        if (!$id || empty($content)) {
            return;
        }

        $pinTarget = 'org' === $idPrefix ? 'organization' : $idPrefix;

        $this->getAuthorizedClient()->post(
            $this->getEndpoint('/notes'),
            [
                'json' => [
                    'content' => $content,
                    $idPrefix.'_id' => $id,
                    'pinned_to_'.$pinTarget.'_flag' => '1',
                ],
            ]
        );
    }

    protected function getFieldsByCategory(string $prefix, array $fieldList): array
    {
        $matchedFields = [];
        foreach ($fieldList as $key => $value) {
            if (preg_match('/^'.$prefix.'___(.*)$/', $key, $matches)) {
                $matchedFields[$matches[1]] = $value;
            }
        }

        return $matchedFields;
    }

    protected function getFieldType(string $type)
    {
        switch ($type) {
            case 'varchar':
            case 'varchar_auto':
            case 'text':
            case 'date':
            case 'enum':
            case 'time':
            case 'timerange':
            case 'daterange':
                return FieldObject::TYPE_STRING;

            case 'set':
            case 'phone':
                return FieldObject::TYPE_ARRAY;

            case 'int':
            case 'double':
            case 'monetary':
            case 'user':
            case 'org':
            case 'people':
                return FieldObject::TYPE_NUMERIC;

            default:
                return null;
        }
    }

    /**
     * @return null|int
     */
    protected function getUserId()
    {
        $userId = $this->getSetting(self::SETTING_USER_ID);

        return $userId ? (int) $userId : null;
    }

    private function getDomain()
    {
        return $this->getSetting(self::SETTING_DOMAIN);
    }

    private function searchForDuplicate(array $terms, string $type)
    {
        if (!$this->getSetting(self::SETTING_DETECT_DUPLICATES)) {
            return null;
        }

        $client = $this->getAuthorizedClient();
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
    }
}

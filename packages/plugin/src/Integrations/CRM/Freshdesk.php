<?php

namespace Solspace\Freeform\Integrations\CRM;

use Carbon\Carbon;
use GuzzleHttp\Client;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\CRM\AbstractCRMIntegration;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\IntegrationStorageInterface;
use Solspace\Freeform\Library\Integrations\SettingBlueprint;

class Freshdesk extends AbstractCRMIntegration
{
    const SETTING_API_KEY = 'api_key';
    const SETTING_DOMAIN = 'domain';
    const SETTING_PRIORITY = 'priority';
    const SETTING_STATUS = 'status';
    const SETTING_SOURCE = 'source';
    const SETTING_TYPE = 'type';

    const TITLE = 'Freshdesk';
    const LOG_CATEGORY = 'Freshdesk';

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
                SettingBlueprint::TYPE_TEXT,
                self::SETTING_API_KEY,
                'API Key',
                'Enter your Freshdesk API key here.',
                true
            ),
            new SettingBlueprint(
                SettingBlueprint::TYPE_TEXT,
                self::SETTING_DOMAIN,
                'Domain',
                'Enter your Freshdesk Domain here, e.g. \'https://example.freshdesk.com\'.',
                true
            ),
            new SettingBlueprint(
                SettingBlueprint::TYPE_TEXT,
                self::SETTING_TYPE,
                'Default Type (Optional)',
                'Set the default Type for tickets, e.g. \'Question\'.',
                false
            ),
            new SettingBlueprint(
                SettingBlueprint::TYPE_TEXT,
                self::SETTING_PRIORITY,
                'Default Priority (Optional)',
                'Set the default Priority for tickets, e.g. \'1\' (low).',
                false
            ),
            new SettingBlueprint(
                SettingBlueprint::TYPE_TEXT,
                self::SETTING_STATUS,
                'Default Status (Optional)',
                'Set the default Status for tickets, e.g. \'2\' (open).',
                false
            ),
            new SettingBlueprint(
                SettingBlueprint::TYPE_TEXT,
                self::SETTING_SOURCE,
                'Default Source (Optional)',
                'Set the default Source for tickets, e.g. \'1\' (email), \'2\' (portal), etc.',
                false
            ),
        ];
    }

    /**
     * Push objects to the CRM.
     *
     * @param null|mixed $formFields
     */
    public function pushObject(array $keyValueList, $formFields = null): bool
    {
        $requestType = 'json';

        $values = $customValues = [];
        foreach ($keyValueList as $key => $value) {
            if (\is_string($value) && preg_match('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/', $value)) {
                $value = new Carbon($value, 'UTC');

                if (0 === strpos($key, 'cf_')) {
                    $value = $value->toDateString();
                } else {
                    $value = $value->toIso8601ZuluString();
                }
            }

            if (0 === strpos($key, 'cf_')) {
                if (!empty($value)) {
                    $customValues[$key] = $value;
                }
            } else {
                $values[$key] = $value;
            }
        }

        if ($customValues) {
            $values['custom_fields'] = $customValues;
        }

        if (!isset($values['status']) || !$values['status']) {
            $values['status'] = (int) ($this->getSetting(self::SETTING_STATUS) ?? 2);
        }

        if (!isset($values['priority']) || !$values['priority']) {
            $values['priority'] = (int) ($this->getSetting(self::SETTING_PRIORITY) ?? 1);
        }

        if (!isset($values['source']) || !$values['source']) {
            $values['source'] = (int) ($this->getSetting(self::SETTING_SOURCE) ?? 2);
        }

        if (!isset($values['type']) || !$values['type']) {
            $defaultType = $this->getSetting(self::SETTING_TYPE);
            if ($defaultType) {
                $values['type'] = $defaultType;
            }
        }

        if (isset($values['attachments']) && empty($values['attachments'])) {
            unset($values['attachments']);
        }

        if (isset($values['description']) && !empty($values['description'])) {
            $values['description'] = nl2br($values['description']);
        }

        if (isset($values['attachments']) && !empty($values['attachments'])) {
            $assetData = [];
            foreach ($values['attachments'] as $assetId) {
                if (is_numeric($assetId)) {
                    $asset = \Craft::$app->getAssets()->getAssetById($assetId);
                    if ($asset) {
                        $assetData[] = [
                            'name' => 'attachments[]',
                            'contents' => $asset->getStream(),
                            'headers' => ['Content-Type' => $asset->mimeType],
                        ];
                    }
                }
            }

            if (!empty($assetData)) {
                unset($values['attachments']);

                $multipartValues = [];
                foreach ($values as $key => $value) {
                    $multipartValues[] = [
                        'name' => $key,
                        'contents' => $value,
                        'headers' => ['Content-Type', 'text'],
                    ];
                }
                $values = $multipartValues;

                $values = array_merge($values, $assetData);
                $requestType = 'multipart';
            } else {
                unset($values['attachments']);
            }
        }

        $response = $this
            ->getAuthorizedClient()
            ->post(
                $this->getEndpoint('/tickets'),
                [$requestType => $values]
            )
        ;

        return 200 === $response->getStatusCode();
    }

    /**
     * Check if it's possible to connect to the API.
     */
    public function checkConnection(): bool
    {
        $response = $this
            ->getAuthorizedClient()
            ->get($this->getEndpoint('/tickets'))
        ;

        return 200 === $response->getStatusCode();
    }

    /**
     * Fetch the custom fields from the integration.
     *
     * @return FieldObject[]
     */
    public function fetchFields(): array
    {
        $fieldList = [
            new FieldObject('name', 'Name', FieldObject::TYPE_STRING),
            new FieldObject('email', 'Email', FieldObject::TYPE_STRING),
            new FieldObject('phone', 'Phone', FieldObject::TYPE_STRING),
            new FieldObject('unique_external_id', 'Unique External ID', FieldObject::TYPE_STRING),
            new FieldObject('subject', 'Subject', FieldObject::TYPE_STRING),
            new FieldObject('type', 'Type', FieldObject::TYPE_STRING),
            new FieldObject('status', 'Status', FieldObject::TYPE_NUMERIC),
            new FieldObject('priority', 'Priority', FieldObject::TYPE_NUMERIC),
            new FieldObject('description', 'Description', FieldObject::TYPE_STRING),
            new FieldObject('responder_id', 'Responder ID', FieldObject::TYPE_NUMERIC),
            new FieldObject('attachments', 'Attachments', FieldObject::TYPE_ARRAY),
            new FieldObject('cc_emails', 'CC Emails', FieldObject::TYPE_ARRAY),
            new FieldObject('due_by', 'Due By', FieldObject::TYPE_DATETIME),
            new FieldObject('email_config_id', 'Email Config ID', FieldObject::TYPE_NUMERIC),
            new FieldObject('fr_due_by', 'First Response Due By', FieldObject::TYPE_DATETIME),
            new FieldObject('group_id', 'Group ID', FieldObject::TYPE_NUMERIC),
            new FieldObject('product_id', 'Product ID', FieldObject::TYPE_NUMERIC),
            new FieldObject('source', 'Source', FieldObject::TYPE_NUMERIC),
            new FieldObject('tags', 'Tags', FieldObject::TYPE_ARRAY),
            new FieldObject('company_id', 'Company ID', FieldObject::TYPE_NUMERIC),
        ];

        $response = $this
            ->getAuthorizedClient()
            ->get($this->getEndpoint('/ticket_fields'))
        ;

        $data = \GuzzleHttp\json_decode($response->getBody(), false);
        foreach ($data as $field) {
            if ($field->default) {
                continue;
            }

            $type = null;

            switch ($field->type) {
                case 'custom_text':
                case 'custom_dropdown':
                case 'custom_paragraph':
                    $type = FieldObject::TYPE_STRING;

                    break;

                case 'custom_date':
                    $type = FieldObject::TYPE_DATETIME;

                    break;

                case 'custom_checkbox':
                    $type = FieldObject::TYPE_BOOLEAN;

                    break;

                case 'custom_decimal':
                case 'custom_number':
                    $type = FieldObject::TYPE_NUMERIC;

                    break;
            }

            if (null === $type) {
                continue;
            }

            $fieldObject = new FieldObject(
                $field->name,
                $field->label,
                $type,
                $field->required_for_customers
            );

            $fieldList[] = $fieldObject;
        }

        return $fieldList;
    }

    /**
     * Authorizes the application
     * Returns the access_token.
     *
     * @throws IntegrationException
     */
    public function fetchAccessToken(): string
    {
        return $this->getSetting(self::SETTING_API_KEY);
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
        $model->updateAccessToken($this->getSetting(self::SETTING_API_KEY));
    }

    protected function getApiRootUrl(): string
    {
        return sprintf('https://%s.freshdesk.com/api/v2/', $this->getSubdomain());
    }

    /**
     * @throws IntegrationException
     */
    private function getSubdomain(): string
    {
        $domain = $this->getSetting(self::SETTING_DOMAIN);

        if (preg_match('/https:\/\/(.*).freshdesk.com/', $domain, $matches)) {
            return $matches[1];
        }

        return $domain ?? 'invalid';
    }

    private function getAuthorizedClient(): Client
    {
        return new Client([
            'headers' => ['Content-Type' => 'application/json'],
            'auth' => [$this->getAccessToken(), 'password'],
        ]);
    }
}

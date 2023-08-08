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

namespace Solspace\Freeform\Integrations\CRM\Infusionsoft;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Fields\AbstractField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2ConnectorInterface;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2RefreshTokenInterface;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2RefreshTokenTrait;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2Trait;
use Solspace\Freeform\Library\Integrations\Types\CRM\CRMIntegration;
use yii\base\Event;

#[Type('Infusionsoft')]
class Infusionsoft extends CRMIntegration implements OAuth2ConnectorInterface, OAuth2RefreshTokenInterface
{
    use OAuth2RefreshTokenTrait;
    use OAuth2Trait;

    public const LOG_CATEGORY = 'Infusionsoft';

    public function push(Form $form, Client $client): bool
    {
        // TODO: reimplement
        return false;
        $endpoint = $this->getEndpoint('/contacts');

        // Build out the array of field values
        $keyValueList = array_filter($keyValueList);
        $keyValueList = $this->processFields($keyValueList);

        // Tack on our specific attributes - duplicate_option can be either Email or EmailAndName. This could be made
        // into a setting on the integration
        // https://developer.infusionsoft.com/docs/rest/#!/Contact/createOrUpdateContactUsingPUT
        $keyValueList['duplicate_option'] = 'Email';

        // Assume all source types are WEBFORM
        $keyValueList['source_type'] = 'WEBFORM';

        // $this->getLogger()->info('Submitting to Infusionsoft', $keyValueList);

        $applyTags = [];
        if (isset($keyValueList['infusionsoftTagId'])) {
            $applyTags = explode(',', $keyValueList['infusionsoftTagId']);
            unset($keyValueList['infusionsoftTagId']);
        }

        try {
            $response = $client->put($endpoint, ['json' => $keyValueList]);
            $this->getHandler()->onAfterResponse($this, $response);
            if (\count($applyTags) > 0) {
                $responseBody = json_decode((string) $response->getBody(), true);
                $endpoint = $this->getEndpoint('/contacts/'.$responseBody['id'].'/tags');
                $response = $client->post(
                    $endpoint,
                    ['json' => ['tagIds' => $applyTags]]
                );
            }

            return 201 === $response->getStatusCode();
        } catch (RequestException $e) {
            $exceptionResponse = $e->getResponse();
            if (!$exceptionResponse) {
                $this->getLogger()->error($e->getMessage(), ['exception' => $e->getMessage()]);

                throw $e;
            }

            $responseBody = (string) $exceptionResponse->getBody();
            $this->getLogger()->error($responseBody, ['exception' => $e->getMessage()]);

            if (400 === $exceptionResponse->getStatusCode()) {
                $errors = json_decode($exceptionResponse->getBody(), false);

                if (\is_array($errors)) {
                    foreach ($errors as $error) {
                        if ('REQUIRED_FIELD_MISSING' === strtoupper($error->errorCode)) {
                            return false;
                        }
                    }
                }
            }

            throw $e;
        }
    }

    /**
     * Check if it's possible to connect to the API.
     */
    public function checkConnection(Client $client): bool
    {
        $endpoint = $this->getEndpoint('/account/profile');
        $response = $client->get($endpoint);
        $json = json_decode($response->getBody(), true);

        return !empty($json);
    }

    /**
     * Fetch the custom fields from Infusionsoft.
     *
     * @return FieldObject[]
     */
    public function fetchFields(string $category, Client $client): array
    {
        try {
            $response = $client->get($this->getEndpoint('/contacts/model'));
        } catch (RequestException $e) {
            $this->getLogger()->error($e->getMessage(), ['response' => $e->getResponse()]);

            return [];
        }

        $data = json_decode($response->getBody(), false);

        $fieldList = self::getDefaultFields();

        foreach ($data->custom_fields as $field) {
            $type = null;

            switch ($field->field_type) {
                case 'Text':
                case 'TextArea':
                case 'Radio':
                case 'Dropdown':
                case 'YesNo':
                    $type = FieldObject::TYPE_STRING;

                    break;

                case 'ListBox':
                    $type = FieldObject::TYPE_ARRAY;

                    break;

                case 'Number':
                case 'WholeNumber':
                case 'Currency':
                    $type = FieldObject::TYPE_NUMERIC;

                    break;

                case 'Date':
                    $type = FieldObject::TYPE_DATE;

                    break;

                case 'DateTime':
                    $type = FieldObject::TYPE_DATETIME;

                    break;
            }

            if (null === $type) {
                continue;
            }

            $fieldObject = new FieldObject(
                'custom:'.$field->id,
                $field->label,
                $type,
                $category
            );

            $fieldList[] = $fieldObject;
        }

        return $fieldList;
    }

    // TODO: move to event listener
    public function convertCustomFieldValue(FieldObject $fieldObject, AbstractField $field): mixed
    {
        $value = parent::convertCustomFieldValue($fieldObject, $field);

        if (FieldObject::TYPE_ARRAY === $fieldObject->getType()) {
            $value = \is_array($value) ? implode(';', $value) : $value;
        }

        return $value;
    }

    public function getApiRootUrl(): string
    {
        return 'https://api.infusionsoft.com/crm/rest/v1/';
    }

    /**
     * URL pointing to the OAuth2 authorization endpoint.
     */
    public function getAuthorizeUrl(): string
    {
        return 'https://signin.infusionsoft.com/app/oauth/authorize';
    }

    /**
     * URL pointing to the OAuth2 access token endpoint.
     */
    public function getAccessTokenUrl(): string
    {
        return 'https://api.infusionsoft.com/token';
    }

    private static function getDefaultFields(): array
    {
        $fieldList = [];

        // Default fields in Infusionsoft - we're namespacing them to make sure we can process the request properly
        // Done this way to get around the way Infusionsoft's API handles built-in and 2-dimensional fields.
        // The key is composed as such: <fieldType>:<fieldHandle>:<nestedPropertyOnFieldHandle>
        // The field type gets stripped off; however, we need it to determine how to handle the field. See processFields
        $fieldList[] = new FieldObject('default:given_name', 'First Name', FieldObject::TYPE_STRING);
        $fieldList[] = new FieldObject('default:middle_name', 'Middle Name', FieldObject::TYPE_STRING);
        $fieldList[] = new FieldObject('default:family_name', 'Last Name', FieldObject::TYPE_STRING);
        $fieldList[] = new FieldObject('default:suffix', 'Name Suffix', FieldObject::TYPE_STRING);
        $fieldList[] = new FieldObject('default:preferred_name', 'Preferred Name', FieldObject::TYPE_STRING);
        $fieldList[] = new FieldObject('default:website', 'Website', FieldObject::TYPE_STRING);
        $fieldList[] = new FieldObject('default:time_zone', 'Timezone', FieldObject::TYPE_STRING);
        $fieldList[] = new FieldObject('default:spouse_name', 'Spouse Name', FieldObject::TYPE_STRING);
        $fieldList[] = new FieldObject('default:opt_in_reason', 'Opt in Reason', FieldObject::TYPE_STRING);
        $fieldList[] = new FieldObject('default:lead_source_id', 'Lead Source ID', FieldObject::TYPE_NUMERIC);
        $fieldList[] = new FieldObject('default:job_title', 'Job Title', FieldObject::TYPE_STRING);
        $fieldList[] = new FieldObject('default:owner_id', 'Owner ID', FieldObject::TYPE_NUMERIC);

        // Default email address field
        $fieldList[] = new FieldObject('email_addresses:EMAIL1:email', 'Email Address 1', FieldObject::TYPE_STRING);

        // Address fields (Infusionsoft calls it BILLING - but addresses is an array of objects)
        // See sample https://developer.infusionsoft.com/docs/rest/#!/Contact/createOrUpdateContactUsingPUT
        $fieldList[] = new FieldObject('addresses:BILLING:country_code', 'Billing Address: Country Code', FieldObject::TYPE_STRING);
        $fieldList[] = new FieldObject('addresses:BILLING:line1', 'Billing Address: Line 1', FieldObject::TYPE_STRING);
        $fieldList[] = new FieldObject('addresses:BILLING:line2', 'Billing Address: Line 2', FieldObject::TYPE_STRING);
        $fieldList[] = new FieldObject('addresses:BILLING:locality', 'Billing Address: Locality', FieldObject::TYPE_STRING);
        $fieldList[] = new FieldObject('addresses:BILLING:postal_code', 'Billing Address: Postal Code', FieldObject::TYPE_STRING);
        $fieldList[] = new FieldObject('addresses:BILLING:region', 'Billing Address: Region', FieldObject::TYPE_STRING);
        $fieldList[] = new FieldObject('addresses:BILLING:zip_code', 'Billing Address: Zip Code', FieldObject::TYPE_STRING);

        $fieldList[] = new FieldObject('phone_numbers:PHONE1:number', 'Phone Number', FieldObject::TYPE_STRING);

        $fieldList[] = new FieldObject('infusionsoftTagId', 'Apply Tag ID', FieldObject::TYPE_STRING);

        return $fieldList;
    }

    private function processFields(array $data): array
    {
        // Infusionsoft wants custom fields in their own array
        $resultData = [
            'custom_fields' => [],
        ];

        // Now we need to construct our array based on the Freeform field mapping handles
        $complexData = [];

        foreach ($data as $fieldName => $fieldValue) {
            // Apply a tag if desired
            if ('infusionsoftTagId' === $fieldName) {
                $resultData['infusionsoftTagId'] = $fieldValue;

                continue;
            }

            // Deal with simple default - just rip off the fieldType (default:)
            if (str_starts_with($fieldName, 'default:')) {
                $processedFieldName = preg_replace('/^'.preg_quote('default:', '/').'/', '', $fieldName);

                $resultData[$processedFieldName] = $fieldValue;

                continue;
            }

            // Custom fields, we rip off the fieldHandle and insert as a 2d array into $resultData['customFields']
            if (str_starts_with($fieldName, 'custom:')) {
                $processedFieldName = preg_replace('/^'.preg_quote('custom:', '/').'/', '', $fieldName);

                $resultData['custom_fields'][] = [
                    'id' => $processedFieldName,
                    'content' => $fieldValue,
                ];

                continue;
            }

            // If it's not custom or default, it means it's a 2d field (handle and sub-properties)
            $fieldScopes = explode(':', $fieldName, 3);
            // Double-check we have 3 items between the colons
            if (3 === \count($fieldScopes)) {
                // I.E. email_addresses
                $fieldGroup = $fieldScopes[0];
                // I.E. BILLING
                $fieldHandle = $fieldScopes[1];
                // I.E. country_code
                $fieldParameter = $fieldScopes[2];

                // If we haven't started processing this field handle yet, create an array for it so we don't lose
                // existing properties

                // Check the type
                if (!isset($complexData[$fieldGroup])) {
                    $complexData[$fieldGroup] = [];
                }

                // Check the field handle and set the key
                if (!isset($complexData[$fieldGroup][$fieldHandle])) {
                    $complexData[$fieldGroup][$fieldHandle] = [];
                }

                // Construct our field property object
                $complexData[$fieldGroup][$fieldHandle][$fieldParameter] = $fieldValue;
            }
        }
        // This code will flatten the field name key to a value
        $flattenedData = [];
        foreach ($complexData as $fieldGroupHandle => $complexDatum) {
            $flattenedData[$fieldGroupHandle] = [];
            foreach ($complexDatum as $field => $item) {
                $item['field'] = $field;
                $flattenedData[$fieldGroupHandle][] = $item;
            }
        }

        return array_merge($resultData, $flattenedData);
    }
}

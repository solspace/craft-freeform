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

namespace Solspace\Freeform\Integrations\CRM\SharpSpring;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Psr\Http\Message\ResponseInterface;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Validators;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\Types\CRM\CRMIntegration;

#[Type(
    name: 'SharpSpring',
    iconPath: __DIR__.'/icon.svg',
)]
class SharpSpring extends CRMIntegration
{
    public const LOG_CATEGORY = 'SharpSpring';

    #[Flag(self::FLAG_ENCRYPTED)]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Validators\Required]
    #[Input\Text(
        label: 'Account ID',
        instructions: 'Enter your Account ID here.',
    )]
    protected string $accountId = '';

    #[Flag(self::FLAG_ENCRYPTED)]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Validators\Required]
    #[Input\Text(
        instructions: 'Enter your Secret Key here.',
    )]
    protected string $secretKey = '';

    public function getAccountId(): string
    {
        return $this->getProcessedValue($this->accountId);
    }

    public function getSecretKey(): string
    {
        return $this->getProcessedValue($this->secretKey);
    }

    public function initiateAuthentication(): void
    {
    }

    public function push(Form $form, Client $client): bool
    {
        // TODO: reimplement
        return false;
        $contactProps = [];

        foreach ($keyValueList as $key => $value) {
            preg_match('/^(\w+)___(.+)$/', $key, $matches);

            [$_, $target, $propName] = $matches;

            switch ($target) {
                case 'contact':
                case 'custom':
                    $contactProps[$propName] = $value;

                    break;
            }
        }

        if ($contactProps) {
            try {
                $payload = $this->generatePayload('createLeads', ['objects' => [$contactProps]]);
                $response = $this->getResponse($payload);

                $data = json_decode((string) $response->getBody(), true);

                $this->getHandler()->onAfterResponse($this, $response);

                return isset($data['result']['error']) && (0 === \count($data['result']['error']));
            } catch (RequestException $e) {
                if ($e->getResponse()) {
                    $json = json_decode((string) $e->getResponse()->getBody());
                    $this->getLogger()->error($json, ['exception' => $e->getMessage()]);
                }
            } catch (\Exception $e) {
                $this->getLogger()->error($e->getMessage());
            }
        }

        return false;
    }

    /**
     * Check if it's possible to connect to the API.
     *
     * @throws IntegrationException
     */
    public function checkConnection(Client $client): bool
    {
        $payload = $this->generatePayload('getFields', ['where' => [], 'limit' => 1]);

        try {
            $response = $this->getResponse($payload);
            $json = json_decode((string) $response->getBody(), true);

            return isset($json['result']['field']);
        } catch (\Exception $e) {
            throw new IntegrationException($e->getMessage(), $e->getCode(), $e->getPrevious());
        }
    }

    /**
     * Fetch the custom fields from the integration.
     *
     * @return FieldObject[]
     *
     * @throws IntegrationException
     */
    public function fetchFields(string $category, Client $client): array
    {
        // TODO: reimplement
        return [];
        $response = $this->getResponse($this->generatePayload('getFields', ['where' => ['isCustom' => '1']]));
        $json = (string) $response->getBody();
        $data = json_decode($json, true);
        $fields = [];
        if (isset($data['result']['field'])) {
            $fields = $data['result']['field'];
        }

        $suffix = ' (Contact)';

        $fieldList = [
            new FieldObject('contact___emailAddress', "Email{$suffix}", FieldObject::TYPE_STRING, false),
            new FieldObject('contact___firstName', "First Name{$suffix}", FieldObject::TYPE_STRING, false),
            new FieldObject('contact___lastName', "Last Name{$suffix}", FieldObject::TYPE_STRING, false),
            new FieldObject('contact___website', "Website{$suffix}", FieldObject::TYPE_STRING, false),
            new FieldObject('contact___phoneNumber', "Phone Number{$suffix}", FieldObject::TYPE_NUMERIC, false),
            new FieldObject(
                'contact___phoneNumberExtension',
                "Phone Number Extension{$suffix}",
                FieldObject::TYPE_NUMERIC,
                false
            ),
            new FieldObject('contact___faxNumber', "Fax Number{$suffix}", FieldObject::TYPE_NUMERIC, false),
            new FieldObject('contact___mobilePhoneNumber', "Mobile Phone Number{$suffix}", FieldObject::TYPE_NUMERIC, false),
            new FieldObject('contact___street', "Street Address{$suffix}", FieldObject::TYPE_STRING, false),
            new FieldObject('contact___city', "City{$suffix}", FieldObject::TYPE_STRING, false),
            new FieldObject('contact___state', "State{$suffix}", FieldObject::TYPE_STRING, false),
            new FieldObject('contact___zipcode', "Zip{$suffix}", FieldObject::TYPE_NUMERIC, false),
            new FieldObject('contact___companyName', "Company Name{$suffix}", FieldObject::TYPE_STRING, false),
            new FieldObject('contact___industry', "Industry{$suffix}", FieldObject::TYPE_STRING, false),
            new FieldObject('contact___description', "Description{$suffix}", FieldObject::TYPE_STRING, false),
            new FieldObject('contact___title', "Title{$suffix}", FieldObject::TYPE_STRING, false),
        ];

        foreach ($fields as $field) {
            $field = (object) $field;
            if (!$field || !\is_object($field)) {
                continue;
            }

            $type = null;

            switch ($field->dataType) {
                case 'text':
                case 'string':
                case 'picklist':
                case 'phone':
                case 'url':
                case 'textarea':
                case 'country':
                case 'checkbox':
                case 'date':
                case 'bit':
                case 'hidden':
                case 'state':
                case 'radio':
                case 'datetime':
                    $type = FieldObject::TYPE_STRING;

                    break;

                case 'int':
                    $type = FieldObject::TYPE_NUMERIC;

                    break;

                case 'boolean':
                    $type = FieldObject::TYPE_BOOLEAN;

                    break;
            }

            if (null === $type) {
                continue;
            }

            $fieldObject = new FieldObject(
                'custom___'.$field->systemName,
                $field->label.' (Custom Fields)',
                $type,
                false
            );

            $fieldList[] = $fieldObject;
        }

        return $fieldList;
    }

    /**
     * Get the base SharpSpring API URL.
     */
    public function getApiRootUrl(): string
    {
        return 'https://api.sharpspring.com/pubapi/v1.2/';
    }

    public function generateAuthorizedClient(): Client
    {
        return new Client([
            'query' => [
                'accountID' => $this->getAccountId(),
                'secretKey' => $this->getSecretKey(),
            ],
        ]);
    }

    /**
     * Generate a properly formatted payload for SharpSpring API.
     */
    private function generatePayload(
        string $method,
        array $params = ['where' => []],
        string $id = 'freeform'
    ): array {
        return [
            'method' => $method,
            'params' => $params,
            'id' => $id,
        ];
    }

    private function getResponse(array $payload): ResponseInterface
    {
        $client = $this->generateAuthorizedClient();

        return $client->post($this->getApiRootUrl(), ['json' => $payload]);
    }
}

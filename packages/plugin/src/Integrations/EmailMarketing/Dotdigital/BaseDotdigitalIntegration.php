<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2024, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Integrations\EmailMarketing\Dotdigital;

use GuzzleHttp\Client;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Validators;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\Types\EmailMarketing\DataObjects\ListObject;
use Solspace\Freeform\Library\Integrations\Types\EmailMarketing\EmailMarketingIntegration;

abstract class BaseDotdigitalIntegration extends EmailMarketingIntegration implements DotdigitalIntegrationInterface
{
    public const CATEGORY_CONTACT_DATA = 'data-fields';

    protected const LOG_CATEGORY = 'Dotdigital';

    #[Flag(self::FLAG_ENCRYPTED)]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Validators\Required]
    #[Input\Text(
        label: 'API URL',
        instructions: 'Enter your API specific URL (e.g. "https://{region}-api.dotdigital.com").',
        order: 1,
    )]
    protected string $apiUrl = '';

    #[Flag(self::FLAG_ENCRYPTED)]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Validators\Required]
    #[Input\Text(
        label: 'API User Email',
        instructions: 'Enter your Dotdigital API user email',
        order: 2,
    )]
    protected string $apiUserEmail = '';

    #[Flag(self::FLAG_ENCRYPTED)]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Validators\Required]
    #[Input\Text(
        label: 'API User Password',
        instructions: 'Enter your Dotdigital API user password',
        order: 3,
    )]
    protected string $apiUserPassword = '';

    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Input\Select(
        label: 'Email Opt In Type',
        instructions: "Setting the Opt In Type to 'VerifiedDouble' will result in a double opt-in confirmation email being sent to the contact. The result will state that the contact's OptInType is 'Double' and Status is 'PendingOptIn'. These will only update to 'VerifiedDouble' and 'Subscribed' respectively once the contact has clicked the link in the confirmation email, at which point they will be added to the account.",
        order: 4,
        options: [
            '' => '',
            'Unknown' => 'Unknown',
            'Single' => 'Single',
            'Double' => 'Double',
            'VerifiedDouble' => 'VerifiedDouble',
        ],
    )]
    protected string $optInType = '';

    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Input\Select(
        label: 'Email Type',
        order: 5,
        options: [
            '' => '',
            'PlainText' => 'PlainText',
            'Html' => 'Html',
        ],
    )]
    protected string $emailType = '';

    public function checkConnection(Client $client): bool
    {
        try {
            $response = $client->get($this->getEndpoint('/account-info'));

            return 200 === $response->getStatusCode();
        } catch (\Exception $exception) {
            throw new IntegrationException($exception->getMessage(), $exception->getCode(), $exception->getPrevious());
        }
    }

    public function getApiUrl(): string
    {
        return $this->getProcessedValue($this->apiUrl);
    }

    public function getApiUserEmail(): string
    {
        return $this->getProcessedValue($this->apiUserEmail);
    }

    public function getApiUserPassword(): string
    {
        return $this->getProcessedValue($this->apiUserPassword);
    }

    public function getOptInType(): string
    {
        return $this->getProcessedValue($this->optInType);
    }

    public function getEmailType(): string
    {
        return $this->getProcessedValue($this->emailType);
    }

    public function fetchFields(ListObject $list, string $category, Client $client): array
    {
        try {
            $response = $client->get($this->getEndpoint('/data-fields'));
        } catch (\Exception $exception) {
            $this->processException($exception, $category);
        }

        $json = json_decode((string) $response->getBody());

        $fieldList = [];

        if (!empty($json)) {
            foreach ($json as $field) {
                $type = match ($field->type) {
                    'Boolean' => FieldObject::TYPE_BOOLEAN,
                    'Numeric' => FieldObject::TYPE_NUMERIC,
                    default => FieldObject::TYPE_STRING,
                };

                $fieldList[] = new FieldObject(
                    $field->name,
                    $field->name,
                    $type,
                    $category,
                    false,
                );
            }
        }

        return $fieldList;
    }

    public function fetchLists(Client $client): array
    {
        try {
            $response = $client->get($this->getEndpoint('/address-books'));
        } catch (\Exception $exception) {
            $this->processException($exception, self::LOG_CATEGORY);
        }

        $json = json_decode((string) $response->getBody());

        $lists = [];

        if (!empty($json)) {
            foreach ($json as $list) {
                if (isset($list->id, $list->name)) {
                    $lists[] = new ListObject(
                        $list->id,
                        $list->name,
                    );
                }
            }
        }

        return $lists;
    }
}

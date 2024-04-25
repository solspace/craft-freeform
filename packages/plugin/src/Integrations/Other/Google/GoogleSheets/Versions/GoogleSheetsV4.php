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

namespace Solspace\Freeform\Integrations\Other\Google\GoogleSheets\Versions;

use GuzzleHttp\Client;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Implementations\FieldMapping\FieldMapping;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Input\Special\Properties\FieldMappingTransformer;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Integrations\Other\Google\GoogleSheets\BaseGoogleSheetsIntegration;

#[Type(
    name: 'Google Sheets',
    type: Type::TYPE_OTHER,
    version: 'v4',
    readme: __DIR__.'/../README.md',
    iconPath: __DIR__.'/../icon.svg',
)]
class GoogleSheetsV4 extends BaseGoogleSheetsIntegration
{
    protected const API_VERSION = 'v2';

    // ==========================================
    //                   Deals
    // ==========================================

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[VisibilityFilter('Boolean(enabled)')]
    #[Input\Boolean(
        label: 'Map Deals',
        instructions: 'Should map to the Deals endpoint.',
        order: 5,
    )]
    protected bool $mapDeals = false;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(FieldMappingTransformer::class)]
    #[VisibilityFilter('Boolean(enabled)')]
    #[VisibilityFilter('Boolean(values.mapDeals)')]
    #[Input\Special\Properties\FieldMapping(
        instructions: 'Select the Freeform fields to be mapped to the applicable Google Sheets Deals fields',
        order: 6,
        source: 'api/integrations/other/fields/'.self::CATEGORY_DEAL,
        parameterFields: ['id' => 'id'],
    )]
    protected ?FieldMapping $dealMapping = null;

    public function getApiRootUrl(): string
    {
        return parent::getApiRootUrl().'/'.self::API_VERSION;
    }

    public function push(Form $form, Client $client): bool
    {
        $this->processDeals($form, $client);

        return true;
    }

    protected function getProcessableFields(string $category): array {}

    private function processDeals(Form $form, Client $client): void
    {
        if (!$this->mapDeals) {
            return;
        }

        $mapping = $this->processMapping($form, $this->dealMapping, self::CATEGORY_DEAL);
        if (!$mapping) {
            return;
        }

        $mapping['Stage'] = $this->getStage() ?? 'Qualification';
        $mapping['Account_Name'] = ['id' => $this->accountId];
        $mapping['Contact_Name'] = ['id' => $this->contactId];

        try {
            $response = $client->post(
                $this->getEndpoint('/Deals'),
                [
                    'json' => [
                        'data' => [$mapping],
                    ],
                ],
            );

            $this->triggerAfterResponseEvent(self::CATEGORY_DEAL, $response);

            $json = json_decode((string) $response->getBody(), true);

            $this->processGoogleSheetsResponseError($json);

            if (isset($json['data'][0])) {
                $data = $json['data'][0];

                $this->dealId = $data['details']['id'];
            }

            if ($this->dealId && $this->contactId) {
                $response = $client->put(
                    $this->getEndpoint('/Contacts/'.$this->contactId.'/Deals/'.$this->dealId),
                    [
                        'json' => [
                            'data' => [
                                ['Contact_Role' => $this->getDefaultContactRoleId()],
                            ],
                        ],
                    ],
                );

                $json = json_decode((string) $response->getBody(), true);

                $this->processGoogleSheetsResponseError($json);
            }
        } catch (\Exception $exception) {
            $this->processException($exception, self::LOG_CATEGORY);
        }
    }
}

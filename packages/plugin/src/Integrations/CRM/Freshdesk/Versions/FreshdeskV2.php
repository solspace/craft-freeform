<?php

namespace Solspace\Freeform\Integrations\CRM\Freshdesk\Versions;

use Carbon\Carbon;
use GuzzleHttp\Client;
use Solspace\Freeform\Attributes\Integration\Type;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Implementations\FieldMapping\FieldMapping;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Input\Special\Properties\FieldMappingTransformer;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Integrations\CRM\Freshdesk\BaseFreshdeskIntegration;

#[Type(
    name: 'Freshdesk (v2)',
    readme: __DIR__.'/../README.md',
    iconPath: __DIR__.'/../icon.svg',
)]
class FreshdeskV2 extends BaseFreshdeskIntegration
{
    protected const API_VERSION = 'v2';

    // ==========================================
    //                Ticket
    // ==========================================

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[Input\Boolean(
        label: 'Map to Ticket?',
        instructions: 'Should map to ticket',
        order: 7,
    )]
    protected bool $mapTicket = false;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(FieldMappingTransformer::class)]
    #[VisibilityFilter('Boolean(values.mapTicket)')]
    #[Input\Special\Properties\FieldMapping(
        instructions: 'Select the Freeform fields to be mapped to the applicable Freshdesk Ticket fields',
        order: 8,
        source: 'api/integrations/crm/fields/'.self::CATEGORY_TICKET,
        parameterFields: ['id' => 'id'],
    )]
    protected ?FieldMapping $ticketMapping = null;

    public function getApiRootUrl(): string
    {
        $url = $this->getDomain();

        $url = rtrim($url, '/');

        return $url.'/api/'.self::API_VERSION;
    }

    public function push(Form $form, Client $client): bool
    {
        $this->processTickets($form, $client);

        return true;
    }

    private function processTickets(Form $form, Client $client): void
    {
        if (!$this->mapTicket) {
            return;
        }

        $mapping = $this->processMapping($form, $this->ticketMapping, self::CATEGORY_TICKET);
        if (!$mapping) {
            return;
        }

        $requestType = 'json';

        $values = [];
        $customValues = [];

        foreach ($mapping as $key => $value) {
            if (\is_string($value) && preg_match('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/', $value)) {
                $value = new Carbon($value, 'UTC');

                if (str_starts_with($key, 'cf_')) {
                    $value = $value->toDateString();
                } else {
                    $value = $value->toIso8601ZuluString();
                }
            }

            if (str_starts_with($key, 'cf_')) {
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
            $values['status'] = ($this->getDefaultStatus() ?? 2);
        }

        if (!isset($values['priority']) || !$values['priority']) {
            $values['priority'] = ($this->getDefaultPriority() ?? 1);
        }

        if (!isset($values['source']) || !$values['source']) {
            $values['source'] = ($this->getDefaultSource() ?? 2);
        }

        if (!isset($values['type']) || !$values['type']) {
            $defaultType = $this->getDefaultType();
            if ($defaultType) {
                $values['type'] = $defaultType;
            }
        }

        if (empty($values['attachments'])) {
            unset($values['attachments']);
        }

        if (!empty($values['description'])) {
            $values['description'] = nl2br($values['description']);
        }

        if (!empty($values['attachments'])) {
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

            unset($values['attachments']);
            if (!empty($assetData)) {
                $multipartValues = [];
                foreach ($values as $key => $value) {
                    $multipartValues[] = [
                        'name' => $key,
                        'contents' => $value,
                        'headers' => ['Content-Type' => 'text'],
                    ];
                }
                $values = $multipartValues;

                $values = array_merge($values, $assetData);
                $requestType = 'multipart';
            }
        }

        try {
            $client->post(
                $this->getEndpoint('/tickets'),
                [$requestType => $values],
            );
        } catch (\Exception $exception) {
            $this->processException($exception, self::LOG_CATEGORY);
        }
    }
}

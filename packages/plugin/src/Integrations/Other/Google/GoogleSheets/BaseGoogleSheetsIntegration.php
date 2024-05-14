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

namespace Solspace\Freeform\Integrations\Other\Google\GoogleSheets;

use GuzzleHttp\Client;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Implementations\FieldMapping\FieldMapping;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Input\Special\Properties\FieldMappingTransformer;
use Solspace\Freeform\Attributes\Property\Validators\Required;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Integrations\Other\Google\GoogleSheets\Utilities\SheetsHelper;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\APIIntegration;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2ConnectorInterface;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2RefreshTokenInterface;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2RefreshTokenTrait;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2Trait;

abstract class BaseGoogleSheetsIntegration extends APIIntegration implements OAuth2ConnectorInterface, OAuth2RefreshTokenInterface, GoogleSheetsIntegrationInterface
{
    use OAuth2RefreshTokenTrait;
    use OAuth2Trait;

    protected const LOG_CATEGORY = 'GoogleSheets';

    protected const INSERT_OPTION_OVERWRITE = 'OVERWRITE';
    protected const INSERT_OPTION_INSERT_ROWS = 'INSERT_ROWS';

    #[Flag(self::FLAG_AS_HIDDEN_IN_INSTANCE)]
    #[Required]
    #[Input\Text(
        label: 'Google Sheets Id',
        order: 4,
        placeholder: 'Enter your Google Sheets ID.',
    )]
    protected ?string $googleSheetsId = null;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[Input\DynamicSelect(
        label: 'Sheet (Optional)',
        instructions: 'Select the sheet you want to push data to. If left empty, it will push to the first sheet.',
        order: 5,
        emptyOption: 'First Sheet',
        source: 'api/google-sheets/sheets',
        parameterFields: [
            'id' => 'integrationId',
            'values.googleSheetsId' => 'googleSheetsId',
        ],
    )]
    protected ?string $sheet;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[Input\Integer(
        label: 'Offset (Optional)',
        instructions: 'Enter the number of rows to skip from the beginning. (0 to start from the first row, 3 to skip the first 3 rows, etc.)',
        order: 5,
        placeholder: '0',
    )]
    protected ?int $offset = null;

    #[Input\Boolean(
        label: 'Process User Input',
        instructions: 'If will treat the data as user entered and convert to formulas, formats, dates, etc. Otherwise it won\'t',
        order: 6,
    )]
    protected bool $processValues = false;

    #[Input\Select(
        label: 'Insert Option',
        instructions: 'Select how to insert data into the Google Sheet.',
        order: 7,
        options: [
            self::INSERT_OPTION_OVERWRITE => 'Overwrite',
            self::INSERT_OPTION_INSERT_ROWS => 'Insert Rows',
        ],
    )]
    protected string $insertOption = self::INSERT_OPTION_OVERWRITE;

    #[Flag(self::FLAG_INSTANCE_ONLY)]
    #[ValueTransformer(FieldMappingTransformer::class)]
    #[VisibilityFilter('Boolean(enabled)')]
    #[Input\Special\Properties\FieldMapping(
        instructions: 'Select the Freeform fields to be mapped to the applicable Google Sheet columns',
        order: 9,
        source: 'api/google-sheets/column-fields',
        parameterFields: [
            'id' => 'integrationId',
            'values.sheet' => 'sheet',
            'values.googleSheetsId' => 'googleSheetsId',
        ],
    )]
    protected ?FieldMapping $fieldMapping = null;

    public function getGoogleSheetsId(): ?string
    {
        return $this->googleSheetsId;
    }

    public function getOffset(): ?int
    {
        return $this->offset;
    }

    public function isProcessValues(): bool
    {
        return $this->processValues;
    }

    public function getInsertOption(): string
    {
        return $this->insertOption;
    }

    public function getSheet(): ?string
    {
        return $this->sheet;
    }

    public function getFieldMapping(): ?FieldMapping
    {
        return $this->fieldMapping;
    }

    public function checkConnection(Client $client): bool
    {
        try {
            $url = 'https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=';
            $accessToken = $this->getAccessToken();

            $response = $client->get($url.$accessToken);

            $json = json_decode((string) $response->getBody(), false);

            return !empty($json);
        } catch (\Exception $exception) {
            throw new IntegrationException($exception->getMessage(), $exception->getCode(), $exception->getPrevious());
        }
    }

    public function getAuthorizeUrl(): string
    {
        return 'https://accounts.google.com/o/oauth2/v2/auth';
    }

    public function getAccessTokenUrl(): string
    {
        return 'https://oauth2.googleapis.com/token';
    }

    public function getApiRootUrl(): string
    {
        return 'https://sheets.googleapis.com';
    }

    protected function getProcessableFields(string $category): array
    {
        $fields = [];
        foreach ($this->fieldMapping as $mapping) {
            $columnIndex = (int) $mapping->getSource();
            $columnLetter = SheetsHelper::getColumnLetter($columnIndex);

            $fields[$columnIndex] = new FieldObject(
                $columnIndex,
                $columnLetter,
                FieldObject::TYPE_STRING,
                $category,
                false,
            );
        }

        return $fields;
    }
}

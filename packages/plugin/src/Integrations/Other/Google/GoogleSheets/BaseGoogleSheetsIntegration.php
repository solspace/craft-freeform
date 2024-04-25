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
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Validators\Required;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2ConnectorInterface;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2RefreshTokenInterface;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2RefreshTokenTrait;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2Trait;
use Solspace\Freeform\Library\Integrations\Types\Other\OtherIntegration;
use Solspace\Freeform\Library\Logging\FreeformLogger;

abstract class BaseGoogleSheetsIntegration extends OtherIntegration implements OAuth2ConnectorInterface, OAuth2RefreshTokenInterface, GoogleSheetsIntegrationInterface
{
    use OAuth2RefreshTokenTrait;
    use OAuth2Trait;

    protected const LOG_CATEGORY = 'GoogleSheets';

    protected const CATEGORY_DEAL = 'Deal';

    #[Required]
    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Input\Text(
        label: 'Google Sheets Id',
        order: 4,
        placeholder: 'Enter your Google Sheets ID.',
    )]
    protected ?string $googleSheetsId = null;

    public function checkConnection(Client $client): bool
    {
        try {
            $response = $client->get($this->getEndpoint('/files'));

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
        return 'https://www.googleapis.com/drive';
    }

    public function getGoogleSheetsId(): ?string
    {
        return $this->googleSheetsId;
    }

    protected function processGoogleSheetsResponseError(array $response): void
    {
        $data = $response['data'][0];

        if ('error' === $data['status']) {
            Freeform::getInstance()->logger->getLogger(FreeformLogger::INTEGRATION)->error(
                self::LOG_CATEGORY.' '.$data['message'],
                ['exception' => $data],
            );

            throw new IntegrationException($data['message']);
        }
    }
}

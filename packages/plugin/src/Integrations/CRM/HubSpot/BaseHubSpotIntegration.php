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

namespace Solspace\Freeform\Integrations\CRM\HubSpot;

use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2ConnectorInterface;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2RefreshTokenInterface;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2RefreshTokenTrait;
use Solspace\Freeform\Library\Integrations\OAuth\OAuth2Trait;
use Solspace\Freeform\Library\Integrations\Types\CRM\CRMIntegration;

abstract class BaseHubSpotIntegration extends CRMIntegration implements OAuth2ConnectorInterface, OAuth2RefreshTokenInterface, HubSpotIntegrationInterface
{
    use OAuth2RefreshTokenTrait;
    use OAuth2Trait;

    protected const LOG_CATEGORY = 'HubSpot';

    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Input\Text(
        label: 'App ID',
        instructions: "This is your app's unique ID. You'll need it to make API calls.",
        order: 1,
    )]
    protected ?string $appId = null;

    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Input\Text(
        label: 'IP Address Field',
        instructions: "Enter a custom HubSpot Contact field handle where you wish to store the client's IP address from the submission (optional).",
        order: 2,
    )]
    protected ?string $ipField = null;

    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Input\Boolean(
        label: 'Append checkbox group field values on Contact update?',
        instructions: 'If a Contact already exists in HubSpot, enabling this will append additional checkbox group field values to the Contact inside HubSpot, instead of overwriting the options.',
        order: 3,
    )]
    protected bool $appendContactData = false;

    #[Flag(self::FLAG_GLOBAL_PROPERTY)]
    #[Input\Boolean(
        label: 'Append checkbox group field values on Company update?',
        instructions: 'If a Company already exists in HubSpot, enabling this will append additional checkbox group field values to the Company inside HubSpot, instead of overwriting the options.',
        order: 4,
    )]
    protected bool $appendCompanyData = false;

    public function getAuthorizeUrl(): string
    {
        return 'https://app.hubspot.com/oauth/authorize';
    }

    public function getAccessTokenUrl(): string
    {
        return 'https://api.hubapi.com/oauth/v1/token';
    }

    protected function getAppId(): ?string
    {
        return $this->getProcessedValue($this->appId);
    }

    protected function getIpField(): string
    {
        return $this->getProcessedValue($this->ipField);
    }

    protected function getAppendContactData(): bool
    {
        return $this->appendContactData;
    }

    protected function getAppendCompanyData(): bool
    {
        return $this->appendCompanyData;
    }
}

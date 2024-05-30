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

namespace Solspace\Freeform\Services\Integrations;

use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationClientProvider;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Integrations\Other\Google\GoogleSheets\GoogleSheetsIntegrationInterface;
use Solspace\Freeform\Services\BaseService;

class GoogleSheetsService extends BaseService
{
    public function __construct(
        protected FormIntegrationsProvider $integrationsProvider,
        protected IntegrationClientProvider $clientProvider,
    ) {
        parent::__construct();
    }

    public function processIntegrations(Form $form): void
    {
        $integrations = $this->integrationsProvider->getForForm($form, GoogleSheetsIntegrationInterface::class);
        foreach ($integrations as $integration) {
            $client = $this->clientProvider->getAuthorizedClient($integration);
            $integration->push($form, $client);
        }
    }

    public function hasIntegrations(Form $form): bool
    {
        return \count($this->integrationsProvider->getForForm($form, GoogleSheetsIntegrationInterface::class)) > 0;
    }
}

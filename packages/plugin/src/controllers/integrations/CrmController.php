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

namespace Solspace\Freeform\controllers\integrations;

use Solspace\Freeform\Library\Integrations\IntegrationInterface;
use Solspace\Freeform\Models\IntegrationModel;

class CrmController extends IntegrationsController
{
    protected function getIntegrationModels(): array
    {
        return $this->getCRMService()->getAllIntegrations();
    }

    protected function getServiceProviderTypes(): array
    {
        return $this->getCrmService()->getAllServiceProviders();
    }

    protected function getTitle(): string
    {
        return 'CRM';
    }

    protected function getType(): string
    {
        return 'crm';
    }

    protected function getIntegrationType(): string
    {
        return IntegrationInterface::TYPE_CRM;
    }

    protected function getNewOrExistingModel(int|string|null $id): IntegrationModel
    {
        if (is_numeric($id)) {
            $model = $this->getCrmService()->getIntegrationById($id);
        } else {
            $model = $this->getCrmService()->getIntegrationByHandle($id);
        }

        if (!$model) {
            $model = IntegrationModel::create(IntegrationInterface::TYPE_CRM);
        }

        return $model;
    }
}

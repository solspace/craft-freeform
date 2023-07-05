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

use Solspace\Freeform\Models\IntegrationModel;
use Solspace\Freeform\Records\IntegrationRecord;

class ElementsController extends IntegrationsController
{
    protected function getIntegrationModels(): array
    {
        return $this->getElementsService()->getAllIntegrations();
    }

    protected function getServiceProviderTypes(): array
    {
        return $this->getElementsService()->getAllServiceProviders();
    }

    protected function getTitle(): string
    {
        return 'Elements';
    }

    protected function getType(): string
    {
        return 'elements';
    }

    protected function getIntegrationType(): string
    {
        return IntegrationRecord::TYPE_ELEMENTS;
    }

    protected function getNewOrExistingModel(int|string|null $id): IntegrationModel
    {
        if (is_numeric($id)) {
            $model = $this->getElementsService()->getIntegrationById($id);
        } else {
            $model = $this->getElementsService()->getIntegrationByHandle($id);
        }

        if (!$model) {
            $model = IntegrationModel::create(IntegrationRecord::TYPE_ELEMENTS);
        }

        return $model;
    }
}

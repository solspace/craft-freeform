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

class MailingListsController extends IntegrationsController
{
    protected function getNewOrExistingModel(int|string|null $id): IntegrationModel
    {
        if (is_numeric($id)) {
            $model = $this->getMailingListsService()->getIntegrationById($id);
        } else {
            $model = $this->getMailingListsService()->getIntegrationByHandle($id);
        }

        if (!$model) {
            $model = IntegrationModel::create(IntegrationRecord::TYPE_MAILING_LIST);
        }

        return $model;
    }

    protected function getIntegrationModels(): array
    {
        return $this->getMailingListsService()->getAllIntegrations();
    }

    protected function getServiceProviderTypes(): array
    {
        return $this->getMailingListsService()->getAllServiceProviders();
    }

    protected function getTitle(): string
    {
        return 'Mailing Lists';
    }

    protected function getType(): string
    {
        return 'mailing-lists';
    }

    protected function getIntegrationType(): string
    {
        return IntegrationRecord::TYPE_MAILING_LIST;
    }
}

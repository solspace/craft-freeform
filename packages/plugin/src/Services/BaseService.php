<?php

namespace Solspace\Freeform\Services;

use Solspace\Freeform\Freeform;
use Solspace\Freeform\Services\Form\LayoutsService;
use Solspace\Freeform\Services\Integrations\IntegrationsService;
use yii\base\Component;

class BaseService extends Component
{
    protected function getFormsService(): FormsService
    {
        return Freeform::getInstance()->forms;
    }

    protected function getGroupsService(): GroupsService
    {
        return Freeform::getInstance()->groups;
    }

    protected function getFormLayoutsService(): LayoutsService
    {
        return Freeform::getInstance()->formLayouts;
    }

    protected function getSettingsService(): SettingsService
    {
        return Freeform::getInstance()->settings;
    }

    protected function getIntegrationsService(): IntegrationsService
    {
        return Freeform::getInstance()->integrations;
    }
}

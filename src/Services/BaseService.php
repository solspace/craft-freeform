<?php

namespace Solspace\Freeform\Services;

use Solspace\Freeform\Freeform;
use yii\base\Component;

class BaseService extends Component
{
    /**
     * @return FormsService
     */
    protected function getFormsService(): FormsService
    {
        return Freeform::getInstance()->forms;
    }

    /**
     * @return SettingsService
     */
    protected function getSettingsService(): SettingsService
    {
        return Freeform::getInstance()->settings;
    }
}

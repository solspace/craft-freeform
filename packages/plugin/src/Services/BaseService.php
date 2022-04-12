<?php

namespace Solspace\Freeform\Services;

use Solspace\Freeform\Freeform;
use yii\base\Component;

class BaseService extends Component
{
    protected function getFormsService(): FormsService
    {
        return Freeform::getInstance()->forms;
    }

    protected function getSettingsService(): SettingsService
    {
        return Freeform::getInstance()->settings;
    }
}

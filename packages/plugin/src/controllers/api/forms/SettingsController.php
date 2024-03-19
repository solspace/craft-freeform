<?php

namespace Solspace\Freeform\controllers\api\forms;

use Solspace\Freeform\Bundles\Attributes\Form\SettingsProvider;
use Solspace\Freeform\controllers\BaseApiController;

class SettingsController extends BaseApiController
{
    public function __construct(
        $id,
        $module,
        $config,
        private SettingsProvider $settingsProvider,
    ) {
        parent::__construct($id, $module, $config);
    }

    protected function get(): array
    {
        return $this->settingsProvider->getSettingNamespaces();
    }
}

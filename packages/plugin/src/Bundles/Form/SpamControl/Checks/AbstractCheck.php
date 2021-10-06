<?php

namespace Solspace\Freeform\Bundles\Form\SpamControl\Checks;

use Solspace\Freeform\Events\Forms\ValidationEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Services\SettingsService;
use yii\base\Event;

abstract class AbstractCheck extends FeatureBundle
{
    /** @var SettingsService */
    private $settingsService;

    /** @var Settings */
    private $settings;

    public function __construct()
    {
        $this->settingsService = Freeform::getInstance()->settings;
        $this->settings = $this->settingsService->getSettingsModel();

        Event::on(Form::class, Form::EVENT_BEFORE_VALIDATE, [$this, 'handleCheck']);
    }

    abstract public function handleCheck(ValidationEvent $event);

    protected function isDisplayErrors(): bool
    {
        return $this->getSettingsService()->isSpamBehaviourDisplayErrors();
    }

    protected function getSettings(): Settings
    {
        return $this->settings;
    }

    protected function getSettingsService(): SettingsService
    {
        return $this->settingsService;
    }
}

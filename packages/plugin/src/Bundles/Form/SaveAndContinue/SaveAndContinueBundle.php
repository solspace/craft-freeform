<?php

namespace Solspace\Freeform\Bundles\Form\SaveAndContinue;

use Solspace\Freeform\Events\Forms\HandleRequestEvent;
use Solspace\Freeform\Library\Bundles\BundleInterface;
use Solspace\Freeform\Library\Composer\Components\Form;
use yii\base\Event;

class SaveAndContinueBundle implements BundleInterface
{
    const SAVE_BUTTON_NAME = 'freeform_save';

    public function __construct()
    {
        Event::on(Form::class, Form::EVENT_AFTER_HANDLE_REQUEST, [$this, 'handleSave']);
    }

    public function handleSave(HandleRequestEvent $event)
    {
        $isSavingForm = null !== $event->getRequest()->post(self::SAVE_BUTTON_NAME);
        if (!$isSavingForm) {
            return;
        }

        exit('saving form');
    }
}

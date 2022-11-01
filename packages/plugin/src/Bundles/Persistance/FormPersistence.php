<?php

namespace Solspace\Freeform\Bundles\Persistance;

use Solspace\Freeform\controllers\client\api\FormsController;
use Solspace\Freeform\Events\Forms\PersistFormEvent;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Models\FormModel;
use Solspace\Freeform\Services\FormsService;
use yii\base\Event;

class FormPersistence extends FeatureBundle
{
    public function __construct(private FormsService $formsService)
    {
        Event::on(
            FormsController::class,
            FormsController::EVENT_CREATE_FORM,
            [$this, 'handleFormCreate']
        );

        Event::on(
            FormsController::class,
            FormsController::EVENT_UPDATE_FORM,
            [$this, 'handleFormUpdate']
        );
    }

    public function handleFormCreate(PersistFormEvent $event)
    {
        $payload = $event->getPayload();

        $form = new FormModel();

        $this->formsService->save($form);
        if ($form->hasErrors()) {
            $event->addToResponse('form', $form->getErrors());
        }
    }

    public function handleFormUpdate(PersistFormEvent $event)
    {
    }
}

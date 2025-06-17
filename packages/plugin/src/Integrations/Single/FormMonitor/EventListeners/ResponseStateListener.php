<?php

namespace Solspace\Freeform\Integrations\Single\FormMonitor\EventListeners;

use Solspace\Freeform\controllers\api\FormsController;
use Solspace\Freeform\Events\Forms\PersistFormEvent;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Services\FormMonitorService;
use yii\base\Event;

class ResponseStateListener extends FeatureBundle
{
    public function __construct(
        private FormMonitorService $formMonitorService,
    ) {
        Event::on(
            FormsController::class,
            FormsController::EVENT_AFTER_SAVE_FORM,
            [$this, 'handleResponseState']
        );
    }

    public function handleResponseState(PersistFormEvent $event): void
    {
        $form = $event->getForm();
        if (!$form) {
            return;
        }

        $formMonitorState = $this->formMonitorService->getStatus($form);

        $event->setResponseData(['formMonitor' => $formMonitorState]);
        $event->setStatus(200);
    }
}

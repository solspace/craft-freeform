<?php

namespace Solspace\Freeform\Bundles\Form\SuccessBehavior;

use Solspace\Freeform\Events\Forms\SubmitResponseEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Form\Settings\Implementations\BehaviorSettings;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class SuccessBehaviorBundle extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            Form::class,
            Form::EVENT_ON_SUBMIT_RESPONSE,
            [$this, 'handleSuccessBehavior']
        );
    }

    public function handleSuccessBehavior(SubmitResponseEvent $event): void
    {
        $form = $event->getForm();
        $request = \Craft::$app->request;

        $behaviorSettings = $form->getSettings()->getBehavior();

        switch ($behaviorSettings->successBehavior) {
            case BehaviorSettings::SUCCESS_BEHAVIOR_REDIRECT_RETURN_URL:
                $returnUrl = $this->plugin()->forms->getReturnUrl($form);

                $event->getResponse()->redirect($returnUrl);

                break;

            case BehaviorSettings::SUCCESS_BEHAVIOR_LOAD_SUCCESS_TEMPLATE:
            case BehaviorSettings::SUCCESS_BEHAVIOR_RELOAD:
            default:
                $url = $request->getUrl();
                $event->getResponse()->redirect($url);

                break;
        }
    }
}

<?php

namespace Solspace\Freeform\Bundles\Notifications\TwigVariables;

use Solspace\Freeform\Events\Mailer\RenderEmailEvent;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Services\MailerService;
use yii\base\Event;

class FieldVariables extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            MailerService::class,
            MailerService::EVENT_BEFORE_RENDER,
            [$this, 'attachUids'],
        );
    }

    public function attachUids(RenderEmailEvent $event): void
    {
        $form = $event->getForm();

        $variables = [];
        foreach ($form->getLayout()->getFields() as $field) {
            $variables[$field->getUid()] = $field->getReadableOutputValue();
        }

        $fieldUids = $event->getTwigVariable('fieldUids') ?? [];
        $fieldUids = array_merge($fieldUids, $variables);

        $event->setTwigVariable('fieldUids', $fieldUids);
    }
}

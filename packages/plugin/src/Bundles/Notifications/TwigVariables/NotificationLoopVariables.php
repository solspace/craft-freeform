<?php

namespace Solspace\Freeform\Bundles\Notifications\TwigVariables;

use Solspace\Freeform\Events\Mailer\RenderEmailEvent;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Services\MailerService;
use Twig\Markup;
use yii\base\Event;

class NotificationLoopVariables extends FeatureBundle
{
    public function __construct()
    {
        Event::on(MailerService::class, MailerService::EVENT_BEFORE_RENDER, [$this, 'attachFieldValues']);
        Event::on(MailerService::class, MailerService::EVENT_BEFORE_RENDER, [$this, 'attachOnlyFilledFieldValues']);
    }

    public function attachFieldValues(RenderEmailEvent $event): void
    {
        $fields = $event->getForm()->getLayout()->getFields();
        if (!\count($fields)) {
            return;
        }

        $markup = '<ul>';
        foreach ($fields as $field) {
            $markup .= '<li>';
            $markup .= $field->getLabel().': ';
            $markup .= $field->getValueAsString();
            $markup .= '</li>';
        }
        $markup .= '</ul>';

        $loop = $event->getTwigVariable('loop');
        $loop['field']['labels'] = new Markup($markup, 'UTF-8');

        $event->setTwigVariable('loop', $loop);
    }

    public function attachOnlyFilledFieldValues(RenderEmailEvent $event): void
    {
        $fields = $event->getForm()->getLayout()->getFields();
        if (!\count($fields)) {
            return;
        }

        $markup = '<ul>';
        foreach ($fields as $field) {
            if (empty($field->getValue())) {
                continue;
            }

            $markup .= '<li>';
            $markup .= $field->getLabel().': ';
            $markup .= $field->getValueAsString();
            $markup .= '</li>';
        }
        $markup .= '</ul>';

        $loop = $event->getTwigVariable('loop');
        $loop['field']['labelsWithValues'] = new Markup($markup, 'UTF-8');

        $event->setTwigVariable('loop', $loop);
    }
}

<?php

namespace Solspace\Freeform\Bundles\Notifications\TwigVariables;

use Solspace\Freeform\Events\Mailer\RenderEmailEvent;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Services\MailerService;
use yii\base\Event;

class GeneralVariables extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            MailerService::class,
            MailerService::EVENT_BEFORE_RENDER,
            [$this, 'attachGeneralVariables'],
        );
    }

    public function attachGeneralVariables(RenderEmailEvent $event): void
    {
        $variables = [
            'systemName' => \Craft::$app->projectConfig->get('email.fromName'),
            'systemEmail' => \Craft::$app->projectConfig->get('email.fromEmail'),
            'systemReplyToEmail' => \Craft::$app->projectConfig->get('email.replyToEmail'),
            'siteName' => \Craft::$app->getSites()->getCurrentSite()->name,
            'siteHandle' => \Craft::$app->getSites()->getCurrentSite()->handle,
            'dateMDY' => date('m/d/Y'),
            'dateDMY' => date('d/m/Y'),
            'dateLong' => date('F j, Y'),
            'time12' => date('g:i A'),
            'time24' => date('H:i'),
        ];

        $general = $event->getTwigVariable('general') ?? [];
        $general = array_merge($general, $variables);

        $event->setTwigVariable('general', $general);
    }
}

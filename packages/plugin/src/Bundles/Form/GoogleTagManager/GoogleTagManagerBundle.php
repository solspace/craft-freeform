<?php

namespace Solspace\Freeform\Bundles\Form\GoogleTagManager;

use Solspace\Freeform\Events\Forms\AttachFormAttributesEvent;
use Solspace\Freeform\Events\Forms\RenderTagEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;
use yii\web\View;

class GoogleTagManagerBundle extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            Form::class,
            Form::EVENT_ATTACH_TAG_ATTRIBUTES,
            [$this, 'attachAttributes'],
        );

        Event::on(
            Form::class,
            Form::EVENT_RENDER_BEFORE_OPEN_TAG,
            [$this, 'attachScripts'],
        );
    }

    public function attachAttributes(AttachFormAttributesEvent $event): void
    {
        $form = $event->getForm();
        $isAjax = $form->getSettings()->getBehavior()->ajax;
        $gtm = $form->getSettings()->getGeneral()->gtm;

        if (!$gtm->isEnabled() || !$isAjax) {
            return;
        }

        $eventName = trim($gtm->getEvent());
        if (empty($eventName)) {
            $eventName = 'form-submission';
        }

        $form->getAttributes()
            ->set('data-gtm', true)
            ->set('data-gtm-event-name', $eventName)
        ;
    }

    public function attachScripts(RenderTagEvent $event): void
    {
        $form = $event->getForm();
        $isAjax = $form->getSettings()->getBehavior()->ajax;
        $gtm = $form->getSettings()->getGeneral()->gtm;

        $ID = trim($gtm->getId());
        if (empty($ID) || !$gtm->isEnabled() || !$isAjax) {
            return;
        }

        $script = <<<JSSCRIPT
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','{$ID}');
            JSSCRIPT;

        $event->appendJsToOutput($script, [], View::POS_HEAD);

        $noScript = <<<NOSCRIPT
            <noscript><iframe src='https://www.googletagmanager.com/ns.html?id={$ID}'
            height='0' width='0' style='display:none;visibility:hidden'></iframe></noscript>
            NOSCRIPT;

        $event->appendHtmlToOutput($noScript, View::POS_BEGIN);
    }
}

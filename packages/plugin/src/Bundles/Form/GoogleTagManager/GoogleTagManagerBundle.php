<?php

namespace Solspace\Freeform\Bundles\Form\GoogleTagManager;

use Solspace\Freeform\Events\Forms\AttachFormAttributesEvent;
use Solspace\Freeform\Events\Forms\FormRenderEvent;
use Solspace\Freeform\Library\Bundles\BundleInterface;
use Solspace\Freeform\Services\FormsService;
use yii\base\Event;
use yii\web\View;

class GoogleTagManagerBundle implements BundleInterface
{
    public function __construct()
    {
        Event::on(
            FormsService::class,
            FormsService::EVENT_ATTACH_FORM_ATTRIBUTES,
            function (AttachFormAttributesEvent $event) {
                $form = $event->getForm();

                if (!$form->isGtmEnabled() || !$form->isAjaxEnabled()) {
                    return;
                }

                $eventName = trim($form->getGtmEventName());
                if (empty($eventName)) {
                    $eventName = 'form-submission';
                }

                $event->attachAttribute('data-gtm', true);
                $event->attachAttribute('data-gtm-event-name', $eventName);
            }
        );

        Event::on(
            FormsService::class,
            FormsService::EVENT_RENDER_OPENING_TAG,
            function (FormRenderEvent $event) {
                $form = $event->getForm();

                $ID = trim($form->getGtmId());
                if (empty($ID) || !$form->isGtmEnabled() || !$form->isAjaxEnabled()) {
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
        );
    }
}

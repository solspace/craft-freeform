<?php

namespace Solspace\Freeform\Integrations\Singleton\GTM\EventListeners;

use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Events\Forms\RenderTagEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Integrations\Singleton\GTM\GTM;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Helpers\IsolatedTwig;
use yii\base\Event;

class GTMTrigger extends FeatureBundle
{
    public function __construct(
        private FormIntegrationsProvider $integrationsProvider,
    ) {
        Event::on(
            Form::class,
            Form::EVENT_RENDER_AFTER_CLOSING_TAG,
            [$this, 'attachScript']
        );
    }

    public function attachScript(RenderTagEvent $event): void
    {
        $form = $event->getForm();

        $integration = $this->integrationsProvider->getSingleton($form, GTM::class);
        if (!$integration) {
            return;
        }

        $eventName = $integration->getEventName() ?: 'form-submission';

        $twig = new IsolatedTwig();

        $gtmTriggerScript = file_get_contents(__DIR__.'/../Scripts/gtm-trigger.js');
        $gtmTriggerScript = $twig->render($gtmTriggerScript, [
            'form' => $form,
            'eventName' => $eventName,
        ]);

        $event->addChunk("<script>{$gtmTriggerScript}</script>");

        if (!$integration->getContainerId()) {
            return;
        }

        $containerId = $integration->getContainerId();

        $gtmImportScript = file_get_contents(__DIR__.'/../Scripts/gtm-import.js');
        $gtmImportScript = $twig->render($gtmImportScript, [
            'containerId' => $containerId,
        ]);

        $event->addChunk("<!-- Google Tag Manager --><script>{$gtmImportScript}</script><!-- End Google Tag Manager -->");

        $event->addChunk('<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id='.$containerId.'"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->');
    }
}

<?php

namespace Solspace\Freeform\Integrations\Single\GTM\EventListeners;

use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Events\Forms\AttachFormAttributesEvent;
use Solspace\Freeform\Events\Forms\CollectScriptsEvent;
use Solspace\Freeform\Events\Forms\OutputAsJsonEvent;
use Solspace\Freeform\Events\Forms\RenderTagEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Integrations\Single\GTM\GTM;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class GTMTrigger extends FeatureBundle
{
    public function __construct(
        private FormIntegrationsProvider $integrationsProvider,
    ) {
        Event::on(
            Form::class,
            Form::EVENT_ATTACH_TAG_ATTRIBUTES,
            [$this, 'attachGtmAttribute']
        );

        Event::on(
            Form::class,
            Form::EVENT_COLLECT_SCRIPTS,
            [$this, 'collectScripts'],
        );

        Event::on(
            Form::class,
            Form::EVENT_RENDER_AFTER_CLOSING_TAG,
            [$this, 'attachScript']
        );

        Event::on(
            Form::class,
            Form::EVENT_OUTPUT_AS_JSON,
            [$this, 'attachToJson']
        );
    }

    public function attachGtmAttribute(AttachFormAttributesEvent $event): void
    {
        $form = $event->getForm();

        $integration = $this->integrationsProvider->getSingleton($form, GTM::class);
        if (!$integration) {
            return;
        }

        $attributes = $form->getAttributes();

        if ($integration->getContainerId()) {
            $attributes->replace('data-gtm-id', $integration->getContainerId());
        }

        $attributes->replace('data-gtm-event', $integration->getEventName() ?: 'form-submission');
    }

    public function collectScripts(CollectScriptsEvent $event): void
    {
        $event->addScript('gtm', 'js/scripts/front-end/integrations/gtm/gtm.js');
    }

    public function attachScript(RenderTagEvent $event): void
    {
        $form = $event->getForm();

        $integration = $this->integrationsProvider->getSingleton($form, GTM::class);
        if (!$integration) {
            return;
        }

        $containerId = $integration->getContainerId();
        if (!$containerId) {
            return;
        }

        $event->addScript('js/scripts/front-end/integrations/gtm/gtm.js');
        $event->addChunk(
            <<<'GTMSCRIPT'
                <!-- Google Tag Manager (noscript) -->
                <noscript><iframe src="https://www.googletagmanager.com/ns.html?id={{ containerId }}"
                height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
                <!-- End Google Tag Manager (noscript) -->
                GTMSCRIPT,
            ['containerId' => $containerId],
        );
    }

    public function attachToJson(OutputAsJsonEvent $event): void
    {
        $form = $event->getForm();
        $integration = $this->integrationsProvider->getSingleton($form, GTM::class);
        if (!$integration) {
            return;
        }

        $event->add('gtm', [
            'containerId' => $integration->getContainerId(),
            'eventName' => $integration->getEventName(),
        ]);
    }
}

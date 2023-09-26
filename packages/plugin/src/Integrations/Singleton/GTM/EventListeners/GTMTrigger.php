<?php

namespace Solspace\Freeform\Integrations\Singleton\GTM\EventListeners;

use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Events\Forms\RenderTagEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Integrations\Singleton\GTM\GTM;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
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

        $event->addChunk(<<<EOS
            <script>
                var form = document.querySelector('form[data-id="{$form->getAnchor()}"]');
                if (form) {
                  form.addEventListener('freeform-ajax-success', function (event) {
                    var response = event.response;

                    var pushEvent = form.freeform._dispatchEvent(
                      'freeform-gtm-data-layer-push',
                      { payload: {}, response: response }
                    );

                    var payload = {
                      event: '{$eventName}',
                      form: {
                        handle: '{$form->getHandle()}',
                        finished: response.finished,
                        multipage: response.multipage,
                        success: response.success,
                      },
                      submission: {
                        id: response.submissionId,
                        token: response.submissionToken,
                      },
                    };

                    payload = Object.assign(payload, pushEvent.payload);

                    window.dataLayer.push(payload);
                  });
                }
            </script>
            EOS);

        if (!$integration->getContainerId()) {
            return;
        }

        $containerId = $integration->getContainerId();

        $event->addChunk(
            "<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','".$containerId."');</script>
<!-- End Google Tag Manager -->"
        );

        $event->addChunk('<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-5985G6Q"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->');
    }
}

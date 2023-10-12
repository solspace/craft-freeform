<?php

namespace Solspace\Freeform\Integrations\Singleton\JavascriptTest\EventListeners;

use Solspace\Commons\Helpers\CryptoHelper;
use Solspace\Freeform\Bundles\Integrations\Providers\FormIntegrationsProvider;
use Solspace\Freeform\Events\Forms\OutputAsJsonEvent;
use Solspace\Freeform\Events\Forms\PrepareAjaxResponsePayloadEvent;
use Solspace\Freeform\Events\Forms\RenderTagEvent;
use Solspace\Freeform\Events\Forms\ValidationEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Integrations\Singleton\JavascriptTest\JavascriptTest;
use Solspace\Freeform\Library\Attributes\Attributes;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\DataObjects\SpamReason;
use Solspace\Freeform\Library\Helpers\IsolatedTwig;
use Solspace\Freeform\Services\SettingsService;
use yii\base\Event;

class JavascriptTestBundle extends FeatureBundle
{
    public function __construct(
        private FormIntegrationsProvider $integrationsProvider,
    ) {
        Event::on(
            Form::class,
            Form::EVENT_OUTPUT_AS_JSON,
            [$this, 'addJsTestToJson']
        );

        Event::on(
            Form::class,
            Form::EVENT_RENDER_AFTER_OPEN_TAG,
            [$this, 'addJsTestInputToForm']
        );

        Event::on(
            Form::class,
            Form::EVENT_RENDER_AFTER_CLOSING_TAG,
            [$this, 'addJsTestScript']
        );

        Event::on(
            Form::class,
            Form::EVENT_BEFORE_VALIDATE,
            [$this, 'validateJavascript']
        );

        Event::on(
            Form::class,
            Form::EVENT_PREPARE_AJAX_RESPONSE_PAYLOAD,
            [$this, 'attachToAjaxPayload']
        );
    }

    public function addJsTestInputToForm(RenderTagEvent $event): void
    {
        $form = $event->getForm();
        $integration = $this->getIntegration($form);
        if (!$integration) {
            return;
        }

        $event->addChunk($this->getJsTestInput($form));
    }

    public function addJsTestToJson(OutputAsJsonEvent $event): void
    {
        $form = $event->getForm();
        $integration = $this->getIntegration($form);
        if (!$integration) {
            return;
        }

        $event->add('jsTest', ['name' => $integration->getInputName()]);
    }

    public function validateJavascript(ValidationEvent $event): void
    {
        $form = $event->getForm();
        $integration = $this->getIntegration($form);
        if (!$integration) {
            return;
        }

        $jsTestInputName = $integration->getInputName();
        $settings = $this->getSettingsService();

        if ($form->isGraphQLPosted()) {
            return;
        }

        /** @var array $postValues */
        $postValues = \Craft::$app->request->post();

        if (isset($postValues[$jsTestInputName]) && '' === $postValues[$jsTestInputName]) {
            return;
        }

        if ($settings->isSpamBehaviorDisplayErrors()) {
            $errorMessage = $integration->getErrorMessage();
            if (!$errorMessage) {
                $errorMessage = 'Javascript Test is invalid';
            }

            $form->addError(Freeform::t($errorMessage));
        }

        $form->markAsSpam(SpamReason::TYPE_JS_TEST, 'Javascript Test failed');
    }

    public function getJsTestInput(Form $form): string
    {
        $integration = $this->getIntegration($form);
        if (!$integration) {
            return '';
        }

        $name = $integration->getInputName();
        $fieldPrefix = $form->getFieldPrefix();
        $id = $fieldPrefix.$name;

        $attributes = new Attributes([
            'type' => 'text',
            'value' => CryptoHelper::getUniqueToken(20),
            'name' => $name,
            'id' => $id,
            'aria-hidden' => 'true',
            'autocomplete' => 'off',
            'tabindex' => '-1',
        ]);

        return <<<EOS
            <div class="{$id}" style="position: absolute !important; width: 0 !important; height: 0 !important; overflow: hidden !important;" aria-hidden="true" tabindex="-1">
                <label aria-hidden="true" tabindex="-1" for="{$id}">Freeform Check</label>
                <input {$attributes} />
            </div>
            EOS;
    }

    public function addJsTestScript(RenderTagEvent $event): void
    {
        $form = $event->getForm();
        $integration = $this->getIntegration($form);
        if (!$integration) {
            return;
        }

        $name = $integration->getInputName();
        $fieldPrefix = $form->getFieldPrefix();
        $id = $fieldPrefix.$name;

        $twig = new IsolatedTwig();

        $script = file_get_contents(__DIR__.'/../Scripts/js-test.js');
        $script = $twig->render($script, [
            'id' => $form->getAnchor(),
            'name' => $name,
        ]);

        $event->addChunk("<script>{$script}</script>");
    }

    public function attachToAjaxPayload(PrepareAjaxResponsePayloadEvent $event): void
    {
        $form = $event->getForm();
        $integration = $this->getIntegration($form);
        if (!$integration) {
            return;
        }

        $event->add('jsTest', ['name' => $integration->getInputName()]);
    }

    private function getIntegration(Form $form): ?JavascriptTest
    {
        if ($form->isDisabled()->javascriptTest) {
            return null;
        }

        $integration = $this->integrationsProvider->getSingleton($form, JavascriptTest::class);
        if (!$integration || !$integration->isEnabled()) {
            return null;
        }

        return $integration;
    }

    private function getSettingsService(): SettingsService
    {
        return $this->plugin()->settings;
    }
}

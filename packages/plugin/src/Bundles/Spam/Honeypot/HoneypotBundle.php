<?php

namespace Solspace\Freeform\Bundles\Spam\Honeypot;

use Solspace\Freeform\Events\Forms\AttachFormAttributesEvent;
use Solspace\Freeform\Events\Forms\OutputAsJsonEvent;
use Solspace\Freeform\Events\Forms\RenderTagEvent;
use Solspace\Freeform\Events\Forms\ValidationEvent;
use Solspace\Freeform\Events\Honeypot\RenderHoneypotEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\DataObjects\SpamReason;
use Solspace\Freeform\Library\Session\Honeypot;
use Solspace\Freeform\Services\SettingsService;
use yii\base\Event;

class HoneypotBundle extends FeatureBundle
{
    public const EVENT_RENDER_HONEYPOT = 'renderHoneypot';

    private static array $validHoneypots = [];

    public function __construct(private HoneypotProvider $honeypotProvider)
    {
        $bypassCheck = $this->plugin()->settings->getSettingsModel()->bypassSpamCheckOnLoggedInUsers;
        $useId = \Craft::$app->getUser()->id;

        if ($bypassCheck && $useId) {
            return;
        }

        if (!$this->plugin()->settings->isFreeformHoneypotEnabled()) {
            return;
        }

        Event::on(
            Form::class,
            Form::EVENT_OUTPUT_AS_JSON,
            [$this, 'addHoneypotToJson']
        );

        Event::on(
            Form::class,
            Form::EVENT_ATTACH_TAG_ATTRIBUTES,
            [$this, 'attachFormAttributes']
        );

        Event::on(
            Form::class,
            Form::EVENT_RENDER_AFTER_OPEN_TAG,
            [$this, 'addHoneyPotInputToForm']
        );

        Event::on(
            Form::class,
            Form::EVENT_BEFORE_VALIDATE,
            [$this, 'validateFormHoneypot']
        );
    }

    /**
     * Adds honeypot javascript to forms.
     */
    public function attachFormAttributes(AttachFormAttributesEvent $event): void
    {
        $form = $event->getForm();
        $isHoneypotEnabled = $this->isHoneypotEnabled($form);
        $isEnhanced = $this->isEnhanced();

        if ($isHoneypotEnabled && $isEnhanced) {
            $attributes = $form->getAttributes();
            $honeypot = $this->honeypotProvider->getHoneypot($event->getForm());

            $attributes->set('data-honeypot', true);
            $attributes->set('data-honeypot-name', $honeypot->getName());
            $attributes->set('data-honeypot-value', $honeypot->getHash());
        }
    }

    /**
     * Assembles a honeypot field.
     */
    public function addHoneyPotInputToForm(RenderTagEvent $event): void
    {
        if (!$this->isHoneypotEnabled($event->getForm())) {
            return;
        }

        $event->addChunk($this->getHoneypotInput($event->getForm()));
    }

    public function addHoneypotToJson(OutputAsJsonEvent $event): void
    {
        if (!$this->isHoneypotEnabled($event->getForm())) {
            return;
        }

        $honeypot = $this->honeypotProvider->getHoneypot($event->getForm());

        $event->add('honeypot', [
            'name' => $honeypot->getName(),
            'value' => $honeypot->getHash(),
        ]);
    }

    public function validateFormHoneypot(ValidationEvent $event): void
    {
        if (!$this->isHoneypotEnabled($event->getForm())) {
            return;
        }

        $form = $event->getForm();

        /** @var array $postValues */
        $postValues = \Craft::$app->request->post();
        $isEnhanced = $this->isEnhanced();

        $honeypotName = $this->getSettingsService()->getSettingsModel()->customHoneypotName ?: Honeypot::NAME_PREFIX;
        if (!$isEnhanced) {
            if (isset($postValues[$honeypotName]) && '' === $postValues[$honeypotName]) {
                return;
            }
        } else {
            foreach ($postValues as $key => $value) {
                if (str_starts_with($key, $honeypotName)) {
                    if (\in_array($key, self::$validHoneypots, true)) {
                        return;
                    }

                    if ($this->honeypotProvider->isValidHoneypot($form, $key, $value)) {
                        self::$validHoneypots[] = $key;

                        return;
                    }
                }
            }
        }

        if ($this->getSettingsService()->isSpamBehaviourDisplayErrors()) {
            $errorMessage = $this->getSettingsService()->getCustomErrorMessage();
            if (!$errorMessage) {
                $errorMessage = 'Form honeypot is invalid';
            }

            $form->addError(Freeform::t($errorMessage));
        }

        $form->markAsSpam(SpamReason::TYPE_HONEYPOT, 'Honeypot check failed');
    }

    public function getHoneypotJavascriptScript(Form $form): string
    {
        if (!$this->isHoneypotEnabled($form)) {
            return '';
        }

        $honeypot = $this->honeypotProvider->getHoneypot($form);

        return 'var o = document.getElementsByName("'.$honeypot->getName().'"); for (var i in o) { if (!o.hasOwnProperty(i)) {continue;} o[i].value = "'.$honeypot->getHash().'"; }';
    }

    public function getHoneypotInput(Form $form): string
    {
        static $honeypotHashes = [];

        if (!isset($honeypotHashes[$form->getHash()])) {
            $random = time().random_int(0, 999).(time() + 999);
            $honeypotHashes[$form->getHash()] = substr(sha1($random), 0, 6);
        }

        $hash = $honeypotHashes[$form->getHash()];

        $fieldPrefix = $form->getFieldPrefix();

        $honeypot = $this->honeypotProvider->getHoneypot($form);
        $honeypotName = $honeypot->getName();
        $output = '<input '
            .'type="text" '
            .'value="'.($this->isEnhanced() ? $hash : '').'" '
            .'name="'.$honeypotName.'" '
            .'id="'.$fieldPrefix.$honeypotName.'" '
            .'aria-hidden="true" '
            .'autocomplete="off" '
            .'tabindex="-1" '
            .'/>';

        $output = '<div class="'.$fieldPrefix.$honeypotName.'" style="position: absolute !important; width: 0 !important; height: 0 !important; overflow: hidden !important;" aria-hidden="true" tabindex="-1">'
            .'<label aria-hidden="true" tabindex="-1" for="'.$fieldPrefix.$honeypotName.'">Leave this field blank</label>'
            .$output
            .'</div>';

        $event = new RenderHoneypotEvent($output);
        Event::trigger($this, self::EVENT_RENDER_HONEYPOT, $event);

        return $event->getOutput();
    }

    private function isEnhanced(): bool
    {
        return $this->getSettingsService()->isFreeformHoneypotEnhanced();
    }

    private function isHoneypotEnabled(Form $form): bool
    {
        return $this->getSettingsService()->isFreeformHoneypotEnabled($form);
    }

    private function getSettingsService(): SettingsService
    {
        return $this->plugin()->settings;
    }
}

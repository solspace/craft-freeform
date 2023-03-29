<?php

namespace Solspace\Freeform\Services;

use Solspace\Freeform\Events\FormEventInterface;
use Solspace\Freeform\Events\Forms\AttachFormAttributesEvent;
use Solspace\Freeform\Events\Forms\FormRenderEvent;
use Solspace\Freeform\Events\Forms\FormValidateEvent;
use Solspace\Freeform\Events\Forms\OutputAsJsonEvent;
use Solspace\Freeform\Events\Honeypot\RenderHoneypotEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\DataObjects\SpamReason;
use Solspace\Freeform\Library\Session\Honeypot;
use Solspace\Freeform\Models\Settings;

class HoneypotService extends BaseService
{
    public const FORM_HONEYPOT_KEY = 'freeformHoneypotHashList';
    public const HONEYPOT_DISABLE_KEY = 'disableHoneypot';

    public const EVENT_RENDER_HONEYPOT = 'renderHoneypot';

    public const MAX_HONEYPOT_TTL = 10800; // 3 Hours
    public const MAX_HONEYPOT_COUNT = 100;   // Limit the number of maximum honeypot values per session

    /** @var array */
    private static $validHoneypots = [];

    /** @var Honeypot[] */
    private $honeypotCache = [];

    /**
     * Adds honeypot javascript to forms.
     */
    public function addFormAttributes(AttachFormAttributesEvent $event)
    {
        $isHoneypotEnabled = $this->isFreeformHoneypotEnabled($event);
        $isEnhanced = $this->isEnhanced();

        if ($isHoneypotEnabled && $isEnhanced) {
            $honeypot = $this->getHoneypot($event->getForm());

            $event->attachAttribute('data-honeypot', true);
            $event->attachAttribute('data-honeypot-name', $honeypot->getName());
            $event->attachAttribute('data-honeypot-value', $honeypot->getHash());
        }
    }

    /**
     * Assembles a honeypot field.
     */
    public function addHoneyPotInputToForm(FormRenderEvent $event)
    {
        if (!$this->isFreeformHoneypotEnabled($event)) {
            return;
        }

        $event->appendToOutput($this->getHoneypotInput($event->getForm()));
    }

    public function addHoneypotToJson(OutputAsJsonEvent $event)
    {
        if (!$this->isFreeformHoneypotEnabled($event)) {
            return;
        }

        $honeypot = $this->getHoneypot($event->getForm());

        $event->add('honeypot', [
            'name' => $honeypot->getName(),
            'value' => $honeypot->getHash(),
        ]);
    }

    public function validateFormHoneypot(FormValidateEvent $event)
    {
        if (!$this->isFreeformHoneypotEnabled($event)) {
            return;
        }

        $form = $event->getForm();

        /** @var array $postValues */
        $postValues = \Craft::$app->request->post(null);
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

                    $honeypotList = $this->getHoneypotList($form);
                    foreach ($honeypotList as $honeypot) {
                        $hasMatchingName = $key === $honeypot->getName();
                        $hasMatchingHash = $value === $honeypot->getHash();

                        if ($hasMatchingName && $hasMatchingHash) {
                            self::$validHoneypots[] = $key;

                            $this->removeHoneypot($form, $honeypot);

                            return;
                        }
                    }
                }
            }
        }

        if ($this->getSettingsService()->isSpamBehaviourDisplayErrors()) {
            $errorMessage = $this->getSettingsService()->getCustomErrorMessage();
            if (!$errorMessage) {
                $errorMessage = 'Form honeypot is invalid';
            }

            $event->addErrorToForm(Freeform::t($errorMessage));
        }

        $event->getForm()->markAsSpam(SpamReason::TYPE_HONEYPOT, 'Honeypot check failed');
    }

    public function getHoneypotJavascriptScript(Form $form): string
    {
        if (!$this->getSettingsService()->isFreeformHoneypotEnabled($form)) {
            return '';
        }

        $honeypot = $this->getHoneypot($form);

        return 'var o = document.getElementsByName("'.$honeypot->getName().'"); for (var i in o) { if (!o.hasOwnProperty(i)) {continue;} o[i].value = "'.$honeypot->getHash().'"; }';
    }

    public function getHoneypot(Form $form): Honeypot
    {
        $hash = $form->getHash();

        if (!isset($this->honeypotCache[$hash])) {
            $this->honeypotCache[$hash] = $this->getNewHoneypot($form);
        }

        return $this->honeypotCache[$hash];
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

        $honeypot = $this->getHoneypot($form);
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
        $this->trigger(self::EVENT_RENDER_HONEYPOT, $event);

        return $event->getOutput();
    }

    private function getNewHoneypot(Form $form): Honeypot
    {
        $honeypot = new Honeypot($this->isEnhanced());

        if ($this->isEnhanced()) {
            $honeypotList = $this->getHoneypotList($form);
            $honeypotList[] = $honeypot;
            $honeypotList = $this->weedOutOldHoneypots($honeypotList);
            $this->updateHoneypotList($form, $honeypotList);
        }

        return $honeypot;
    }

    /**
     * @return Honeypot[]
     */
    private function getHoneypotList(Form $form): array
    {
        if ($this->isPayload()) {
            $honeypotList = $form->getPropertyBag()->get('honeypotList', []);
        } else {
            $honeypotList = json_decode(
                \Craft::$app->session->get(self::FORM_HONEYPOT_KEY, '[]'),
                true
            );
        }

        if (!empty($honeypotList)) {
            foreach ($honeypotList as $index => $unserialized) {
                if (!$unserialized instanceof Honeypot) {
                    $honeypotList[$index] = Honeypot::createFromUnserializedData($unserialized);
                }
            }
        }

        return $honeypotList;
    }

    private function weedOutOldHoneypots(array $honeypotList): array
    {
        if (!$this->isEnhanced()) {
            return [];
        }

        $cleanList = array_filter(
            $honeypotList,
            function (Honeypot $honeypot) {
                return $honeypot->getTimestamp() > (time() - self::MAX_HONEYPOT_TTL);
            }
        );

        usort(
            $cleanList,
            function (Honeypot $a, Honeypot $b) {
                if ($a->getTimestamp() === $b->getTimestamp()) {
                    return 0;
                }

                return ($a->getTimestamp() < $b->getTimestamp()) ? 1 : -1;
            }
        );

        if (\count($cleanList) > self::MAX_HONEYPOT_COUNT) {
            $cleanList = \array_slice($cleanList, 0, self::MAX_HONEYPOT_COUNT);
        }

        return $cleanList;
    }

    /**
     * Removes a honeypot from the list once it has been validated.
     */
    private function removeHoneypot(Form $form, Honeypot $honeypot)
    {
        $list = $this->getHoneypotList($form);

        foreach ($list as $index => $listHoneypot) {
            if ($listHoneypot->getName() === $honeypot->getName()) {
                unset($list[$index]);

                break;
            }
        }

        $this->updateHoneypotList($form, $list);
    }

    private function updateHoneypotList(Form $form, array $honeypotList)
    {
        if ($this->isPayload()) {
            $form->getPropertyBag()->set('honeypotList', $honeypotList);
        } else {
            \Craft::$app->session->set(
                self::FORM_HONEYPOT_KEY,
                json_encode($honeypotList)
            );
        }
    }

    private function isPayload(): bool
    {
        return Settings::CONTEXT_TYPE_PAYLOAD === $this->getSettingsService()->getSettingsModel()->sessionContext;
    }

    private function isEnhanced(): bool
    {
        return $this->getSettingsService()->isFreeformHoneypotEnhanced();
    }

    private function isFreeformHoneypotEnabled(FormEventInterface $event): bool
    {
        return $this->getSettingsService()->isFreeformHoneypotEnabled($event->getForm());
    }
}

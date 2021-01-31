<?php

namespace Solspace\Freeform\Services;

use Solspace\Freeform\Events\Forms\FormRenderEvent;
use Solspace\Freeform\Events\Forms\FormValidateEvent;
use Solspace\Freeform\Events\Honeypot\RenderHoneypotEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\DataObjects\SpamReason;
use Solspace\Freeform\Library\Session\Honeypot;

class HoneypotService extends BaseService
{
    const FORM_HONEYPOT_KEY = 'freeformHoneypotHashList';

    const EVENT_RENDER_HONEYPOT = 'renderHoneypot';

    const MAX_HONEYPOT_TTL = 10800; // 3 Hours
    const MAX_HONEYPOT_COUNT = 100;   // Limit the number of maximum honeypot values per session

    /** @var array */
    private static $validHoneypots = [];

    /** @var Honeypot[] */
    private $honeypotCache = [];

    /**
     * Adds honeypot javascript to forms.
     */
    public function addFormJavascript(FormRenderEvent $event)
    {
        $isHoneypotEnabled = $this->getSettingsService()->isFreeformHoneypotEnabled();
        $isEnhanced = $this->isEnhanced();

        if ($isHoneypotEnabled && $isEnhanced) {
            $script = $this->getHoneypotJavascriptScript($event->getForm());
            $event->appendJsToOutput($script);
        }
    }

    /**
     * Assembles a honeypot field.
     */
    public function addHoneyPotInputToForm(FormRenderEvent $event)
    {
        $event->appendToOutput($this->getHoneypotInput($event->getForm()));
    }

    public function validateFormHoneypot(FormValidateEvent $event)
    {
        if (!$this->getSettingsService()->isFreeformHoneypotEnabled()) {
            return;
        }

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
                if (0 === strpos($key, $honeypotName)) {
                    if (\in_array($key, self::$validHoneypots, true)) {
                        return;
                    }

                    $honeypotList = $this->getHoneypotList();
                    foreach ($honeypotList as $honeypot) {
                        $hasMatchingName = $key === $honeypot->getName();
                        $hasMatchingHash = $value === $honeypot->getHash();

                        if ($hasMatchingName && $hasMatchingHash) {
                            self::$validHoneypots[] = $key;

                            $this->removeHoneypot($honeypot);

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
        $honeypot = $this->getHoneypot($form);

        return 'var o = document.getElementsByName("'.$honeypot->getName().'"); for (var i in o) { if (!o.hasOwnProperty(i)) {continue;} o[i].value = "'.$honeypot->getHash().'"; }';
    }

    public function getHoneypot(Form $form): Honeypot
    {
        $hash = $form->getHash();

        if (!isset($this->honeypotCache[$hash])) {
            $this->honeypotCache[$hash] = $this->getNewHoneypot();
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

    private function getNewHoneypot(): Honeypot
    {
        $honeypot = new Honeypot($this->isEnhanced());

        if ($this->isEnhanced()) {
            $honeypotList = $this->getHoneypotList();
            $honeypotList[] = $honeypot;
            $honeypotList = $this->weedOutOldHoneypots($honeypotList);
            $this->updateHoneypotList($honeypotList);
        }

        return $honeypot;
    }

    /**
     * @return Honeypot[]
     */
    private function getHoneypotList(): array
    {
        $sessionHoneypotList = \GuzzleHttp\json_decode(
            \Craft::$app->session->get(self::FORM_HONEYPOT_KEY, '[]'),
            true
        );

        if (!empty($sessionHoneypotList)) {
            foreach ($sessionHoneypotList as $index => $unserialized) {
                $sessionHoneypotList[$index] = Honeypot::createFromUnserializedData($unserialized);
            }
        }

        return $sessionHoneypotList;
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
    private function removeHoneypot(Honeypot $honeypot)
    {
        $list = $this->getHoneypotList();

        foreach ($list as $index => $listHoneypot) {
            if ($listHoneypot->getName() === $honeypot->getName()) {
                unset($list[$index]);

                break;
            }
        }

        $this->updateHoneypotList($list);
    }

    private function updateHoneypotList(array $honeypotList)
    {
        \Craft::$app->session->set(
            self::FORM_HONEYPOT_KEY,
            \GuzzleHttp\json_encode($honeypotList)
        );
    }

    private function isEnhanced(): bool
    {
        return $this->getSettingsService()->isFreeformHoneypotEnhanced();
    }
}

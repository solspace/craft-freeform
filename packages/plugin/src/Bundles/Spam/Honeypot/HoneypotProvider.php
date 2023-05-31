<?php

namespace Solspace\Freeform\Bundles\Spam\Honeypot;

use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Session\Honeypot;
use Solspace\Freeform\Models\Settings;

class HoneypotProvider
{
    public const FORM_HONEYPOT_KEY = 'freeformHoneypotHashList';
    public const HONEYPOT_DISABLE_KEY = 'disableHoneypot';

    public const MAX_HONEYPOT_TTL = 10800; // 3 Hours
    public const MAX_HONEYPOT_COUNT = 100;   // Limit the number of maximum honeypot values per session

    /** @var Honeypot[] */
    private array $honeypotCache = [];

    public function getHoneypot(Form $form): Honeypot
    {
        $hash = $form->getHash();

        if (!isset($this->honeypotCache[$hash])) {
            $this->honeypotCache[$hash] = $this->getNewHoneypot($form);
        }

        return $this->honeypotCache[$hash];
    }

    /**
     * Removes a honeypot from the list once it has been validated.
     */
    public function removeHoneypot(Form $form, Honeypot $honeypot): void
    {
        $list = $this->getHoneypotList($form);

        foreach ($list as $index => $listHoneypot) {
            if ($listHoneypot->getName() === $honeypot->getName()) {
                unset($list[$index]);

                break;
            }
        }

        $this->updateHoneypotList($list);
    }

    public function isValidHoneypot(Form $form, string $key, string $value): bool
    {
        $honeypotList = $this->getHoneypotList($form);
        foreach ($honeypotList as $honeypot) {
            $hasMatchingName = $key === $honeypot->getName();
            $hasMatchingHash = $value === $honeypot->getHash();

            if ($hasMatchingName && $hasMatchingHash) {
                return true;
            }
        }

        return false;
    }

    private function getNewHoneypot(Form $form): Honeypot
    {
        $honeypot = new Honeypot($this->isEnhanced());

        if ($this->isEnhanced()) {
            $honeypotList = $this->getHoneypotList($form);
            $honeypotList[] = $honeypot;
            $honeypotList = $this->weedOutOldHoneypots($honeypotList);
            $this->updateHoneypotList($honeypotList);
        }

        return $honeypot;
    }

    private function isEnhanced(): bool
    {
        return Freeform::getInstance()->settings->isFreeformHoneypotEnhanced();
    }

    /**
     * @return Honeypot[]
     */
    private function getHoneypotList(Form $form): array
    {
        if ($this->isPayload()) {
            $honeypotList = $form->getProperties()->get('honeypotList', []);
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

    private function updateHoneypotList(array $honeypotList): void
    {
        \Craft::$app->session->set(self::FORM_HONEYPOT_KEY, json_encode($honeypotList));
    }

    private function isPayload(): bool
    {
        return Settings::CONTEXT_TYPE_PAYLOAD === Freeform::getInstance()->settings->getSettingsModel()->sessionContext;
    }
}

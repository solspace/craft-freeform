<?php

namespace Solspace\Freeform\Bundles\Form\Context\Session\StorageTypes;

use Carbon\Carbon;
use Solspace\Freeform\Bundles\Form\Context\Session\Bag\SessionBag;
use Solspace\Freeform\Library\Composer\Components\Form;

class SessionStorage implements FormContextStorageInterface
{
    public const KEY = 'freeform_session';

    /** @var SessionBag[] */
    private $context;

    private $referenceDate;

    private $maxInstanceCount;

    public function __construct(int $timeToLiveInMinutes, int $maxInstanceCount)
    {
        $this->referenceDate = new Carbon('-'.$timeToLiveInMinutes.' minutes', 'UTC');
        $this->maxInstanceCount = $maxInstanceCount;
        $this->loadContext();
    }

    /**
     * @return null|SessionBag
     */
    public function getBag(string $key, Form $form)
    {
        return $this->context[$key] ?? null;
    }

    public function registerBag(string $key, SessionBag $bag, Form $form): self
    {
        $this->context[$key] = $bag;

        return $this;
    }

    public function persist()
    {
        \Craft::$app->getSession()->set(self::KEY, json_encode($this->context));
    }

    public function removeBag(string $key)
    {
        if (isset($this->context[$key])) {
            unset($this->context[$key]);
        }
    }

    public function cleanup()
    {
        uasort($this->context, static function (SessionBag $a, SessionBag $b) {
            return $b->getLastUpdate()->timestamp <=> $a->getLastUpdate()->timestamp;
        });

        $context = [];
        foreach ($this->context as $key => $bag) {
            if ($bag->getLastUpdate()->lt($this->referenceDate)) {
                continue;
            }

            $context[$key] = $bag;
        }

        $instanceCount = \count($context);
        if ($instanceCount > $this->maxInstanceCount) {
            array_splice($context, $this->maxInstanceCount);
        }

        $this->context = $context;
        $this->persist();
    }

    private function loadContext()
    {
        $storedContext = \Craft::$app->getSession()->get(self::KEY, '{}');
        $storedContext = json_decode($storedContext, true);

        $context = [];
        foreach ($storedContext as $key => $value) {
            try {
                $lastUpdate = Carbon::createFromTimestampUTC($value['utime']);
                $formId = $value['formId'] ?? null;
                $properties = $value['properties'] ?? [];
                $attributes = $value['attributes'] ?? [];
            } catch (\Exception $exception) {
                continue;
            }

            $context[$key] = new SessionBag($formId, $properties, $attributes, $lastUpdate);
        }

        $this->context = $context;
    }
}

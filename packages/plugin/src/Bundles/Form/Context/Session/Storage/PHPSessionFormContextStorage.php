<?php

namespace Solspace\Freeform\Bundles\Form\Context\Session\Storage;

use Carbon\Carbon;
use Solspace\Freeform\Bundles\Form\Context\Session\Bag\SessionBag;

class PHPSessionFormContextStorage implements FormContextStorageInterface
{
    const KEY = 'freeform_session';

    private $context;

    private $maxInstanceCount = 3;

    public function __construct()
    {
        $this->loadContext();
    }

    /**
     * @return null|SessionBag
     */
    public function getBag(string $key)
    {
        return $this->context[$key] ?? null;
    }

    public function registerBag(string $key, SessionBag $bag): self
    {
        $this->context[$key] = $bag;

        return $this;
    }

    public function persist()
    {
        $this->cleanUpSession($this->context);
        \Craft::$app->getSession()->set(self::KEY, json_encode($this->context));
    }

    private function loadContext()
    {
        $storedContext = \Craft::$app->getSession()->get(self::KEY, '{}');
        $storedContext = json_decode($storedContext, true);

        $context = [];
        foreach ($storedContext as $key => $value) {
            try {
                $lastUpdate = new Carbon($value['utime']);
                $bag = $value['bag'] ?? [];
            } catch (\Exception $exception) {
                continue;
            }

            $context[$key] = new SessionBag($bag, $lastUpdate);
        }

        $this->context = $context;
    }

    private function cleanUpSession(array &$context)
    {
        uasort($context, static function (SessionBag $a, SessionBag $b) {
            return $b->getLastUpdate()->timestamp <=> $a->getLastUpdate()->timestamp;
        });

        $instanceCount = \count($context);
        if ($instanceCount > $this->maxInstanceCount) {
            array_splice($context, $this->maxInstanceCount);
        }
    }
}

<?php

namespace Solspace\Freeform\Bundles\Form\Context\Session\StorageTypes;

use Carbon\Carbon;
use Solspace\Freeform\Bundles\Form\Context\Session\Bag\SessionBag;
use Solspace\Freeform\Library\Composer\Components\Form;

class SessionStorage implements FormContextStorageInterface
{
    const KEY = 'freeform_session';

    private $context;

    private $maxInstanceCount = 50;

    public function __construct()
    {
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

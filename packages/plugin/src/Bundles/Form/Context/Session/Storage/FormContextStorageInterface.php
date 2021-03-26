<?php

namespace Solspace\Freeform\Bundles\Form\Context\Session\Storage;

use Solspace\Freeform\Bundles\Form\Context\Session\Bag\SessionBag;

interface FormContextStorageInterface
{
    /**
     * @return null|SessionBag
     */
    public function getBag(string $key);

    public function registerBag(string $key, SessionBag $bag);

    public function persist();
}

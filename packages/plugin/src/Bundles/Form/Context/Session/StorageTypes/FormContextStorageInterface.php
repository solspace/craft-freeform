<?php

namespace Solspace\Freeform\Bundles\Form\Context\Session\StorageTypes;

use Solspace\Freeform\Bundles\Form\Context\Session\Bag\SessionBag;
use Solspace\Freeform\Library\Composer\Components\Form;

interface FormContextStorageInterface
{
    /**
     * @return null|SessionBag
     */
    public function getBag(string $key, Form $form);

    public function registerBag(string $key, SessionBag $bag, Form $form);

    public function persist();

    public function cleanup();

    public function removeBag(string $key);
}

<?php

namespace Solspace\Freeform\Bundles\Form\Context;

use Solspace\Freeform\Bundles\Form\Context\Post\PostContext;
use Solspace\Freeform\Bundles\Form\Context\Session\SessionContext;
use Solspace\Freeform\Library\Bundles\BundleInterface;

class ContextBundle implements BundleInterface
{
    public function __construct()
    {
        new SessionContext();
        new PostContext();
    }
}

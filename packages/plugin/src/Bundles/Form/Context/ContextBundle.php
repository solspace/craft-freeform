<?php

namespace Solspace\Freeform\Bundles\Form\Context;

use Solspace\Freeform\Bundles\Form\Context\Pages\PageContext;
use Solspace\Freeform\Bundles\Form\Context\Rendering\HtmlContext;
use Solspace\Freeform\Bundles\Form\Context\Request\RequestContext;
use Solspace\Freeform\Bundles\Form\Context\Session\SessionContext;
use Solspace\Freeform\Library\Bundles\BundleInterface;

class ContextBundle implements BundleInterface
{
    public function __construct()
    {
        new SessionContext();
        new PageContext();
        new RequestContext();
        new HtmlContext();
    }
}

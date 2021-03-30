<?php

namespace Solspace\Freeform\Bundles\Form\Context\Request;

class RequestContext
{
    public function __construct()
    {
        new GetContext();
        new StorageContext();
        new PostContext();
    }
}

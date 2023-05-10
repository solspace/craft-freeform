<?php

namespace Solspace\Freeform\Bundles\Form\Context\Request;

class RequestContext
{
    public function __construct()
    {
        new DefaultValuesContext();
        new OverrideContext();
        new EditSubmissionContext();
        new GetContext();
        new StorageContext();
        new PostContext();
        new GraphQLContext();
    }
}

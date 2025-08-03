<?php

namespace Solspace\Freeform\Form\Settings\Implementations\ValueGenerators;

use Solspace\Freeform\Attributes\Property\ValueGeneratorInterface;

class SiteNameValueGenerator implements ValueGeneratorInterface
{
    public function generateValue(?object $referenceObject, ?object $context): string
    {
        return \Craft::$app->getSystemName();
    }
}

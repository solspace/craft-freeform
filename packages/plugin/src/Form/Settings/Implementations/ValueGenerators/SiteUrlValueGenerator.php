<?php

namespace Solspace\Freeform\Form\Settings\Implementations\ValueGenerators;

use Solspace\Freeform\Attributes\Property\ValueGeneratorInterface;

class SiteUrlValueGenerator implements ValueGeneratorInterface
{
    public function generateValue(?object $referenceObject, ?object $context): string
    {
        return \Craft::$app->getSites()->getCurrentSite()->getBaseUrl() ?? '';
    }
}

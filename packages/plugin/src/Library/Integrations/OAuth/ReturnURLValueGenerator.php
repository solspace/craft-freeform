<?php

namespace Solspace\Freeform\Library\Integrations\OAuth;

use craft\helpers\UrlHelper;
use Solspace\Freeform\Attributes\Property\Property;
use Solspace\Freeform\Attributes\Property\ValueGeneratorInterface;

class ReturnURLValueGenerator implements ValueGeneratorInterface
{
    public function generateValue(Property $property, string $class, ?object $referenceObject): mixed
    {
        return UrlHelper::cpUrl('freeform/oauth/authorize');
    }
}

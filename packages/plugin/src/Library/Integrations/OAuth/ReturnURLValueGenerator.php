<?php

namespace Solspace\Freeform\Library\Integrations\OAuth;

use craft\helpers\UrlHelper;
use Solspace\Freeform\Attributes\Property\ValueGeneratorInterface;

class ReturnURLValueGenerator implements ValueGeneratorInterface
{
    public function generateValue(?object $referenceObject): string
    {
        return UrlHelper::cpUrl('freeform/oauth/authorize');
    }
}

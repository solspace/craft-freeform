<?php

namespace Solspace\Freeform\Library\Integrations\OAuth;

use craft\helpers\UrlHelper;
use Solspace\Freeform\Attributes\Property\ValueGeneratorInterface;
use Solspace\Freeform\Models\IntegrationModel;

class ReturnURLValueGenerator implements ValueGeneratorInterface
{
    public function generateValue(?object $referenceObject, ?object $context): string
    {
        if ($context instanceof IntegrationModel) {
            if ($context->legacy) {
                return UrlHelper::cpUrl('freeform/oauth/authorize');
            }
        }

        return UrlHelper::siteUrl('freeform/oauth/callback');
    }
}

<?php

namespace Solspace\Freeform\Form\Settings\Implementations\ValueGenerators;

use Solspace\Freeform\Attributes\Property\ValueGeneratorInterface;

class EmailValueGenerator implements ValueGeneratorInterface
{
    public function generateValue(?object $referenceObject): mixed
    {
        $currentUser = \Craft::$app->getUser()->getIdentity();
        if (!$currentUser) {
            return null;
        }

        return $currentUser->email;
    }
}

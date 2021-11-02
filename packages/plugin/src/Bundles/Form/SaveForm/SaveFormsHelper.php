<?php

namespace Solspace\Freeform\Bundles\Form\SaveForm;

use Solspace\Freeform\Library\Composer\Components\Form;

class SaveFormsHelper
{
    const BAG_KEY_LOADED = 'savedSessionLoaded';
    const BAG_KEY_SAVED_SESSION = 'savedSession';
    const BAG_REDIRECT = 'savedFormRedirect';

    const PROPERTY_KEY = 'key';
    const PROPERTY_TOKEN = 'token';
    const PROPERTY_URL = 'url';

    public static function isLoaded(Form $form): bool
    {
        return $form->getPropertyBag()->get(self::BAG_KEY_LOADED, false);
    }

    public static function getTokens(Form $form): array
    {
        $savedSession = $form->getPropertyBag()->get(self::BAG_KEY_SAVED_SESSION);

        $key = $savedSession[self::PROPERTY_KEY] ?? null;
        $token = $savedSession[self::PROPERTY_TOKEN] ?? null;

        return [$key, $token];
    }
}

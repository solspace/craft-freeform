<?php

namespace Solspace\Freeform\Bundles\Form\Context\Session;

use Solspace\Commons\Helpers\CryptoHelper;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\Helpers\HashHelper;

class SessionContext
{
    const KEY_SESSION_TOKEN = 'freeform_form_token';
    const KEY_PAGE = 'freeform_page';
    const KEY_FORM = 'freeform_form';

    public function __construct()
    {
        new Storage();
        new RenderTags();
    }

    public static function getFormHash(Form $form): string
    {
        return HashHelper::hash($form->getId());
    }

    public static function getPageHash(Form $form): string
    {
        $page = $form->getCurrentPage();

        return HashHelper::hash($page->getIndex(), $form->getId());
    }

    public static function getFormSessionToken(Form $form)
    {
        $request = \Craft::$app->request;

        $formHash = self::getFormHash($form);
        $postedFormHash = $request->post(self::KEY_FORM);
        $postedSessionHash = $request->post(self::KEY_SESSION_TOKEN);

        if ($postedFormHash === $formHash) {
            return $postedSessionHash;
        }

        return CryptoHelper::getUniqueToken();
    }
}

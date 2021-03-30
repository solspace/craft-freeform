<?php

namespace Solspace\Freeform\Bundles\Form\Context\Session;

use Solspace\Commons\Helpers\CryptoHelper;
use Solspace\Freeform\Bundles\Form\Context\Session\Bag\SessionBag;
use Solspace\Freeform\Bundles\Form\Context\Session\StorageTypes\FormContextStorageInterface;
use Solspace\Freeform\Bundles\Form\Context\Session\StorageTypes\PHPSessionFormContextStorage;
use Solspace\Freeform\Events\Forms\RenderTagEvent;
use Solspace\Freeform\Events\Forms\SubmitEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\Composer\Components\Page;
use Solspace\Freeform\Library\Helpers\HashHelper;
use yii\base\Event;

class SessionContext
{
    const KEY_SESSION_TOKEN = 'freeform_form_token';
    const KEY_PAGE = 'freeform_page';
    const KEY_FORM = 'freeform_form';

    private static $requestTokenCache = [];

    /** @var FormContextStorageInterface */
    private $storage;

    public function __construct()
    {
        $this->storage = new PHPSessionFormContextStorage();

        Event::on(Form::class, Form::EVENT_RENDER_BEFORE_OPEN_TAG, [$this, 'onFormRender']);
        Event::on(Form::class, Form::EVENT_SUBMIT, [$this, 'retrieveContext']);
        Event::on(Form::class, Form::EVENT_AFTER_SUBMIT, [$this, 'storeContext']);
    }

    public function onFormRender(RenderTagEvent $event)
    {
        $form = $event->getForm();
        list($key) = $this->getTokens($form);

        $bag = $this->storage->getBag($key);
        if (null !== $bag) {
            return;
        }

        $bag = new SessionBag();
        $bag->merge($form->getPropertyBag());

        $this->storage->registerBag($key, $bag);
        $this->storage->persist();
    }

    public function retrieveContext(SubmitEvent $event)
    {
        $form = $event->getForm();
        $bag = $this->getBag($form);
        if (null === $bag) {
            $form->addError(Freeform::t('Form has expired'));

            return;
        }

        $form->getPropertyBag()->merge($bag);

        $isPagePosted = self::isPagePosted($form, $form->getCurrentPage());
        if (!$isPagePosted) {
            return;
        }

        $valueContext = $form->getPropertyBag()->get(Form::PROPERTY_STORED_VALUES, []);
        $submittedValues = $form->getCurrentPage()->getStorableFieldValues();
        foreach ($submittedValues as $key => $value) {
            $valueContext[$key] = $value;
        }

        $form->getPropertyBag()->set(Form::PROPERTY_STORED_VALUES, $valueContext);
    }

    public function storeContext(SubmitEvent $event)
    {
        $form = $event->getForm();
        $propertyBag = $form->getPropertyBag();
        $sessionBag = $this->getBag($form);

        if (null === $sessionBag) {
            $form->addError(Freeform::t('Form has expired'));

            return;
        }

        $sessionBag->merge($propertyBag);

        $this->storage->persist();
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

    public static function isFormPosted(Form $form): bool
    {
        return null !== \Craft::$app->getRequest()->post(self::KEY_FORM);
    }

    public static function isPagePosted(Form $form, Page $page): bool
    {
        if (!self::isFormPosted($form)) {
            return false;
        }

        $postedPageToken = \Craft::$app->getRequest()->post(self::KEY_PAGE);
        $postedPageIndex = HashHelper::decode($postedPageToken, $form->getId());

        return $postedPageIndex === $page->getIndex();
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

        if (!\array_key_exists($formHash, self::$requestTokenCache)) {
            self::$requestTokenCache[$formHash] = CryptoHelper::getUniqueToken();
        }

        return self::$requestTokenCache[$formHash];
    }

    private function getBag(Form $form): SessionBag
    {
        list($key) = $this->getTokens($form);

        return $this->storage->getBag($key);
    }

    private function getTokens(Form $form): array
    {
        $formHash = self::getFormHash($form);
        $sessionToken = self::getFormSessionToken($form);

        $key = $formHash.'-'.$sessionToken;

        return [$key, $formHash, $sessionToken];
    }
}

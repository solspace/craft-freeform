<?php

namespace Solspace\Freeform\Bundles\Form\Context\Session;

use Carbon\Carbon;
use Solspace\Commons\Helpers\CryptoHelper;
use Solspace\Freeform\Bundles\Form\Context\Session\Bag\SessionBag;
use Solspace\Freeform\Bundles\Form\Context\Session\StorageTypes\DatabaseStorage;
use Solspace\Freeform\Bundles\Form\Context\Session\StorageTypes\FormContextStorageInterface;
use Solspace\Freeform\Bundles\Form\Context\Session\StorageTypes\PayloadStorage;
use Solspace\Freeform\Bundles\Form\Context\Session\StorageTypes\SessionStorage;
use Solspace\Freeform\Bundles\Form\SaveForm\Events\SaveFormEvent;
use Solspace\Freeform\Bundles\Form\SaveForm\SaveForm;
use Solspace\Freeform\Events\FormEventInterface;
use Solspace\Freeform\Events\Forms\FormLoadedEvent;
use Solspace\Freeform\Events\Forms\HandleRequestEvent;
use Solspace\Freeform\Events\Forms\RenderTagEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\Composer\Components\Page;
use Solspace\Freeform\Library\Helpers\HashHelper;
use Solspace\Freeform\Library\Helpers\RequestHelper;
use Solspace\Freeform\Models\Settings;
use yii\base\Event;

class SessionContext
{
    const KEY_HASH = 'formHash';

    private static $requestTokenCache = [];

    /** @var FormContextStorageInterface */
    private $storage;

    public function __construct()
    {
        $context = Freeform::getInstance()->settings->getSettingsModel()->sessionContext;
        $ttl = Freeform::getInstance()->settings->getSettingsModel()->getSessionContextTimeToLiveMinutes();
        $count = Freeform::getInstance()->settings->getSettingsModel()->getSessionContextCount();
        $secret = Freeform::getInstance()->settings->getSettingsModel()->getSessionContextSecret();

        switch ($context) {
            case Settings::CONTEXT_TYPE_DATABASE:
                $this->storage = new DatabaseStorage($ttl, $count);

                break;

            case Settings::CONTEXT_TYPE_SESSION:
                if (\Craft::$app->request->isConsoleRequest) {
                    $this->storage = new PayloadStorage($secret);
                } else {
                    $this->storage = new SessionStorage($ttl, $count);
                }

                break;

            case Settings::CONTEXT_TYPE_PAYLOAD:
            default:
                $this->storage = new PayloadStorage($secret);

                break;
        }

        Event::on(Form::class, Form::EVENT_FORM_LOADED, [$this, 'registerFormHash']);
        Event::on(Form::class, Form::EVENT_REGISTER_CONTEXT, [$this, 'registerFormContext']);
        Event::on(Form::class, Form::EVENT_BEFORE_HANDLE_REQUEST, [$this, 'retrieveContext']);
        Event::on(Form::class, Form::EVENT_PERSIST_STATE, [$this, 'storeContext']);
        Event::on(SaveForm::class, SaveForm::EVENT_SAVE_FORM, [$this, 'cleanupOnSave']);

        Event::on(
            Form::class,
            Form::EVENT_RENDER_AFTER_OPEN_TAG,
            [$this, 'addHiddenInputs']
        );
    }

    public function addHiddenInputs(RenderTagEvent $event)
    {
        $form = $event->getForm();

        $formHash = self::getFormHash($form);
        $pageHash = self::getPageHash($form);
        $sessionToken = self::getFormSessionToken($form);

        $hash = "{$formHash}-{$pageHash}-{$sessionToken}";

        $event->addChunk(
            sprintf(
                '<input type="hidden" name="%s" value="%s" />',
                self::KEY_HASH,
                $hash
            )
        );
    }

    public function cleanupOnSave(SaveFormEvent $event)
    {
        $event->getForm()->getPropertyBag()->remove(Form::HASH_KEY);
    }

    public function registerFormHash(FormLoadedEvent $event)
    {
        $form = $event->getForm();
        $bag = $form->getPropertyBag();

        $formHash = self::getFormHash($form);
        $pageHash = self::getPageHash($form);
        $sessionToken = self::getFormSessionToken($form);

        $hash = "{$formHash}-{$pageHash}-{$sessionToken}";

        $bag->set(Form::HASH_KEY, $hash);
    }

    public function registerFormContext(FormEventInterface $event)
    {
        $form = $event->getForm();
        list($key) = self::getTokens($form);

        $bag = $this->storage->getBag($key, $form);
        if (null !== $bag) {
            return;
        }

        $bag = new SessionBag($form->getId());
        $bag->setProperties($form->getPropertyBag()->toArray());
        $bag->setAttributes($form->getAttributeBag()->toArray());

        $this->storage->registerBag($key, $bag, $form);
        $this->storage->persist();
    }

    public function retrieveContext(HandleRequestEvent $event)
    {
        $form = $event->getForm();
        $bag = $this->getBag($form);
        if (null === $bag) {
            $form->addError(Freeform::t('Form has expired'));

            return;
        }

        $form->getPropertyBag()->merge($bag->getProperties());
        $form->getAttributeBag()->merge($bag->getAttributes());
        $form->setFormPosted(self::isFormPosted($form));
        $form->setPagePosted(self::isPagePosted($form, $form->getCurrentPage()));
    }

    public function storeContext(FormEventInterface $event)
    {
        $form = $event->getForm();

        $sessionBag = $this->getBag($form);
        if (null === $sessionBag) {
            return;
        }

        $sessionBag->setProperties($form->getPropertyBag()->toArray());
        $sessionBag->setAttributes($form->getAttributeBag()->toArray());
        $sessionBag->setLastUpdate(new Carbon('now', 'UTC'));

        $this->storage->persist();
    }

    public static function getFormHash(Form $form): string
    {
        return HashHelper::hash($form->getId(), \Craft::$app->getConfig()->getGeneral()->securityKey);
    }

    public static function getPageHash(Form $form): string
    {
        $page = $form->getCurrentPage();

        return HashHelper::hash($page->getIndex(), $form->getId());
    }

    public static function isFormPosted(Form $form): bool
    {
        return $form->getId() === self::getPostedFormId();
    }

    public static function getPostedFormId()
    {
        list($formHash) = self::getPostedHashParts();
        if (null === $formHash) {
            return null;
        }

        return HashHelper::decode($formHash, \Craft::$app->getConfig()->getGeneral()->securityKey);
    }

    public static function isPagePosted(Form $form, Page $page): bool
    {
        if (!self::isFormPosted($form)) {
            return false;
        }

        list($_, $postedPageToken) = self::getPostedHashParts();
        $postedPageIndex = HashHelper::decode($postedPageToken, $form->getId());

        return $postedPageIndex === $page->getIndex();
    }

    public static function getFormSessionToken(Form $form)
    {
        $formHash = self::getFormHash($form);

        list($postedFormHash, $_, $postedSessionHash) = self::getPostedHashParts();
        if ($postedFormHash === $formHash) {
            return $postedSessionHash;
        }

        if (!\array_key_exists($formHash, self::$requestTokenCache)) {
            self::$requestTokenCache[$formHash] = CryptoHelper::getUniqueToken();
        }

        return self::$requestTokenCache[$formHash];
    }

    public static function getTokens(Form $form): array
    {
        $formHash = self::getFormHash($form);
        $sessionToken = self::getFormSessionToken($form);

        $key = $formHash.'-'.$sessionToken;

        return [$key, $formHash, $sessionToken];
    }

    private static function getPostedHashParts(): array
    {
        $request = \Craft::$app->getRequest();
        if ($request->isConsoleRequest) {
            return [null, null, null];
        }

        $hash = RequestHelper::post(self::KEY_HASH);

        try {
            list($formHash, $pageHash, $sessionToken) = explode('-', $hash);
        } catch (\Exception $exception) {
            return [null, null, null];
        }

        return [$formHash, $pageHash, $sessionToken];
    }

    /**
     * @return null|SessionBag
     */
    private function getBag(Form $form)
    {
        list($key) = self::getTokens($form);

        return $this->storage->getBag($key, $form);
    }
}

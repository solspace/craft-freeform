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
use Solspace\Freeform\Events\Forms\HandleRequestEvent;
use Solspace\Freeform\Events\Forms\RenderTagEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Form\Layout\Page;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\HashHelper;
use Solspace\Freeform\Library\Helpers\RequestHelper;
use Solspace\Freeform\Models\Settings;
use yii\base\Event;

class SessionContext
{
    public const KEY_HASH = 'formHash';

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
        Event::on(Form::class, Form::EVENT_REGISTER_CONTEXT, [$this, 'registerFormHash']);
        Event::on(Form::class, Form::EVENT_REGISTER_CONTEXT, [$this, 'registerFormContext']);
        Event::on(Form::class, Form::EVENT_BEFORE_HANDLE_REQUEST, [$this, 'cleanupStorage']);
        Event::on(Form::class, Form::EVENT_BEFORE_HANDLE_REQUEST, [$this, 'retrieveContext']);
        Event::on(Form::class, Form::EVENT_PERSIST_STATE, [$this, 'storeContext']);
        Event::on(Form::class, Form::EVENT_AFTER_SUBMIT, [$this, 'cleanupAfterSubmit']);
        Event::on(SaveForm::class, SaveForm::EVENT_SAVE_FORM, [$this, 'cleanupOnSaveForm']);

        Event::on(
            Form::class,
            Form::EVENT_RENDER_AFTER_OPEN_TAG,
            [$this, 'addHiddenInputs']
        );
    }

    public function addHiddenInputs(RenderTagEvent $event)
    {
        $form = $event->getForm();

        $value = $form->getPropertyBag()->get(Form::HASH_KEY);
        $value = htmlspecialchars($value);

        $event->addChunk(
            sprintf(
                '<input type="hidden" name="%s" value="%s" />',
                self::KEY_HASH,
                $value
            )
        );
    }

    public function cleanupAfterSubmit(FormEventInterface $event)
    {
        $form = $event->getForm();

        $request = \Craft::$app->getRequest();
        if ($request->isAjax || $request->isConsoleRequest) {
            return;
        }

        $key = self::getBagKey($form);
        if (null === $key) {
            return;
        }

        $this->storage->removeBag($key);
    }

    public function cleanupOnSaveForm(SaveFormEvent $event)
    {
        $event->getForm()->getPropertyBag()->remove(Form::HASH_KEY);
    }

    public function cleanupStorage()
    {
        $this->storage->cleanup();
    }

    public function registerFormHash(FormEventInterface $event)
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

        $key = self::getBagKey($form);
        if (null === $key) {
            return;
        }

        $bag = $this->storage->getBag($key, $form);
        if (null !== $bag) {
            return;
        }

        $bag = new SessionBag($form->getId());
        $bag->setProperties($form->getPropertyBag()->toArray());
        $bag->setAttributes($form->getAttributeBag()->toArray());

        $this->storage->registerBag($key, $bag, $form);
        $this->storage->persist();
        $this->storage->cleanup();
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
        if (null !== $sessionBag) {
            $sessionBag->setProperties($form->getPropertyBag()->toArray());
            $sessionBag->setAttributes($form->getAttributeBag()->toArray());
            $sessionBag->setLastUpdate(new Carbon('now', 'UTC'));
        }

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
        [$formHash] = self::getPostedHashParts();
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

        [$_, $postedPageToken] = self::getPostedHashParts();
        $postedPageIndex = HashHelper::decode($postedPageToken, $form->getId());

        return $postedPageIndex === $page->getIndex();
    }

    public static function getFormSessionToken(Form $form): string
    {
        $formHash = self::getFormHash($form);

        [$postedFormHash, $_, $postedSessionHash] = self::getPostedHashParts();
        if ($postedFormHash === $formHash) {
            return $postedSessionHash;
        }

        return CryptoHelper::getUniqueToken();
    }

    private static function getBagKey(Form $form)
    {
        $hash = $form->getPropertyBag()->get(Form::HASH_KEY);

        $parts = explode('-', $hash);
        if (3 !== \count($parts)) {
            return null;
        }

        [$formHash, $_, $sessionToken] = $parts;

        return $formHash.'-'.$sessionToken;
    }

    private static function getPostedHashParts(): array
    {
        $request = \Craft::$app->getRequest();
        if ($request->isConsoleRequest) {
            return [null, null, null];
        }

        $hash = RequestHelper::post(self::KEY_HASH);
        $hash = htmlspecialchars($hash);

        $parts = explode('-', $hash);
        if (3 === \count($parts)) {
            [$formHash, $pageHash, $sessionToken] = $parts;

            return [$formHash, $pageHash, $sessionToken];
        }

        return [null, null, null];
    }

    /**
     * @return null|SessionBag
     */
    private function getBag(Form $form)
    {
        $key = self::getBagKey($form);
        if (null === $key) {
            return null;
        }

        return $this->storage->getBag($key, $form);
    }
}

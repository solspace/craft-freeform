<?php

namespace Solspace\Freeform\Bundles\Form\Context\Session;

use Carbon\Carbon;
use Solspace\Freeform\Bundles\Form\Context\Session\Bag\SessionBag;
use Solspace\Freeform\Bundles\Form\Context\Session\StorageTypes\PayloadStorage;
use Solspace\Freeform\Bundles\Form\SaveForm\Events\SaveFormEvent;
use Solspace\Freeform\Bundles\Form\SaveForm\SaveForm;
use Solspace\Freeform\Events\FormEventInterface;
use Solspace\Freeform\Events\Forms\ContextRetrievalEvent;
use Solspace\Freeform\Events\Forms\HandleRequestEvent;
use Solspace\Freeform\Events\Forms\OutputAsJsonEvent;
use Solspace\Freeform\Events\Forms\RenderTagEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\CryptoHelper;
use Solspace\Freeform\Library\Helpers\HashHelper;
use Solspace\Freeform\Library\Helpers\RequestHelper;
use yii\base\Event;

class SessionContext
{
    public const KEY_HASH = 'formHash';
    public const KEY_UNIQUE_ID = 'freeform-unique-id';
    public const KEY_SITE_HANDLE = 'freeform-site-handle';
    public const KEY_FIELD_ID_PREFIX = 'freeform-id-prefix';

    private PayloadStorage $storage;

    public function __construct()
    {
        $settingsModel = Freeform::getInstance()->settings->getSettingsModel();

        $this->storage = new PayloadStorage($settingsModel->getSessionContextSecret());

        Event::on(Form::class, Form::EVENT_FORM_LOADED, [$this, 'registerFormHash']);
        Event::on(Form::class, Form::EVENT_REGISTER_CONTEXT, [$this, 'registerFormHash']);
        Event::on(Form::class, Form::EVENT_BEFORE_HANDLE_REQUEST, [$this, 'retrieveContext']);
        Event::on(Form::class, Form::EVENT_PERSIST_STATE, [$this, 'storeContext']);
        Event::on(SaveForm::class, SaveForm::EVENT_SAVE_FORM, [$this, 'cleanupOnSaveForm']);

        Event::on(
            Form::class,
            Form::EVENT_RENDER_AFTER_OPEN_TAG,
            [$this, 'addHiddenInputs']
        );

        Event::on(
            Form::class,
            Form::EVENT_OUTPUT_AS_JSON,
            [$this, 'addJsonValues']
        );
    }

    public function addHiddenInputs(RenderTagEvent $event): void
    {
        $form = $event->getForm();
        if ($form->isPreview()) {
            return;
        }

        $value = $form->getProperties()->get(Form::HASH_KEY);

        $event->addChunk(
            \sprintf(
                '<input type="hidden" name="%s" value="%s" />',
                self::KEY_HASH,
                $value
            )
        );

        if (null === $form->getProperties()->get('fieldIdPrefix')) {
            $event->addChunk('<input type="hidden" name="'.self::KEY_FIELD_ID_PREFIX.'" value="'.htmlspecialchars($form->getFieldPrefix(), \ENT_QUOTES, 'UTF-8').'" />');
        }

        $siteHandle = $form->getSiteHandle();
        if ($siteHandle) {
            $event->addChunk(
                \sprintf(
                    '<input type="hidden" name="%s" value="%s" />',
                    self::KEY_SITE_HANDLE,
                    htmlentities($siteHandle, \ENT_QUOTES | \ENT_SUBSTITUTE | \ENT_HTML401)
                )
            );
        }
    }

    public function addJsonValues(OutputAsJsonEvent $event): void
    {
        $siteHandle = $event->getForm()->getSiteHandle();
        if (!$siteHandle) {
            return;
        }

        $event->add(self::KEY_SITE_HANDLE, $siteHandle);
    }

    public function cleanupOnSaveForm(SaveFormEvent $event): void
    {
        $event->getForm()->getProperties()->remove(Form::HASH_KEY);
    }

    public function registerFormHash(FormEventInterface $event): void
    {
        $form = $event->getForm();
        $bag = $form->getProperties();

        $formHash = self::getFormHash($form);
        $pageHash = self::getPageHash($form);
        $sessionToken = self::getFormSessionToken($form);

        $hash = "{$formHash}-{$pageHash}-{$sessionToken}";

        $bag->set(Form::HASH_KEY, $hash);
    }

    public function retrieveContext(HandleRequestEvent $event): void
    {
        $form = $event->getForm();

        if ($form->isGraphQLPosted() || $form->isHeadlessPosted()) {
            return;
        }

        $bag = $this->getBag($form);
        if (null === $bag) {
            $form->addError(Freeform::t('Form has expired'));

            return;
        }

        $form->getProperties()->merge($bag->getProperties());
        $form->getAttributes()->merge($bag->getAttributes());
        // Cached HTML may be mounted twice. The client only rebases generated
        // IDs; carry that placement's namespace into subsequent responses.
        $prefix = RequestHelper::post(self::KEY_FIELD_ID_PREFIX);
        if (null === $form->getProperties()->get('fieldIdPrefix') && \is_string($prefix) && preg_match('/^freeform-[a-zA-Z0-9_-]+-[a-f0-9]{12}-$/D', $prefix) && \strlen($prefix) <= 200) {
            $form->getProperties()->set(Form::PROPERTY_FIELD_ID_PREFIX, $prefix);
        }

        $form->setFormPosted(self::isFormPosted($form));
        $form->setPagePosted(self::isPagePosted($form, $form->getCurrentPageIndex()));

        Event::trigger(
            Form::class,
            Form::EVENT_CONTEXT_RETRIEVAL,
            new ContextRetrievalEvent($form, $bag)
        );
    }

    public function storeContext(FormEventInterface $event): void
    {
        $form = $event->getForm();

        $sessionBag = $this->getBag($form);
        if (null !== $sessionBag) {
            $sessionBag->setProperties($form->getProperties()->toArray());
            $sessionBag->setAttributes($form->getAttributes()->toArray());
            $sessionBag->setLastUpdate(new Carbon('now', 'UTC'));
        }
    }

    public static function getFormHash(Form $form): string
    {
        return HashHelper::hash($form->getId(), \Craft::$app->getConfig()->getGeneral()->securityKey);
    }

    public static function getPageHash(Form $form): string
    {
        return HashHelper::hash($form->getCurrentPageIndex(), $form->getId());
    }

    public static function isFormPosted(Form $form): bool
    {
        return $form->getId() === self::getPostedFormId();
    }

    public static function getPostedFormId(): ?int
    {
        [$formHash] = self::getPostedHashParts();
        if (null === $formHash) {
            return null;
        }

        return HashHelper::decode($formHash, \Craft::$app->getConfig()->getGeneral()->securityKey);
    }

    public static function getPostedFormUniqueId(): ?string
    {
        $request = \Craft::$app->getRequest();
        if ($request->isConsoleRequest) {
            return null;
        }

        return $request->post(self::KEY_UNIQUE_ID);
    }

    public static function getPostedSiteHandle(): ?string
    {
        $request = \Craft::$app->getRequest();
        if ($request->isConsoleRequest) {
            return null;
        }

        $siteHandle = $request->post(self::KEY_SITE_HANDLE);
        if (!\is_string($siteHandle)) {
            return null;
        }

        $siteHandle = trim($siteHandle);

        return '' !== $siteHandle ? $siteHandle : null;
    }

    public static function isPagePosted(Form $form, int $pageIndex): bool
    {
        if (!self::isFormPosted($form)) {
            return false;
        }

        [$_, $postedPageToken] = self::getPostedHashParts();
        $postedPageIndex = HashHelper::decode($postedPageToken, $form->getId());

        return $postedPageIndex === $pageIndex;
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

    private static function getBagKey(Form $form): ?string
    {
        $hash = $form->getProperties()->get(Form::HASH_KEY);

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

        $hash = RequestHelper::post(self::KEY_HASH, '');
        $hash = htmlspecialchars($hash, \ENT_QUOTES | \ENT_SUBSTITUTE | \ENT_HTML401);

        $parts = explode('-', $hash);
        if (3 === \count($parts)) {
            [$formHash, $pageHash, $sessionToken] = $parts;

            if (preg_match('/^[a-zA-Z0-9]+$/', $formHash.$pageHash.$sessionToken)) {
                return [$formHash, $pageHash, $sessionToken];
            }
        }

        return [null, null, null];
    }

    private function getBag(Form $form): ?SessionBag
    {
        $key = self::getBagKey($form);
        if (null === $key) {
            return null;
        }

        return $this->storage->getBag($form);
    }
}

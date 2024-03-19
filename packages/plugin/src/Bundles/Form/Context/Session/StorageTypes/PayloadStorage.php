<?php

namespace Solspace\Freeform\Bundles\Form\Context\Session\StorageTypes;

use Carbon\Carbon;
use Solspace\Freeform\Bundles\Form\Context\Session\Bag\SessionBag;
use Solspace\Freeform\Events\Forms\GetCustomPropertyEvent;
use Solspace\Freeform\Events\Forms\HandleRequestEvent;
use Solspace\Freeform\Events\Forms\OutputAsJsonEvent;
use Solspace\Freeform\Events\Forms\PrepareAjaxResponsePayloadEvent;
use Solspace\Freeform\Events\Forms\RenderTagEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Helpers\RequestHelper;
use yii\base\Event;

class PayloadStorage implements FormContextStorageInterface
{
    public const INPUT_PREFIX = 'freeform_payload';
    public const PROPERTY_KEY = 'payload';

    private static array $encryptedPayloadCache = [];
    private static array $decryptedPayloadCache = [];

    private ?string $secret;

    public function __construct(?string $secret = null)
    {
        $this->secret = $secret;

        Event::on(Form::class, Form::EVENT_GET_CUSTOM_PROPERTY, [$this, 'attachProperty']);
        Event::on(Form::class, Form::EVENT_RENDER_BEFORE_CLOSING_TAG, [$this, 'attachInput']);
        Event::on(Form::class, Form::EVENT_OUTPUT_AS_JSON, [$this, 'attachJson']);
        Event::on(Form::class, Form::EVENT_PREPARE_AJAX_RESPONSE_PAYLOAD, [$this, 'attachToAjaxResponse']);
        Event::on(Form::class, Form::EVENT_BEFORE_HANDLE_REQUEST, [$this, 'requirePayload']);
    }

    public function attachProperty(GetCustomPropertyEvent $event): void
    {
        if (self::PROPERTY_KEY !== $event->getKey()) {
            return;
        }

        $event->setValue($this->getEncryptedBag($event->getForm()));
    }

    public function requirePayload(HandleRequestEvent $event): void
    {
        $form = $event->getForm();

        if ($form->isGraphQLPosted()) {
            return;
        }

        if ($event->getRequest()->isConsoleRequest) {
            return;
        }

        $payload = $this->getPostedPayload();
        $bag = $this->getDecryptedBag($form, $payload);

        if (!$bag) {
            $form->addError('Payload missing');
            $event->isValid = false;
        }
    }

    public function attachInput(RenderTagEvent $event): void
    {
        $form = $event->getForm();
        $payload = $this->getEncryptedBag($form);

        $name = self::INPUT_PREFIX;

        $event->addChunk('<input type="hidden" name="'.$name.'" value="'.$payload.'" />');
    }

    public function attachJson(OutputAsJsonEvent $event): void
    {
        $form = $event->getForm();
        $payload = $this->getEncryptedBag($form);

        $name = self::INPUT_PREFIX;

        $event->add($name, $payload);
    }

    public function attachToAjaxResponse(PrepareAjaxResponsePayloadEvent $event): void
    {
        $form = $event->getForm();
        $payload = $this->getEncryptedBag($form);

        $name = self::INPUT_PREFIX;

        $event->add($name, $payload);
    }

    public function getBag(string $key, Form $form): ?SessionBag
    {
        $payload = $this->getPostedPayload();

        return $this->getDecryptedBag($form, $payload);
    }

    public function registerBag(string $key, SessionBag $bag, Form $form)
    {
        // isn't required
    }

    public function persist()
    {
        // isn't required
    }

    public function removeBag(string $key)
    {
        // isn't required
    }

    public function cleanup()
    {
        // isn't required
    }

    private function getPostedPayload(): ?string
    {
        $payload = RequestHelper::post(self::INPUT_PREFIX);

        return $payload ? htmlspecialchars($payload) : null;
    }

    private function getDecryptedBag(Form $form, ?string $payload = null)
    {
        if (null === $payload) {
            return null;
        }

        $cacheKey = md5($payload);
        if (!\array_key_exists($cacheKey, self::$decryptedPayloadCache)) {
            $key = $this->getKey($form);
            $json = \Craft::$app->security->decryptByKey(base64_decode($payload), $key);
            $json = json_decode($json, true);

            if (null === $json) {
                return null;
            }

            $lastUpdate = Carbon::createFromTimestampUTC($json['utime']);
            $properties = $json['properties'];
            $attributes = $json['attributes'];

            $bag = new SessionBag($form->getId(), $properties, $attributes, $lastUpdate);

            self::$decryptedPayloadCache[$cacheKey] = $bag;
        }

        return self::$decryptedPayloadCache[$cacheKey];
    }

    private function getEncryptedBag(Form $form): string
    {
        $cacheKey = $form->getHash();
        if (!\array_key_exists($cacheKey, self::$encryptedPayloadCache)) {
            $key = $this->getKey($form);

            $payload = json_encode([
                'utime' => (new Carbon('now', 'UTC'))->timestamp,
                'properties' => $form->getProperties(),
                'attributes' => $form->getAttributes(),
            ]);

            $encryptedPayload = base64_encode(\Craft::$app->security->encryptByKey($payload, $key));

            self::$encryptedPayloadCache[$cacheKey] = $encryptedPayload;
        }

        return self::$encryptedPayloadCache[$cacheKey];
    }

    private function getKey(Form $form)
    {
        $key = $this->secret ?: \Craft::$app->getConfig()->getGeneral()->securityKey;
        $key .= $form->getUid();

        return $key;
    }
}

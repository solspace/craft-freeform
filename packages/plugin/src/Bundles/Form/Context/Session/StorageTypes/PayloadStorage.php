<?php

namespace Solspace\Freeform\Bundles\Form\Context\Session\StorageTypes;

use Carbon\Carbon;
use Solspace\Freeform\Bundles\Form\Context\Session\Bag\SessionBag;
use Solspace\Freeform\Events\Forms\HandleRequestEvent;
use Solspace\Freeform\Events\Forms\OutputAsJsonEvent;
use Solspace\Freeform\Events\Forms\RenderTagEvent;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\Helpers\RequestHelper;
use yii\base\Event;

class PayloadStorage implements FormContextStorageInterface
{
    const INPUT_PREFIX = 'freeform_payload';

    private $secret;

    public function __construct(string $secret = null)
    {
        $this->secret = $secret;

        Event::on(Form::class, Form::EVENT_RENDER_AFTER_OPEN_TAG, [$this, 'attachInput']);
        Event::on(Form::class, Form::EVENT_OUTPUT_AS_JSON, [$this, 'attachJson']);
        Event::on(Form::class, Form::EVENT_BEFORE_HANDLE_REQUEST, [$this, 'requirePayload']);
    }

    public function requirePayload(HandleRequestEvent $event)
    {
        $form = $event->getForm();

        if ($event->getRequest()->isConsoleRequest) {
            return;
        }

        $payload = $event->getRequest()->post(self::INPUT_PREFIX);
        $bag = $this->getDecryptedBag($form, $payload);

        if (!$bag) {
            $form->addError('Payload missing');
            $event->isValid = false;
        }
    }

    public function attachInput(RenderTagEvent $event)
    {
        $form = $event->getForm();
        $payload = $this->getEncryptedBag($form);

        $name = self::INPUT_PREFIX;

        $event->addChunk('<input type="hidden" name="'.$name.'" value="'.$payload.'" />');
    }

    public function attachJson(OutputAsJsonEvent $event)
    {
        $form = $event->getForm();
        $payload = $this->getEncryptedBag($form);

        $name = self::INPUT_PREFIX;

        $event->add($name, $payload);
    }

    public function getBag(string $key, Form $form)
    {
        $payload = RequestHelper::post(self::INPUT_PREFIX);

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

    private function getDecryptedBag(Form $form, string $payload = null)
    {
        if (null === $payload) {
            return null;
        }

        $key = $this->getKey($form);
        $json = \Craft::$app->security->decryptByKey(base64_decode($payload), $key);
        $json = json_decode($json, true);

        if (null === $json) {
            return null;
        }

        $lastUpdate = Carbon::createFromTimestampUTC($json['utime']);
        $properties = $json['properties'];
        $attributes = $json['attributes'];

        return new SessionBag($form->getId(), $properties, $attributes, $lastUpdate);
    }

    private function getEncryptedBag(Form $form): string
    {
        $key = $this->getKey($form);

        $payload = json_encode([
            'utime' => (new Carbon('now', 'UTC'))->timestamp,
            'properties' => $form->getPropertyBag(),
            'attributes' => $form->getAttributeBag(),
        ]);

        return base64_encode(\Craft::$app->security->encryptByKey($payload, $key));
    }

    private function getKey(Form $form)
    {
        $key = $this->secret ?: \Craft::$app->getConfig()->getGeneral()->securityKey;
        $key .= $form->getUid();

        return $key;
    }
}

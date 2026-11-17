<?php

namespace Solspace\Freeform\Tests\Services;

use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Form\Context\Session\StorageTypes\PayloadStorage;
use Solspace\Freeform\Events\Forms\RenderTagEvent;
use Solspace\Freeform\Form\Bags\PropertyBag;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Attributes\FormAttributesCollection;
use yii\base\Security;

#[CoversNothing]
class PayloadStorageTest extends TestCase
{
    public function testEncryptedPayloadRestoresMultipageStateAndRejectsTamperingOrAnotherForm(): void
    {
        $before = \Craft::$app;
        $request = new class {
            public bool $isConsoleRequest = false;
            public array $values = [];

            public function post($key, $default = null): mixed
            {
                return $this->values[$key] ?? $default;
            }
        };
        \Craft::$app = (object) ['request' => $request, 'security' => new Security()];
        foreach (['encryptedPayloadCache', 'decryptedPayloadCache'] as $name) {
            (new \ReflectionProperty(PayloadStorage::class, $name))->setValue(null, []);
        }
        $storage = (new \ReflectionClass(PayloadStorage::class))->newInstanceWithoutConstructor();
        (new \ReflectionProperty(PayloadStorage::class, 'secret'))->setValue($storage, 'test-key');
        $form = $this->createMock(Form::class);
        $form->method('getId')->willReturn(4);
        $form->method('getUid')->willReturn('form-a');
        $form->method('getHash')->willReturn('hash-a');
        $bag = new PropertyBag($form);
        $bag->set(Form::PROPERTY_PAGE_INDEX, 2);
        $bag->set(Form::PROPERTY_STORED_VALUES, ['name' => 'Test value']);
        $form->method('getProperties')->willReturn($bag);
        $form->method('getAttributes')->willReturn(new FormAttributesCollection());

        try {
            $event = new RenderTagEvent($form);
            $storage->attachInput($event);
            $dom = new \DOMDocument();
            @$dom->loadHTML($event->getChunksAsString());
            $payload = $dom->getElementsByTagName('input')->item(0)->getAttribute('value');
            self::assertStringNotContainsString('Test value', $payload);
            $request->values[PayloadStorage::INPUT_PREFIX] = $payload;
            $restored = $storage->getBag($form);
            self::assertSame(2, $restored->getProperties()[Form::PROPERTY_PAGE_INDEX]);
            self::assertSame(['name' => 'Test value'], $restored->getProperties()[Form::PROPERTY_STORED_VALUES]);
            $other = $this->createMock(Form::class);
            $other->method('getUid')->willReturn('form-b');
            self::assertNull($storage->getBag($other), 'A cache hit must not bypass the form-specific encryption key.');
            $request->values[PayloadStorage::INPUT_PREFIX] = substr($payload, 0, 8).'AA'.substr($payload, 10);
            self::assertNull($storage->getBag($form));
            $request->values[PayloadStorage::INPUT_PREFIX] = '!not-base64!';
            self::assertNull($storage->getBag($form));
        } finally {
            \Craft::$app = $before;
            foreach (['encryptedPayloadCache', 'decryptedPayloadCache'] as $name) {
                (new \ReflectionProperty(PayloadStorage::class, $name))->setValue(null, []);
            }
        }
    }
}

<?php

namespace Solspace\Freeform\Tests\Services\Headless;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Form\Bags\PropertyBag;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Services\Headless\HeadlessPayloadHelper;

#[CoversClass(HeadlessPayloadHelper::class)]
class HeadlessPayloadHelperTest extends TestCase
{
    public function testGetPayloadReturnsStoredArray(): void
    {
        $form = $this->formWithPayload([
            'values' => ['email' => 'a@b.com'],
            'meta' => ['honeypot' => ['name' => 'hp', 'value' => '']],
        ]);

        self::assertSame('a@b.com', HeadlessPayloadHelper::getValues($form)['email']);
        self::assertSame('', HeadlessPayloadHelper::getNamedMetaValue($form, 'honeypot', 'hp'));
    }

    public function testGetPayloadReturnsEmptyWhenMissing(): void
    {
        $form = $this->formWithPayload(null);

        self::assertSame([], HeadlessPayloadHelper::getPayload($form));
        self::assertSame([], HeadlessPayloadHelper::getMeta($form));
        self::assertSame([], HeadlessPayloadHelper::getValues($form));
    }

    public function testGetNamedMetaValueRequiresMatchingName(): void
    {
        $form = $this->formWithPayload([
            'meta' => [
                'javascriptTest' => ['name' => 'js-test', 'value' => 'ok'],
            ],
        ]);

        self::assertSame('ok', HeadlessPayloadHelper::getNamedMetaValue($form, 'javascriptTest', 'js-test'));
        self::assertNull(HeadlessPayloadHelper::getNamedMetaValue($form, 'javascriptTest', 'wrong'));
    }

    public function testGetCaptchaResponseFromSingularMeta(): void
    {
        $form = $this->formWithPayload([
            'meta' => [
                'captcha' => ['name' => 'h-captcha-response', 'value' => 'token-1'],
            ],
        ]);

        self::assertSame(
            'token-1',
            HeadlessPayloadHelper::getCaptchaResponse($form, 'h-captcha-response')
        );
    }

    public function testGetCaptchaResponseFromCaptchasList(): void
    {
        $form = $this->formWithPayload([
            'meta' => [
                'captchas' => [
                    ['name' => 'other', 'value' => 'x'],
                    ['name' => 'h-captcha-response', 'value' => 'token-2'],
                ],
            ],
        ]);

        self::assertSame(
            'token-2',
            HeadlessPayloadHelper::getCaptchaResponse($form, 'h-captcha-response')
        );
    }

    public function testGetCaptchaResponseReturnsNullWhenEmpty(): void
    {
        $form = $this->formWithPayload([
            'meta' => [
                'captcha' => ['name' => 'h-captcha-response', 'value' => ''],
            ],
        ]);

        self::assertNull(
            HeadlessPayloadHelper::getCaptchaResponse($form, 'h-captcha-response')
        );
    }

    private function formWithPayload(mixed $payload): Form
    {
        $properties = $this->createMock(PropertyBag::class);
        $properties->method('get')
            ->with('headlessPayload', [])
            ->willReturn($payload ?? [])
        ;

        $form = $this->createMock(Form::class);
        $form->method('getProperties')->willReturn($properties);

        return $form;
    }
}

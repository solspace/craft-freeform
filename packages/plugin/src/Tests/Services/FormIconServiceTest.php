<?php

namespace Solspace\Freeform\Tests\Services;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Attributes\Property\Validators\IconName;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Form\Settings\Settings;
use Solspace\Freeform\Services\FormIconService;
use yii\di\Container;

#[CoversClass(FormIconService::class)]
#[CoversClass(IconName::class)]
class FormIconServiceTest extends TestCase
{
    public function testCraft4IgnoresEvenSavedIcons(): void
    {
        $previous = \Craft::$app;
        \Craft::$app = (object) ['version' => '4.16.0'];
        $service = $this->getMockBuilder(FormIconService::class)->onlyMethods(['renderIcon'])->getMock();
        $service->expects(self::never())->method('renderIcon');

        try {
            self::assertNull($service->getSvg('envelope'));
        } finally {
            \Craft::$app = $previous;
        }
    }

    public function testOnlySystemIconNamesAreResolvedAndRepeatedIconsAreCached(): void
    {
        $service = $this->getMockBuilder(FormIconService::class)->onlyMethods(['isSupported', 'renderIcon'])->getMock();
        $service->method('isSupported')->willReturn(true);
        $service->expects(self::once())->method('renderIcon')->with('envelope')->willReturn('<svg/>');
        foreach (['', null, '../envelope', '/etc/passwd', '@appicons/envelope.svg', '<svg/>', 'https://example.test/icon.svg', str_repeat('a', 101)] as $invalid) {
            self::assertNull($service->getSvg($invalid));
        }
        self::assertSame('<svg/>', $service->getSvg('envelope'));
        self::assertSame('<svg/>', $service->getSvg('envelope'));
    }

    public function testNumericIconNamesIncludingZeroAreSupported(): void
    {
        $service = $this->getMockBuilder(FormIconService::class)->onlyMethods(['isSupported', 'renderIcon'])->getMock();
        $service->method('isSupported')->willReturn(true);
        $service->expects(self::once())->method('renderIcon')->with('0')->willReturn('<svg/>');
        self::assertSame('<svg/>', $service->getSvg('0'));
    }

    public function testSavedIconNamesRoundTripWithoutChangingOtherFormSettings(): void
    {
        $previous = \Craft::$container;
        \Craft::$container = new Container();

        try {
            $provider = (new \ReflectionClass(PropertyProvider::class))->newInstanceWithoutConstructor();
            $settings = new Settings(['general' => ['name' => 'Contact', 'handle' => 'contact', 'color' => '#4385b7', 'icon' => 'envelope']], $provider);
            self::assertSame('envelope', $settings->getGeneral()->icon);
            self::assertSame('envelope', $settings->toArray()['general']->icon);
            self::assertSame('contact', $settings->getGeneral()->handle);
            self::assertSame('#4385b7', $settings->getGeneral()->color);
            self::assertSame('', (new Settings([], $provider))->getGeneral()->icon);
        } finally {
            \Craft::$container = $previous;
        }
    }

    public function testUnknownIconsFallBackToNoIcon(): void
    {
        $service = $this->getMockBuilder(FormIconService::class)->onlyMethods(['isSupported', 'renderIcon'])->getMock();
        $service->method('isSupported')->willReturn(true);
        $service->expects(self::once())->method('renderIcon')->willReturn('');
        self::assertNull($service->getSvg('unknown-icon'));
        self::assertNull($service->getSvg('unknown-icon'));
    }

    public function testIconSettingAcceptsEmptyValuesAndNamesButRejectsOtherInputs(): void
    {
        $validator = new IconName();
        foreach (['', null, 'envelope', '360-degrees', '0'] as $value) {
            self::assertSame([], $validator->validate($value));
        }
        foreach ([[], true, 123, '../icon', '<svg/>', 'icon.svg', "envelope\n"] as $value) {
            self::assertNotEmpty($validator->validate($value));
        }
    }
}

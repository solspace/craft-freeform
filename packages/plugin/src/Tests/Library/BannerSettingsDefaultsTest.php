<?php

namespace Solspace\Freeform\Tests\Library;

use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Bundles\Fields\ImplementationProvider;
use Solspace\Freeform\Bundles\Form\Limiting\LimitedUsers\LimitedUserChecker;
use Solspace\Freeform\Bundles\Form\SuccessBehavior\SuccessBehaviorOptionsGenerator;
use Solspace\Freeform\Bundles\Settings\DefaultsProvider;
use Solspace\Freeform\Form\Settings\Implementations\BehaviorSettings;
use Solspace\Freeform\Form\Settings\Implementations\Options\FormLimitingOptions;
use Solspace\Freeform\Form\Settings\Implementations\Options\SuccessTemplateOptions;
use Solspace\Freeform\Form\Settings\Implementations\ValueGenerators\SuccessTemplateGenerator;
use Solspace\Freeform\Form\Settings\Settings;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\Settings\SubCategories\SuccessAndErrors;
use yii\di\Container;

/**
 * @coversNothing
 */
class BannerSettingsDefaultsTest extends TestCase
{
    private mixed $previousContainer;

    protected function setUp(): void
    {
        $this->previousContainer = \Craft::$container;
        \Craft::$container = new Container();
        foreach ([SuccessBehaviorOptionsGenerator::class, SuccessTemplateOptions::class, FormLimitingOptions::class] as $class) {
            $generator = $this->createMock($class);
            $generator->method('fetchOptions')->willReturn(new OptionCollection());
            \Craft::$container->set($class, $generator);
        }
        \Craft::$container->set(SuccessTemplateGenerator::class, $this->createMock(SuccessTemplateGenerator::class));
    }

    protected function tearDown(): void
    {
        \Craft::$container = $this->previousContainer;
    }

    public function testDefaultValuesAndConfiguredColorsSurviveSettingsSerialization(): void
    {
        $defaults = new SuccessAndErrors();
        self::assertFalse($defaults->customMessageColors->getValue());
        self::assertSame('soft', $defaults->bannerStyle->getValue());
        self::assertSame('#16a34a', $defaults->successColor->getValue());
        self::assertSame('#dc2626', $defaults->errorColor->getValue());

        $configured = new SuccessAndErrors([
            'customMessageColors' => ['value' => true, 'locked' => false],
            'bannerStyle' => ['value' => 'bold', 'locked' => true],
            'successColor' => ['value' => '#2563eb', 'locked' => false],
            'errorColor' => ['value' => '#8b5cf6', 'locked' => false],
        ]);
        $restored = new SuccessAndErrors(json_decode(json_encode($configured), true));
        self::assertTrue($restored->customMessageColors->getValue());
        self::assertSame('bold', $restored->bannerStyle->getValue());
        self::assertTrue($restored->bannerStyle->isLocked());
        self::assertSame('#2563eb', $restored->successColor->getValue());
        self::assertSame('#8b5cf6', $restored->errorColor->getValue());
        self::assertSame(['soft', 'bold'], array_column($restored->bannerStyle->getOptions()->toArray(), 'value'));
    }

    public function testNewFormMetadataUsesConfiguredDefaultsWhileLegacyFormsKeepTemplateColors(): void
    {
        $provider = $this->provider(true);
        $properties = $provider->getEditableProperties(BehaviorSettings::class);
        $newValues = [];
        foreach (['customMessageColors' => true, 'bannerStyle' => 'bold', 'successColor' => '#2563eb', 'errorColor' => '#8b5cf6'] as $key => $expected) {
            self::assertSame($expected, $properties->get($key)->value);
            self::assertTrue($properties->get($key)->visible);
            $newValues[$key] = $properties->get($key)->value;
        }
        self::assertTrue($properties->get('bannerStyle')->disabled);
        $newForm = (new Settings(['behavior' => $newValues], $provider))->getBehavior();
        self::assertTrue($newForm->customMessageColors);
        self::assertSame('#8b5cf6', $newForm->errorColor);

        $legacy = (new Settings(['behavior' => ['successMessage' => 'Existing message']], $provider))->getBehavior();
        self::assertFalse($legacy->customMessageColors);
        self::assertSame('soft', $legacy->bannerStyle);
        self::assertSame('#dc2626', $legacy->errorColor);
    }

    public function testOneLimitedUserPermissionControlsAllFourAppearanceSettings(): void
    {
        $properties = $this->provider(false)->getEditableProperties(BehaviorSettings::class);
        foreach (['customMessageColors', 'bannerStyle', 'successColor', 'errorColor'] as $key) {
            self::assertFalse($properties->get($key)->visible, $key);
        }
        self::assertTrue($properties->get('successMessage')->visible);
        self::assertTrue($properties->get('errorMessage')->visible);
    }

    private function provider(bool $canCustomize): PropertyProvider
    {
        $values = ['customMessageColors' => true, 'bannerStyle' => 'bold', 'successColor' => '#2563eb', 'errorColor' => '#8b5cf6'];
        $defaults = $this->createMock(DefaultsProvider::class);
        $defaults->method('getValue')->willReturnCallback(static fn (string $path) => $values[substr($path, strrpos($path, '.') + 1)] ?? null);
        $defaults->method('isLocked')->willReturnCallback(static fn (string $path) => 'settings.successAndErrors.bannerStyle' === $path);
        $checker = $this->createMock(LimitedUserChecker::class);
        $checker->method('can')->willReturnCallback(static fn (string $path) => 'settings.tab.success-and-errors.customMessageColors' !== $path || $canCustomize);

        return new PropertyProvider($this->createMock(ImplementationProvider::class), $defaults, $checker);
    }
}

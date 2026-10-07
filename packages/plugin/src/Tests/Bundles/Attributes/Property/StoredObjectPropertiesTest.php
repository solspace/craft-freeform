<?php

namespace Solspace\Freeform\Tests\Bundles\Attributes\Property;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Attributes\Property\DefaultValue;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionsGeneratorInterface;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\TransformerInterface;
use Solspace\Freeform\Attributes\Property\ValueGeneratorInterface;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Bundles\Fields\ImplementationProvider;
use Solspace\Freeform\Bundles\Form\Limiting\LimitedUsers\LimitedUserChecker;
use Solspace\Freeform\Bundles\Settings\DefaultsProvider;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Form\Settings\Implementations\BehaviorSettings;
use Solspace\Freeform\Form\Settings\Implementations\GeneralSettings;
use Solspace\Freeform\Form\Settings\Settings;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Services\SettingsService;
use yii\di\Container;

#[CoversClass(PropertyProvider::class)]
#[CoversClass(Settings::class)]
class StoredObjectPropertiesTest extends TestCase
{
    private mixed $originalContainer;
    private mixed $originalApp;

    protected function setUp(): void
    {
        $this->originalContainer = \Craft::$container;
        $this->originalApp = \Yii::$app;
    }

    protected function tearDown(): void
    {
        \Craft::$container = $this->originalContainer;
        \Yii::$app = $this->originalApp;
    }

    public function testSavedValuesAreTransformedWithoutGeneratingEditorMetadata(): void
    {
        $form = $this->createMock(Form::class);
        $transformer = $this->createMock(TransformerInterface::class);
        $transformer->expects($this->once())->method('transform')->with(['a', 'b'], $form)->willReturn('a,b');
        $transformer->expects($this->never())->method('reverseTransform');

        $container = $this->createMock(Container::class);
        $container->expects($this->once())->method('get')->with(StoredValueTransformer::class)->willReturn($transformer);
        \Craft::$container = $container;

        $object = new StoredSettingsFixture();
        $this->createProvider()->setStoredObjectProperties($object, [
            'transformed' => ['a', 'b'],
            'selected' => 'saved',
            'undecorated' => 42,
            'unknownProperty' => 'ignored',
        ], $form);

        $this->assertSame('a,b', $object->getTransformed());
        $this->assertSame('saved', $object->selected);
        $this->assertSame(42, $object->undecorated);
        $this->assertFalse(property_exists($object, 'unknownProperty'));
    }

    public function testMissingAndInvalidValuesKeepTheExistingHydrationSemantics(): void
    {
        $container = $this->createMock(Container::class);
        $container->method('get')->willReturn(new StoredValueTransformer());
        \Craft::$container = $container;

        $object = new StoredSettingsFixture();
        $this->createProvider()->setStoredObjectProperties($object, [
            'nullableEmpty' => '',
            'selected' => ['invalid type'],
        ]);

        $this->assertNull($object->nullableMissing);
        $this->assertNull($object->nullableEmpty);
        $this->assertSame('initial', $object->selected);
        $this->assertSame('default', $object->nonNullable);
        $this->assertSame('missing', $object->getTransformed());
    }

    public function testFormSettingsUseSavedValueHydrationForEachNamespace(): void
    {
        $provider = $this->createMock(PropertyProvider::class);
        $provider->expects($this->never())->method('setObjectProperties');
        $calls = [];
        $provider->expects($this->exactly(2))->method('setStoredObjectProperties')->willReturnCallback(
            static function (object $object, array $values) use (&$calls): void {
                $calls[] = [$object::class, $values];
            }
        );

        new Settings([
            'general' => ['name' => 'Saved form'],
            'behavior' => ['ajax' => true],
            'unknownNamespace' => [],
        ], $provider);

        $this->assertSame([
            [GeneralSettings::class, ['name' => 'Saved form']],
            [BehaviorSettings::class, ['ajax' => true]],
        ], $calls);
    }

    public function testRealFormNamespacesMatchTheExistingHydrationResult(): void
    {
        $plugin = $this->createMock(Freeform::class);
        $plugin->method('__get')->with('settings')->willReturn($this->createMock(SettingsService::class));
        \Yii::$app = (object) ['loadedModules' => [Freeform::class => $plugin]];

        $options = $this->createMock(OptionsGeneratorInterface::class);
        $options->method('fetchOptions')->willReturn(new OptionCollection());
        $generator = $this->createMock(ValueGeneratorInterface::class);
        $container = $this->createMock(Container::class);
        $container->method('get')->willReturnCallback(
            static function (string $class) use ($options, $generator): object {
                if (is_a($class, TransformerInterface::class, true)) {
                    return new $class();
                }

                return is_a($class, OptionsGeneratorInterface::class, true) ? $options : $generator;
            }
        );
        \Craft::$container = $container;
        $provider = new PropertyProvider(
            $this->createMock(ImplementationProvider::class),
            $this->createMock(DefaultsProvider::class),
            $this->createMock(LimitedUserChecker::class),
        );

        foreach ([
            GeneralSettings::class => [
                [],
                ['name' => 'Saved form', 'handle' => 'savedForm', 'sites' => [1, 2], 'attributes' => ['form' => [['data-example', 'saved']]]],
            ],
            BehaviorSettings::class => [
                [],
                ['ajax' => true, 'successMessage' => 'Saved message', 'stopSubmissionsAfter' => '2026-10-01T12:00:00+00:00'],
            ],
        ] as $class => $cases) {
            foreach ($cases as $values) {
                $original = new $class();
                $optimized = new $class();
                $provider->setObjectProperties($original, $values);
                $provider->setStoredObjectProperties($optimized, $values);

                $this->assertEquals($original, $optimized);
            }
        }
    }

    private function createProvider(): PropertyProvider
    {
        $defaults = $this->createMock(DefaultsProvider::class);
        $defaults->expects($this->never())->method('getValue');
        $defaults->expects($this->never())->method('isLocked');
        $checker = $this->createMock(LimitedUserChecker::class);
        $checker->expects($this->never())->method('can');

        return new PropertyProvider($this->createMock(ImplementationProvider::class), $defaults, $checker);
    }
}

class StoredSettingsParentFixture
{
    #[Input\Text]
    public ?string $nullableMissing = 'initial';
}

class StoredSettingsFixture extends StoredSettingsParentFixture
{
    #[Input\Select(options: 'EditorOptionsMustNotBeLoaded')]
    #[DefaultValue('settings.editor.default')]
    public string $selected = 'initial';

    #[Input\Text]
    public ?string $nullableEmpty = 'initial';

    #[Input\Text]
    public string $nonNullable = 'default';

    public int $undecorated = 0;
    #[Input\Text]
    #[ValueTransformer(StoredValueTransformer::class)]
    private string $transformed = '';

    public function getTransformed(): string
    {
        return $this->transformed;
    }
}

class StoredValueTransformer implements TransformerInterface
{
    public function transform(mixed $value, ?Form $form = null): string
    {
        return null === $value ? 'missing' : implode(',', $value);
    }

    public function reverseTransform(mixed $value): mixed
    {
        throw new \LogicException('Editor values must not be generated when restoring saved settings.');
    }
}

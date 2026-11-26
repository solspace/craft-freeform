<?php

namespace Solspace\Freeform\Tests\Bundles\Mcp;

use Mcp\Exception\ToolCallException;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Attributes\Property\Input\Text;
use Solspace\Freeform\Attributes\Property\PropertyCollection;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Bundles\Mcp\FieldSettings;
use Solspace\Freeform\Fields\Implementations\NumberField;
use Solspace\Freeform\Fields\Implementations\Pro\RatingField;
use Solspace\Freeform\Fields\Implementations\TextField;
use yii\di\Container;

#[CoversClass(FieldSettings::class)]
class FieldSettingsTest extends TestCase
{
    private mixed $previousContainer;

    protected function setUp(): void
    {
        $this->previousContainer = \Craft::$container;
    }

    protected function tearDown(): void
    {
        \Craft::$container = $this->previousContainer;
    }

    public function testAcceptsTenStarsAndAnExplicitlyClearedCharacterLimit(): void
    {
        $this->configureProperties('maxValue', 'maxLength', 'placeholder');

        self::assertSame(['maxStars' => 10], FieldSettings::validate(RatingField::class, ['maxStars' => 10]));
        self::assertSame(
            ['maxLength' => null, 'placeholder' => ''],
            FieldSettings::validate(TextField::class, ['maxLength' => 0, 'placeholder' => '']),
        );
    }

    #[TestWith([RatingField::class, 2])]
    #[TestWith([RatingField::class, 11])]
    #[TestWith([NumberField::class, 10])]
    public function testRejectsInvalidOrInapplicableStarCounts(string $fieldClass, int $stars): void
    {
        $this->configureProperties('maxValue');

        $this->expectException(ToolCallException::class);
        FieldSettings::validate($fieldClass, ['maxStars' => $stars]);
    }

    public function testRejectsASettingHiddenByBuilderPermissions(): void
    {
        $this->configureProperties('maxLength');

        $this->expectException(ToolCallException::class);
        FieldSettings::validate(TextField::class, ['placeholder' => 'Example']);
    }

    private function configureProperties(string ...$handles): void
    {
        $properties = new PropertyCollection();
        foreach ($handles as $handle) {
            $property = $this->getMockBuilder(Text::class)->onlyMethods(['matchesEdition'])->getMock();
            $property->handle = $handle;
            $property->method('matchesEdition')->willReturn(true);
            $properties->add($property);
        }

        $provider = $this->createStub(PropertyProvider::class);
        $provider->method('getEditableProperties')->willReturn($properties);
        \Craft::$container = new Container();
        \Craft::$container->setSingleton(PropertyProvider::class, $provider);
    }
}

<?php

namespace Solspace\Tests\Freeform\Unit\Bundles\Attributes\Property;

use PHPUnit\Framework\TestCase;
use Solspace\Commons\Helpers\StringHelper;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Middleware;
use Solspace\Freeform\Attributes\Property\Property;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use yii\di\Container;

/**
 * @internal
 *
 * @coversNothing
 */
class EditablePropertyProviderTest extends TestCase
{
    /**
     * @dataProvider propertyDataProvider
     */
    public function testGetEditableProperties(array $checklist)
    {
        $mockContainer = $this->createMock(Container::class);

        $provider = new PropertyProvider($mockContainer);

        $editableProperties = $provider->getEditableProperties(TestAttributesClass::class);

        $handle = $checklist['handle'];
        foreach ($checklist as $key => $expectedValue) {
            $actualValue = $editableProperties->get($handle)->{$key};

            try {
                $message = sprintf(
                    "Property `%s` has a mismatched `%s` value of `%s` (expected '%s')",
                    $handle,
                    $key,
                    \is_array($actualValue) ? StringHelper::implodeRecursively(',', $actualValue) : $actualValue,
                    \is_array($expectedValue) ? StringHelper::implodeRecursively(',', $expectedValue) : $expectedValue
                );
            } catch (\Exception $e) {
                $message = $e->getMessage();
            }

            $this->assertEquals(
                $expectedValue,
                $actualValue,
                $message
            );
        }
    }

    public function propertyDataProvider()
    {
        return [
            [[
                'type' => 'string',
                'handle' => 'stringValue',
                'label' => 'String Value',
                'instructions' => null,
                'order' => 1,
                'value' => null,
                'placeholder' => null,
                'section' => null,
                'options' => null,
                'flags' => [],
                'visibilityFilters' => [],
                'middleware' => [],
                'transformer' => null,
                'required' => false,
            ]],
            [[
                'type' => 'int',
                'handle' => 'optionalInt',
                'label' => 'Optional Integer',
                'instructions' => null,
                'order' => 2,
                'value' => null,
                'placeholder' => null,
                'section' => null,
                'options' => null,
                'flags' => [],
                'visibilityFilters' => [],
                'middleware' => [],
                'transformer' => null,
                'required' => false,
            ]],
            [[
                'type' => 'override-type',
                'handle' => 'boolWithDefaultTrue',
                'label' => 'Bool With Default True',
                'instructions' => 'instructions',
                'order' => 99,
                'value' => true,
                'placeholder' => 'placeholder',
                'section' => null,
                'options' => [
                    ['value' => 'one', 'label' => 'One'],
                    ['value' => 'two', 'label' => 'Two'],
                    ['value' => 'three', 'label' => 'Three'],
                ],
                'flags' => [],
                'visibilityFilters' => [],
                'middleware' => [],
                'transformer' => null,
                'required' => false,
            ]],
            [[
                'type' => 'string',
                'handle' => 'propWithMiddleware',
                'label' => 'Prop With Middleware',
                'instructions' => null,
                'order' => 100,
                'value' => null,
                'placeholder' => null,
                'section' => null,
                'options' => [
                    ['value' => 0, 'label' => 'one'],
                    ['value' => 1, 'label' => 'two'],
                    ['value' => 2, 'label' => 'three'],
                ],
                'flags' => [],
                'visibilityFilters' => [],
                'middleware' => [
                    ['test', ['arg 1', 2, true]],
                    ['another one'],
                ],
                'transformer' => null,
                'required' => false,
            ]],
            [[
                'type' => 'string',
                'handle' => 'propWithFlags',
                'label' => 'Prop With Flags',
                'instructions' => null,
                'order' => 101,
                'value' => null,
                'placeholder' => null,
                'section' => null,
                'options' => [
                    ['value' => 'one', 'label' => 'One'],
                    ['value' => 'two', 'label' => 'Two'],
                    ['value' => 'three', 'label' => 'Three'],
                ],
                'flags' => ['test-flag', 'another-flag'],
                'visibilityFilters' => [],
                'middleware' => [],
                'transformer' => null,
                'required' => false,
            ]],
            [[
                'type' => 'string',
                'handle' => 'propWithFilters',
                'label' => 'Prop With Filters',
                'instructions' => null,
                'order' => 102,
                'value' => null,
                'placeholder' => null,
                'section' => null,
                'options' => null,
                'flags' => [],
                'visibilityFilters' => [
                    'test-filter',
                    'second-test-filter',
                    'third-test-filter',
                ],
                'middleware' => [],
                'transformer' => null,
                'required' => false,
            ]],
        ];
    }
}

class TestAttributesClass
{
    #[Property]
    private string $stringValue;

    #[Property('Optional Integer')]
    private ?int $optionalInt;

    #[Property(
        type: 'override-type',
        instructions: 'instructions',
        order: 99,
        placeholder: 'placeholder',
        options: ['one' => 'One', 'two' => 'Two', 'three' => 'Three'],
    )]
    private bool $boolWithDefaultTrue = true;

    #[Property(
        options: ['one', 'two', 'three'],
    )]
    #[Middleware('test', ['arg 1', 2, true])]
    #[Middleware('another one')]
    private string $propWithMiddleware;

    #[Property(
        options: [
            ['value' => 'one', 'label' => 'One'],
            ['value' => 'two', 'label' => 'Two'],
            ['value' => 'three', 'label' => 'Three'],
        ],
    )]
    #[Flag('test-flag')]
    #[Flag('another-flag')]
    private string $propWithFlags;

    #[Property]
    #[VisibilityFilter('test-filter')]
    #[VisibilityFilter('second-test-filter')]
    #[VisibilityFilter('third-test-filter')]
    private string $propWithFilters;
}

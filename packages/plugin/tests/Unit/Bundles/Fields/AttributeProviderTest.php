<?php

namespace Solspace\Tests\Freeform\Unit\Bundles\Fields;

use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Attributes\Field\Flag;
use Solspace\Freeform\Attributes\Field\Middleware;
use Solspace\Freeform\Attributes\Field\Property;
use Solspace\Freeform\Attributes\Field\VisibilityFilter;
use Solspace\Freeform\Bundles\Fields\AttributeProvider;

/**
 * @internal
 *
 * @coversNothing
 */
class AttributeProviderTest extends TestCase
{
    public function testGetEditableProperties()
    {
        $provider = new AttributeProvider();

        $editableProperties = $provider->getEditableProperties(TestAttributesClass::class);

        $this->assertEquals(
            [
                [
                    'type' => 'string',
                    'handle' => 'stringValue',
                    'label' => 'String Value',
                    'instructions' => null,
                    'order' => 1,
                    'value' => null,
                    'placeholder' => null,
                    'section' => null,
                    'options' => [],
                    'flags' => [],
                    'visibilityFilters' => [],
                    'middleware' => [],
                    'tab' => null,
                    'group' => null,
                ],
                [
                    'type' => 'int',
                    'handle' => 'optionalInt',
                    'label' => 'Optional Integer',
                    'instructions' => null,
                    'order' => 2,
                    'value' => null,
                    'placeholder' => null,
                    'section' => null,
                    'options' => [],
                    'flags' => [],
                    'visibilityFilters' => [],
                    'middleware' => [],
                    'tab' => null,
                    'group' => null,
                ],
                [
                    'type' => 'override-type',
                    'handle' => 'boolWithDefaultTrue',
                    'label' => 'Bool With Default True',
                    'instructions' => 'instructions',
                    'order' => 99,
                    'value' => true,
                    'placeholder' => 'placeholder',
                    'section' => null,
                    'options' => [],
                    'flags' => [],
                    'visibilityFilters' => [],
                    'middleware' => [],
                    'tab' => null,
                    'group' => null,
                ],
                [
                    'type' => 'string',
                    'handle' => 'propWithMiddleware',
                    'label' => 'Prop With Middleware',
                    'instructions' => null,
                    'order' => 100,
                    'value' => null,
                    'placeholder' => null,
                    'section' => null,
                    'options' => [],
                    'flags' => [],
                    'visibilityFilters' => [],
                    'middleware' => [
                        ['test', ['arg 1', 2, true]],
                        ['another one'],
                    ],
                    'tab' => null,
                    'group' => null,
                ],
                [
                    'type' => 'string',
                    'handle' => 'propWithFlags',
                    'label' => 'Prop With Flags',
                    'instructions' => null,
                    'order' => 101,
                    'value' => null,
                    'placeholder' => null,
                    'section' => null,
                    'options' => [],
                    'flags' => ['test-flag', 'another-flag'],
                    'visibilityFilters' => [],
                    'middleware' => [],
                    'tab' => null,
                    'group' => null,
                ],
                [
                    'type' => 'string',
                    'handle' => 'propWithFilters',
                    'label' => 'Prop With Filters',
                    'instructions' => null,
                    'order' => 102,
                    'value' => null,
                    'placeholder' => null,
                    'section' => null,
                    'options' => [],
                    'flags' => [],
                    'visibilityFilters' => [
                        'test-filter',
                        'second-test-filter',
                        'third-test-filter',
                    ],
                    'middleware' => [],
                    'tab' => null,
                    'group' => null,
                ],
            ],
            $editableProperties->jsonSerialize()
        );
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
    )]
    private bool $boolWithDefaultTrue = true;

    #[Property]
    #[Middleware('test', ['arg 1', 2, true])]
    #[Middleware('another one')]
    private string $propWithMiddleware;

    #[Property]
    #[Flag('test-flag')]
    #[Flag('another-flag')]
    private string $propWithFlags;

    #[Property]
    #[VisibilityFilter('test-filter')]
    #[VisibilityFilter('second-test-filter')]
    #[VisibilityFilter('third-test-filter')]
    private string $propWithFilters;
}

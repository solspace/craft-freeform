<?php

namespace Solspace\Freeform\Tests\Bundles\Fields;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Fields\FieldContainerBundle;
use Solspace\Freeform\Events\Fields\CompileFieldAttributesEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Attributes\Attributes;
use Solspace\Freeform\Library\Attributes\FieldAttributesCollection;

#[CoversClass(FieldContainerBundle::class)]
class FieldContainerBundleTest extends TestCase
{
    private mixed $previousApp;

    protected function setUp(): void
    {
        $this->previousApp = \Craft::$app;
    }

    protected function tearDown(): void
    {
        \Craft::$app = $this->previousApp;
    }

    #[TestWith(['html'])]
    #[TestWith(['rich-text'])]
    #[TestWith(['radios'])]
    public function testRenderedPreviewIncludesFrontendFieldHooks(string $type): void
    {
        $attributes = $this->compile(cp: true, preview: true, type: $type);
        self::assertSame($type, $attributes->getContainer()->get('data-field-type'));
        self::assertSame('content', $attributes->getContainer()->get('data-field-container'));
        self::assertSame('w-full px-2', $attributes->getContainer()->get('class'));
    }

    public function testBuilderMetadataStillOmitsFrontendFieldHooks(): void
    {
        $attributes = $this->compile(cp: true, preview: false);
        self::assertNull($attributes->getContainer()->get('data-field-type'));
        self::assertNull($attributes->getContainer()->get('data-field-container'));
    }

    public function testFrontendRenderingRetainsFieldHooks(): void
    {
        $attributes = $this->compile(cp: false, preview: false);
        self::assertSame('html', $attributes->getContainer()->get('data-field-type'));
        self::assertSame('content', $attributes->getContainer()->get('data-field-container'));
    }

    public function testDashboardQuickFormRetainsFieldHooksWithoutPreviewMode(): void
    {
        $attributes = $this->compile(cp: true, preview: false, type: 'location', widget: true);
        self::assertSame('location', $attributes->getContainer()->get('data-field-type'));
        self::assertSame('content', $attributes->getContainer()->get('data-field-container'));
        self::assertSame('w-full px-2', $attributes->getContainer()->get('class'));
    }

    public function testUnrelatedAttributeCollectionsAreNotChanged(): void
    {
        $field = $this->createMock(FieldInterface::class);
        $field->expects(self::never())->method('getForm');
        $attributes = new Attributes(['class' => 'custom']);
        $bundle = (new \ReflectionClass(FieldContainerBundle::class))->newInstanceWithoutConstructor();
        $bundle->updateContainerAttributes(new CompileFieldAttributesEvent($field, $attributes, Attributes::class));
        self::assertSame('class="custom"', trim((string) $attributes));
    }

    private function compile(bool $cp, bool $preview, string $type = 'html', bool $widget = false): FieldAttributesCollection
    {
        $request = new class($cp, $widget) {
            public function __construct(public bool $isCpRequest, private bool $widget) {}

            public function getSegment(int $index): ?string
            {
                return [1 => 'freeform', 2 => 'api', 3 => 'forms', 4 => $this->widget ? 'widgets' : '13'][$index] ?? null;
            }
        };
        \Craft::$app = (object) ['request' => $request];
        $form = $this->createMock(Form::class);
        $form->method('isPreview')->willReturn($preview);
        $field = $this->createMock(FieldInterface::class);
        $field->method('getForm')->willReturn($form);
        $field->method('getHandle')->willReturn('content');
        $field->method('getType')->willReturn($type);
        $attributes = new FieldAttributesCollection(['container' => ['class' => 'w-full px-2']]);
        $bundle = (new \ReflectionClass(FieldContainerBundle::class))->newInstanceWithoutConstructor();
        $bundle->updateContainerAttributes(new CompileFieldAttributesEvent($field, $attributes, FieldAttributesCollection::class));

        return $attributes;
    }
}

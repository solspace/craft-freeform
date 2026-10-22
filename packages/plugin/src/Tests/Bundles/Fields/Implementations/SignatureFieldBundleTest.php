<?php

namespace Solspace\Freeform\Tests\Bundles\Fields\Implementations;

use craft\base\Element;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\DataProviderExternal;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Fields\Implementations\SignatureField\SignatureFieldBundle;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Submissions\RenderTableValueEvent;
use Solspace\Freeform\Fields\Implementations\Pro\SignatureField;
use Solspace\Freeform\Library\Bundles\BundleInterface;
use Solspace\Freeform\Tests\Fixtures\SignatureImages;
use yii\base\Event;

#[CoversClass(SignatureFieldBundle::class)]
class SignatureFieldBundleTest extends TestCase
{
    #[DataProviderExternal(SignatureImages::class, 'validImages')]
    public function testRendersBoundedImagesAtTheirSavedAspectRatio(string $value, string $mimeType): void
    {
        $field = $this->createMock(SignatureField::class);
        $field->method('getValue')->willReturn($value);
        $field->expects($this->never())->method('getWidth');
        $field->expects($this->never())->method('getHeight');
        $event = $this->render($field);

        $document = new \DOMDocument();
        $document->loadHTML($event->getOutput());
        $image = $document->getElementsByTagName('img')->item(0);
        self::assertSame(trim($value), $image->getAttribute('src'));
        [$width, $height] = getimagesizefromstring(base64_decode(explode(',', trim($value), 2)[1]));
        $scale = min(1, 160 / $width, 40 / $height);
        self::assertSame((string) max(1, (int) round($height * $scale)), $image->getAttribute('height'));
        self::assertSame((string) max(1, (int) round($width * $scale)), $image->getAttribute('width'));
        self::assertSame('thumbnail', $image->getAttribute('data-freeform-signature-preview'));
        self::assertSame('lazy', $image->getAttribute('loading'));
        self::assertSame('signature', $image->getAttribute('alt'));
        self::assertFalse($image->hasAttribute('onerror'));
    }

    #[DataProviderExternal(SignatureImages::class, 'invalidImages')]
    public function testDoesNotRenderUntrustedValuesAsImages(mixed $value): void
    {
        $field = $this->createMock(SignatureField::class);
        $field->method('getValue')->willReturn($value);

        self::assertSame('', $this->render($field)->getOutput());
    }

    public function testTheBundleLoaderCanDiscoverTheSignatureRenderer(): void
    {
        self::assertTrue(is_subclass_of(SignatureFieldBundle::class, BundleInterface::class));
    }

    public function testIsDiscoverableByTheBundleLoaderAndRendersInBothCraftIndexPaths(): void
    {
        if (!class_exists(Element::class)) {
            self::markTestSkipped('Requires the Craft element API.');
        }
        $bundle = new SignatureFieldBundle();
        self::assertInstanceOf(BundleInterface::class, $bundle);
        $field = $this->createMock(SignatureField::class);
        $field->method('getValue')->willReturn(SignatureImages::PNG);
        $submission = $this->getMockBuilder(Submission::class)->disableOriginalConstructor()->onlyMethods(['__get'])->getMock();
        $submission->method('__get')->willReturn($field);

        try {
            foreach (['tableAttributeHtml', 'attributeHtml'] as $method) {
                $html = (new \ReflectionMethod(Submission::class, $method))->invoke($submission, 'field:123');
                self::assertStringContainsString('<img', $html);
                self::assertStringContainsString('data-freeform-signature-preview', $html);
            }
        } finally {
            Event::off(Submission::class, Submission::EVENT_RENDER_TABLE_VALUE, [$bundle, 'renderTableValue']);
        }
    }

    public function testAnExplicitlyEmptyRendererDoesNotFallBackToRawSignatureCode(): void
    {
        if (!class_exists(Element::class)) {
            self::markTestSkipped('Requires the Craft element API.');
        }
        $bundle = new SignatureFieldBundle();
        $field = $this->createMock(SignatureField::class);
        $field->method('getValue')->willReturn('data:image/png;base64,invalid');
        $submission = $this->getMockBuilder(Submission::class)->disableOriginalConstructor()->onlyMethods(['__get'])->getMock();
        $submission->method('__get')->willReturn($field);

        try {
            foreach (['tableAttributeHtml', 'attributeHtml'] as $method) {
                self::assertSame('', (new \ReflectionMethod(Submission::class, $method))->invoke($submission, 'field:123'));
            }
        } finally {
            Event::off(Submission::class, Submission::EVENT_RENDER_TABLE_VALUE, [$bundle, 'renderTableValue']);
        }
    }

    private function render(SignatureField $field): RenderTableValueEvent
    {
        $event = $this->getMockBuilder(RenderTableValueEvent::class)
            ->disableOriginalConstructor()
            ->onlyMethods(['getField'])
            ->getMock()
        ;
        $event->method('getField')->willReturn($field);
        $bundle = (new \ReflectionClass(SignatureFieldBundle::class))->newInstanceWithoutConstructor();
        $bundle->renderTableValue($event);

        return $event;
    }
}

<?php

namespace Solspace\Freeform\Tests\Fields;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Fields\Implementations\FileUploadField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Services\FilesService;

#[CoversClass(FileUploadField::class)]
#[CoversClass(FilesService::class)]
class PhotoFieldSettingsTest extends TestCase
{
    public function testExistingFieldsDoNotStartOptimizingImages(): void
    {
        $field = new FileUploadField($this->createMock(Form::class));
        self::assertFalse($field->isOptimizeImages());
        self::assertSame(2000, $field->getImageMaxDimension());
        self::assertSame(85, $field->getImageQuality());
        self::assertSame(2048, $field->getImageMaxSizeKB());
        self::assertSame(2048 * 1024, $field->getMaxFileSizeBytes());
    }

    public function testHeicIsAcceptedOnlyForOptInJpegConversion(): void
    {
        $field = new FileUploadField($this->createMock(Form::class));
        $service = $this->getMockBuilder(FilesService::class)->onlyMethods(['getFileKinds'])->getMock();
        $service->method('getFileKinds')->willReturn(['image' => ['jpg', 'jpeg', 'png']]);
        self::assertNotContains('heic', $service->getValidExtensions($field));
        (new \ReflectionProperty($field, 'optimizeImages'))->setValue($field, true);
        self::assertContains('heic', $service->getValidExtensions($field));
        self::assertContains('heif', $service->getValidExtensions($field));
    }

    public function testDoesNotBypassARestrictionOnJpegOutput(): void
    {
        $field = new FileUploadField($this->createMock(Form::class));
        (new \ReflectionProperty($field, 'optimizeImages'))->setValue($field, true);
        $service = $this->getMockBuilder(FilesService::class)->onlyMethods(['getFileKinds'])->getMock();
        $service->method('getFileKinds')->willReturn(['image' => ['png']]);
        self::assertSame(['png'], $service->getValidExtensions($field));
    }
}

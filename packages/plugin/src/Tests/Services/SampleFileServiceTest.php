<?php

namespace Solspace\Freeform\Tests\Services;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Fields\Validation\FileDragAndDropUploadValidation;
use Solspace\Freeform\Bundles\Fields\Validation\FileUploadValidation;
use Solspace\Freeform\Bundles\Fields\Validation\Helpers\FileUploadValidationHelper;
use Solspace\Freeform\Events\Fields\ValidateEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\FileUploadField;
use Solspace\Freeform\Fields\Implementations\Pro\FileDragAndDropField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Services\FilesService;
use Solspace\Freeform\Services\SampleFileService;
use yii\base\Event;

#[CoversClass(SampleFileService::class)]
class SampleFileServiceTest extends TestCase
{
    public function testDragAndDropCountsRespectTheFieldLimitAndIgnoreNumberedFixtures(): void
    {
        $files = $this->createMock(FilesService::class);
        $files->method('getValidExtensions')->willReturn(['png']);
        $service = $this->getMockBuilder(SampleFileService::class)->setConstructorArgs([$files])->onlyMethods(['sign'])->getMock();
        $service->method('sign')->willReturn('signed-token');
        $form = $this->createMock(Form::class);
        $limit = 1;
        $field = $this->createMock(FileDragAndDropField::class);
        $field->method('getForm')->willReturn($form);
        $field->method('getUid')->willReturn('upload-uid');
        $field->method('isSampleDataEnabled')->willReturn(true);
        $field->method('getValue')->willReturn([]);
        $field->method('getMaxFileSizeBytes')->willReturn(100000);
        $field->method('getFileCount')->willReturnCallback(static function () use (&$limit) { return $limit; });
        foreach ([1, 2, 3, 10] as $limit) {
            for ($attempt = 0; $attempt < 20; ++$attempt) {
                $descriptor = $service->createDescriptor($field);
                self::assertGreaterThanOrEqual(1, $descriptor['count']);
                self::assertLessThanOrEqual(min(3, $limit), $descriptor['count']);
                $samples = array_merge([$descriptor], $descriptor['additionalFiles']);
                self::assertCount($descriptor['count'], $samples);
                self::assertCount($descriptor['count'], array_unique(array_column($samples, 'data')));
            }
        }
        $file = $service->getForField($field);
        $path = tempnam(sys_get_temp_dir(), 'freeform-samples-');

        try {
            file_put_contents($path, base64_decode($file['data']));
            foreach (['Freeform-Sample.png', 'Freeform-Sample-2.png', 'Freeform-Sample-3.png'] as $name) {
                self::assertTrue($service->isSampleUpload($field, ['name' => $name, 'tmp_name' => $path, 'error' => \UPLOAD_ERR_OK]));
            }
            self::assertFalse($service->isSampleUpload($field, ['name' => 'Freeform-Sample-4.png', 'tmp_name' => $path, 'error' => \UPLOAD_ERR_OK]));
            $limit = 1;
            self::assertFalse($service->isSampleUpload($field, ['name' => 'Freeform-Sample-2.png', 'tmp_name' => $path, 'error' => \UPLOAD_ERR_OK]));
        } finally {
            unlink($path);
        }
    }

    public function testFixturesHaveValidContentsAndRespectAllowedExtensionsAndSize(): void
    {
        $service = new SampleFileService();
        foreach (['png' => 'image/png', 'pdf' => 'application/pdf', 'txt' => 'text/plain'] as $extension => $mime) {
            $file = $service->select([$extension], 100000);
            self::assertNotNull($file);
            $bytes = base64_decode($file['data'], true);
            self::assertSame($file['size'], \strlen($bytes));
            self::assertSame($mime, (new \finfo(\FILEINFO_MIME_TYPE))->buffer($bytes));
            self::assertNull($service->select([$extension], 1));
            self::assertSame($file, $service->select([$extension], $file['size']));
        }
        self::assertNull($service->select(['mp3'], 100000));
        self::assertNull($service->select([], 100000));
    }

    public function testRecognizesExactFixtureBytesOnlyWhileEnabled(): void
    {
        $files = $this->createMock(FilesService::class);
        $files->method('getValidExtensions')->willReturn(['txt']);
        $service = new SampleFileService($files);
        $enabled = true;
        // Use a mutable closure so disabling the feature immediately restores normal uploads.
        $field = $this->getMockBuilder(FileUploadField::class)->disableOriginalConstructor()->onlyMethods(['isSampleDataEnabled', 'getMaxFileSizeBytes'])->getMock();
        $field->method('isSampleDataEnabled')->willReturnCallback(static function () use (&$enabled) { return $enabled; });
        $field->method('getMaxFileSizeBytes')->willReturn(100000);
        $file = $service->getForField($field);
        $path = tempnam(sys_get_temp_dir(), 'freeform-sample-');

        try {
            file_put_contents($path, base64_decode($file['data']));
            $upload = ['name' => $file['name'], 'tmp_name' => $path, 'error' => \UPLOAD_ERR_OK];
            self::assertTrue($service->isSampleUpload($field, $upload));
            self::assertFalse($service->isSampleUpload($field, array_replace($upload, ['name' => 'customer.txt'])));
            self::assertFalse($service->isSampleUpload($field, array_replace($upload, ['error' => \UPLOAD_ERR_PARTIAL])));
            file_put_contents($path, str_repeat('x', $file['size']));
            self::assertFalse($service->isSampleUpload($field, $upload), 'A real file with the sample filename must never be discarded.');
            file_put_contents($path, base64_decode($file['data']));
            $enabled = false;
            self::assertFalse($service->isSampleUpload($field, $upload));
        } finally {
            unlink($path);
        }
    }

    public function testSignedMarkerIsBoundToFormFieldAndCurrentConfiguration(): void
    {
        $files = $this->createMock(FilesService::class);
        $extensions = ['txt'];
        $files->method('getValidExtensions')->willReturnCallback(static function () use (&$extensions) { return $extensions; });
        $service = new class($files) extends SampleFileService {
            public function token(FileUploadField $field, ?array $file = null): string
            {
                $method = new \ReflectionMethod(SampleFileService::class, 'payload');

                return $this->sign($method->invoke($this, $field, $file ?? $this->getForField($field)));
            }

            protected function sign(string $value): string
            {
                return hash_hmac('sha256', $value, 'test-secret').$value;
            }

            protected function verify(string $value): false|string
            {
                $payload = substr($value, 64);

                return hash_equals($this->sign($payload), $value) ? $payload : false;
            }
        };
        $formId = 1;
        $form = $this->createMock(Form::class);
        $form->method('getId')->willReturnCallback(static function () use (&$formId) { return $formId; });
        $field = $this->createMock(FileUploadField::class);
        $field->method('getForm')->willReturn($form);
        $field->method('getUid')->willReturn('field-one');
        $field->method('isSampleDataEnabled')->willReturn(true);
        $field->method('getMaxFileSizeBytes')->willReturn(100000);
        $token = $service->token($field);
        self::assertTrue($service->hasSubmittedSample($field, ['field-one' => $token]));
        self::assertFalse($service->hasSubmittedSample($field, ['field-other' => $token]));
        self::assertFalse($service->hasSubmittedSample($field, ['field-one' => $token.'tampered']));
        self::assertFalse($service->hasSubmittedSample($field, ['field-one' => ['array']]));
        $formId = 2;
        self::assertFalse($service->hasSubmittedSample($field, ['field-one' => $token]));
        $formId = 1;
        $extensions = ['pdf'];
        self::assertFalse($service->hasSubmittedSample($field, ['field-one' => $token]));
        $extensions = ['png'];
        $images = array_values(array_filter($service->getCatalog(), static fn (array $file) => $file['kind'] === 'image'));
        self::assertCount(5, $images);
        foreach ($images as $image) {
            $imageToken = $service->token($field, $image);
            self::assertTrue($service->hasSubmittedSample($field, ['field-one' => $imageToken]));
            $path = tempnam(sys_get_temp_dir(), 'freeform-variant-');

            try {
                file_put_contents($path, base64_decode($image['data']));
                self::assertTrue($service->isSampleUpload($field, ['name' => $image['name'], 'tmp_name' => $path, 'error' => \UPLOAD_ERR_OK]));
                file_put_contents($path, str_repeat('x', $image['size']));
                self::assertFalse($service->isSampleUpload($field, ['name' => $image['name'], 'tmp_name' => $path, 'error' => \UPLOAD_ERR_OK]));
            } finally {
                unlink($path);
            }
        }
    }

    public function testNativeFixtureUploadReturnsNoAssetsBeforeFolderCreation(): void
    {
        $files = $this->getMockBuilder(FilesService::class)->onlyMethods(['getValidExtensions', 'getFileUploadFolder'])->getMock();
        $files->method('getValidExtensions')->willReturn(['txt']);
        $files->expects(self::never())->method('getFileUploadFolder');
        $field = $this->createMock(FileUploadField::class);
        $field->method('getAssetSourceId')->willReturn(1);
        $field->method('getHandle')->willReturn('upload');
        $field->method('isSampleDataEnabled')->willReturn(true);
        $field->method('getMaxFileSizeBytes')->willReturn(100000);
        $file = (new SampleFileService($files))->getForField($field);
        $path = tempnam(sys_get_temp_dir(), 'freeform-sample-');
        $original = $_FILES;

        try {
            file_put_contents($path, base64_decode($file['data']));
            $_FILES = ['upload' => ['name' => [$file['name']], 'tmp_name' => [$path], 'error' => [\UPLOAD_ERR_OK], 'size' => [$file['size']], 'type' => [$file['mime']]]];
            self::assertSame([], $files->uploadFile($field, $this->createMock(Form::class))->getAssetIds());
        } finally {
            $_FILES = $original;
            unlink($path);
        }
    }

    public function testRequiredUploadsAcceptOnlyVerifiedMarkersForBothUploadTypes(): void
    {
        $original = $_FILES;
        $_FILES = [];

        try {
            foreach ([FileUploadField::class, FileDragAndDropField::class] as $class) {
                foreach ([true, false] as $valid) {
                    $form = $this->createMock(Form::class);
                    $field = $this->createMock($class);
                    $field->method('getHandle')->willReturn('sampleValidation');
                    $field->method('isRequired')->willReturn(true);
                    $field->method('getValue')->willReturn([]);
                    $field->expects($valid ? self::never() : self::once())->method('addError');
                    $files = $this->createMock(FilesService::class);
                    $samples = $this->createMock(SampleFileService::class);
                    $samples->expects(self::once())->method('hasSubmittedSample')->with($field)->willReturn($valid);
                    $helper = new FileUploadValidationHelper($files);
                    $validator = FileUploadField::class === $class
                        ? new FileUploadValidation($files, $helper, sampleFiles: $samples)
                        : new FileDragAndDropUploadValidation($files, $helper, $samples);

                    try {
                        $validator->validate(new ValidateEvent($form, $field));
                    } finally {
                        Event::off(FieldInterface::class, FieldInterface::EVENT_VALIDATE, [$validator, 'validate']);
                    }
                }
            }
        } finally {
            $_FILES = $original;
        }
    }
}

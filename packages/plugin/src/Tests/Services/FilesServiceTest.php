<?php

namespace Solspace\Freeform\Tests\Services;

use craft\web\UploadedFile;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Events\Files\UploadEvent;
use Solspace\Freeform\Fields\Implementations\Pro\FileDragAndDropField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Form\Layout\Page\Buttons\PageButtons;
use Solspace\Freeform\Services\FilesService;

#[CoversClass(FilesService::class)]
class FilesServiceTest extends TestCase
{
    private array $originalFiles;
    private array $originalPost;

    protected function setUp(): void
    {
        $this->originalFiles = $_FILES;
        $this->originalPost = $_POST;
        $_FILES = $_POST = [];
        UploadedFile::reset();
    }

    protected function tearDown(): void
    {
        $_FILES = $this->originalFiles;
        $_POST = $this->originalPost;
        UploadedFile::reset();
    }

    #[DataProvider('uploadProvider')]
    public function testUploadRestrictionsWithoutFormValidation(
        string $name,
        int $size,
        int $error,
        bool $navigateBack,
        bool $accepted,
        ?string $expectedError,
        bool $alreadyValidated = false
    ): void {
        $_FILES['attachment'] = [
            'name' => $name,
            'tmp_name' => '/tmp/freeform-upload-test',
            'size' => $size,
            'error' => $error,
            'type' => 'image/png',
        ];
        if ($navigateBack) {
            $_POST[PageButtons::INPUT_NAME_PREVIOUS_PAGE] = '';
        }

        $form = $this->createMock(Form::class);
        $field = $this->getMockBuilder(FileDragAndDropField::class)
            ->setConstructorArgs([$form])
            ->onlyMethods(['getHandle', 'getAssetSourceId', 'getMaxFileSizeKB'])
            ->getMock()
        ;
        $field->method('getHandle')->willReturn('attachment');
        $field->method('getAssetSourceId')->willReturn(1);
        $field->method('getMaxFileSizeKB')->willReturn(1);
        if ($alreadyValidated) {
            $field->validate($form);
        }

        $service = $this->getMockBuilder(FilesService::class)
            ->onlyMethods(['getValidExtensions', 'getFileUploadFolder'])
            ->getMock()
        ;
        $service->method('getValidExtensions')->willReturn(['png']);
        $service->expects($this->never())->method('getFileUploadFolder');

        // Stop accepted uploads at the first side effect; rejected uploads must never reach it.
        $reachedUpload = false;
        $service->on(FilesService::EVENT_BEFORE_UPLOAD, static function (UploadEvent $event) use (&$reachedUpload) {
            $reachedUpload = true;
            $event->isValid = false;
        });

        $this->assertTrue($field->isValid(), 'No field errors have been recorded.');
        $this->assertNull($service->uploadDragAndDropFile($field, $form));
        $this->assertSame($accepted, $reachedUpload);
        if (null !== $expectedError) {
            $this->assertStringContainsString($expectedError, implode(' ', $field->getErrors()));
        } elseif ($accepted) {
            $this->assertSame([], $field->getErrors());
        }
    }

    public static function uploadProvider(): iterable
    {
        yield 'accepts an already validated field without validating it twice' => ['image.png', 1024, \UPLOAD_ERR_OK, false, true, null, true];

        foreach ([false, true] as $navigateBack) {
            $context = $navigateBack ? 'back navigation' : 'no prior validation (headless)';

            yield $context.' rejects a disallowed extension' => ['image.svg', 512, \UPLOAD_ERR_OK, $navigateBack, false, 'not an allowed file extension'];

            yield $context.' rejects a script with an image MIME type' => ['image.js', 512, \UPLOAD_ERR_OK, $navigateBack, false, 'not an allowed file extension'];

            yield $context.' rejects one byte over the size limit' => ['image.png', 1025, \UPLOAD_ERR_OK, $navigateBack, false, 'maximum file upload size'];

            yield $context.' accepts the exact size limit' => ['image.png', 1024, \UPLOAD_ERR_OK, $navigateBack, true, null];

            yield $context.' accepts an uppercase extension' => ['image.PNG', 512, \UPLOAD_ERR_OK, $navigateBack, true, null];

            yield $context.' rejects a failed upload' => ['image.png', 512, \UPLOAD_ERR_PARTIAL, $navigateBack, false, null];
        }
    }
}

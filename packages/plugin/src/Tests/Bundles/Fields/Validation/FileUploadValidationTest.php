<?php

namespace Solspace\Freeform\Tests\Bundles\Fields\Validation;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Fields\Implementations\FileUpload\FileUploadAssetBundle;
use Solspace\Freeform\Bundles\Fields\Validation\FileUploadValidation;
use Solspace\Freeform\Bundles\Fields\Validation\Helpers\FileUploadValidationHelper;
use Solspace\Freeform\Events\Fields\ValidateEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\FileUploadField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Security\RemoteUrlValidator;
use Solspace\Freeform\Services\FilesService;
use yii\base\Event;

#[CoversClass(FileUploadValidation::class)]
class FileUploadValidationTest extends TestCase
{
    private ?FileUploadValidation $validation = null;

    protected function tearDown(): void
    {
        if ($this->validation) {
            Event::off(
                FieldInterface::class,
                FieldInterface::EVENT_VALIDATE,
                [$this->validation, 'validate'],
            );
        }

        FileUploadAssetBundle::$filesUploaded = [];
        FileUploadAssetBundle::$filesUploadedErrors = [];
    }

    public function testGraphQlUrlUploadValidatesSuppliedFilenameExtension(): void
    {
        $arguments = [
            'attachment' => [[
                'filename' => 'shell.php',
                'url' => 'https://public.example/image.png',
            ]],
        ];

        $form = $this->createMock(Form::class);
        $form->method('isGraphQLPosted')->willReturn(true);
        $form->method('getGraphQLArguments')->willReturn($arguments);
        $form->expects(self::once())->method('setGraphQLArguments')->with($arguments);

        $field = $this->getMockBuilder(FileUploadField::class)
            ->setConstructorArgs([$form])
            ->onlyMethods(['getHandle', 'getFileCount', 'isRequired'])
            ->getMock()
        ;
        $field->method('getHandle')->willReturn('attachment');
        $field->method('getFileCount')->willReturn(1);
        $field->method('isRequired')->willReturn(false);

        $filesService = $this->getMockBuilder(FilesService::class)
            ->onlyMethods(['getValidExtensions'])
            ->getMock()
        ;
        $filesService->method('getValidExtensions')->willReturn(['png']);

        $urlValidator = new RemoteUrlValidator(
            static fn (string $host): array => 'public.example' === $host ? ['93.184.216.34'] : [],
        );
        $this->validation = new FileUploadValidation(
            $filesService,
            new FileUploadValidationHelper($filesService),
            $urlValidator,
        );

        $this->validation->validate(new ValidateEvent($form, $field));

        self::assertStringContainsString('not an allowed file extension', implode(' ', $field->getErrors()));
    }
}

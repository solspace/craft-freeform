<?php

namespace Solspace\Freeform\Tests\Bundles\Fields;

use craft\web\Request;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Fields\Implementations\FileUpload\FileUploadAssetBundle;
use Solspace\Freeform\Events\Forms\HandleRequestEvent;
use Solspace\Freeform\Fields\Implementations\FileUploadField;
use Solspace\Freeform\Form\Bags\PropertyBag;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Form\Layout\FormLayout;
use Solspace\Freeform\Library\Collections\FieldCollection;
use Solspace\Freeform\Library\Exceptions\FieldExceptions\FileUploadException;
use Solspace\Freeform\Library\FileUploads\FileUploadResponse;
use Solspace\Freeform\Services\FilesService;
use yii\base\Event;

#[CoversClass(FileUploadAssetBundle::class)]
class FileUploadAssetBundleTest extends TestCase
{
    private ?FileUploadAssetBundle $bundle = null;

    protected function tearDown(): void
    {
        FileUploadAssetBundle::$filesUploaded = [];
        FileUploadAssetBundle::$filesUploadedErrors = [];
        if ($this->bundle) {
            Event::off(Form::class, Form::EVENT_AFTER_HANDLE_REQUEST, [$this->bundle, 'uploadFiles']);
        }
    }

    #[TestWith([[]])]
    #[TestWith([[123]])]
    public function testUploadErrorsPreventSubmissionEvenWhenAnotherFileSucceeded(array $assetIds): void
    {
        $form = $this->createMock(Form::class);
        $field = new FileUploadField($form);
        $layout = $this->createMock(FormLayout::class);
        $layout->method('getFields')->willReturn(new FieldCollection([$field]));
        $form->method('getLayout')->willReturn($layout);
        $form->method('isValid')->willReturn(true);
        $form->method('getProperties')->willReturn(new PropertyBag($form));
        $service = $this->createMock(FilesService::class);
        $message = 'HEIC photos cannot be converted on this server. Please upload a JPG or PNG photo instead.';
        $service->method('uploadFile')->willReturn(new FileUploadResponse($assetIds, [$message]));
        $this->bundle = new FileUploadAssetBundle($service);

        try {
            $this->bundle->uploadFiles(new HandleRequestEvent($form, $this->createMock(Request::class)));
            self::fail('A failed photo conversion must prevent submission.');
        } catch (FileUploadException $exception) {
            self::assertSame($message, $exception->getMessage());
            self::assertContains($message, $field->getErrors());
            self::assertFalse($field->isValid());
        }
    }
}

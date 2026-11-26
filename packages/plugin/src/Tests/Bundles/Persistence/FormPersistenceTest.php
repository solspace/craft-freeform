<?php

namespace Solspace\Freeform\Tests\Bundles\Persistence;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Attributes\Form\SettingsProvider;
use Solspace\Freeform\Bundles\Persistence\FormPersistence;
use Solspace\Freeform\Events\Forms\PersistFormEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\FileUploads\UploadVolumePolicy;
use Solspace\Freeform\Records\FormRecord;
use Solspace\Freeform\Services\FormsService;

#[CoversClass(FormPersistence::class)]
class FormPersistenceTest extends TestCase
{
    private mixed $previousApp;

    protected function setUp(): void
    {
        $this->previousApp = \Craft::$app;
        \Craft::$app = new class {
            public function getUser(): object
            {
                return new class {
                    public function getIdentity(): object
                    {
                        return (object) ['id' => 1];
                    }
                };
            }
        };
    }

    protected function tearDown(): void
    {
        \Craft::$app = $this->previousApp;
    }

    public function testDuplicateHandleOnExistingFormReturnsFieldErrorInsteadOfSuccess(): void
    {
        [$bundle, $forms, $record, $event] = $this->fixture();
        $record->expects(self::once())->method('save')->willReturn(false);
        $record->method('getErrors')->willReturn(['handle' => ['Handle has already been taken.']]);
        $forms->expects(self::never())->method('getFormById');

        $this->update($bundle, $event, $record);

        self::assertSame(400, $event->getStatus());
        self::assertSame(['general' => ['handle' => ['Handle has already been taken.']]], $event->getErrorsFor('form'));
        self::assertNull($event->getForm());
    }

    public function testNewFormRecordErrorsKeepCreateModalFormat(): void
    {
        [$bundle, $forms, $record, $event] = $this->fixture(isNew: true);
        $record->expects(self::once())->method('save')->willReturn(false);
        $record->method('getErrors')->willReturn(['handle' => ['Handle has already been taken.']]);
        $forms->expects(self::never())->method('getFormById');

        $this->update($bundle, $event, $record);

        self::assertSame(400, $event->getStatus());
        self::assertSame(['name' => ['Handle has already been taken.']], $event->getErrorsFor('form'));
    }

    public function testValidSaveStillLoadsPersistedForm(): void
    {
        [$bundle, $forms, $record, $event] = $this->fixture();
        $form = $this->createMock(Form::class);
        $record->expects(self::once())->method('save')->willReturn(true);
        $forms->expects(self::once())->method('getFormById')->with(7)->willReturn($form);

        $this->update($bundle, $event, $record);

        self::assertFalse($event->hasErrors());
        self::assertSame($form, $event->getForm());
    }

    public function testBuilderSavePreservesOnlyTheStoredRetainedFieldIds(): void
    {
        [$bundle, , $record, $event] = $this->fixture(metadata: '{"retainedFieldIds":[42]}');
        $event->getPayload()->form->settings->retainedFieldIds = [9];
        $metadata = null;
        $record->method('__set')->willReturnCallback(static function (string $attribute, mixed $value) use (&$metadata): void {
            if ('metadata' === $attribute) {
                $metadata = $value;
            }
        });
        $record->expects(self::once())->method('save')->willReturn(true);

        $this->update($bundle, $event, $record);
        self::assertFalse($event->hasErrors());
        self::assertSame([42], $metadata[FormRecord::RETAINED_FIELD_IDS]);
    }

    public function testDisallowedUploadDestinationDoesNotWriteFormOrLoadPersistedValues(): void
    {
        [$bundle, $forms, $record, $event] = $this->fixture();
        $policy = $this->createMock(UploadVolumePolicy::class);
        $errors = ['upload' => ['assetSourceId' => ['Choose an allowed upload volume.']]];
        $policy->method('validatePayload')->with($event->getPayload())->willReturn($errors);
        (new \ReflectionProperty(FormPersistence::class, 'uploadVolumePolicy'))->setValue($bundle, $policy);
        $record->expects(self::never())->method('save');
        $forms->expects(self::never())->method('getFormById');
        $this->update($bundle, $event, $record);
        self::assertSame(400, $event->getStatus());
        self::assertSame($errors, $event->getErrorsFor('fields'));
    }

    public function testSettingsValidationFailureDoesNotSaveOrLoadForm(): void
    {
        [$bundle, $forms, $record, $event] = $this->fixture();
        $event->addErrorsToResponse('form', ['general' => ['name' => ['Name is required.']]]);
        $record->expects(self::never())->method('save');
        $forms->expects(self::never())->method('getFormById');

        $this->update($bundle, $event, $record);

        self::assertSame(400, $event->getStatus());
        self::assertNull($event->getForm());
    }

    private function fixture(bool $isNew = false, string $metadata = '{}'): array
    {
        $forms = $this->createMock(FormsService::class);
        $settings = $this->createMock(SettingsProvider::class);
        $settings->method('getSettingNamespaces')->willReturn([]);
        $bundle = (new \ReflectionClass(FormPersistence::class))->newInstanceWithoutConstructor();
        (new \ReflectionProperty(FormPersistence::class, 'formsService'))->setValue($bundle, $forms);
        (new \ReflectionProperty(FormPersistence::class, 'settingsProvider'))->setValue($bundle, $settings);
        (new \ReflectionProperty(FormPersistence::class, 'uploadVolumePolicy'))->setValue($bundle, $this->createMock(UploadVolumePolicy::class));

        $record = $this->getMockBuilder(FormRecord::class)
            ->disableOriginalConstructor()
            ->onlyMethods(['__get', '__set', 'getIsNewRecord', 'save', 'getErrors'])
            ->getMock()
        ;
        $record->method('__get')->willReturnMap([
            ['id', $isNew ? null : 7],
            ['metadata', $metadata],
        ]);
        $record->method('getIsNewRecord')->willReturn($isNew);
        $event = new PersistFormEvent((object) [
            'form' => (object) [
                'settings' => (object) [
                    'general' => (object) ['name' => 'Rating', 'handle' => 'existingHandle'],
                ],
            ],
        ], $isNew ? null : 7);

        return [$bundle, $forms, $record, $event];
    }

    private function update(FormPersistence $bundle, PersistFormEvent $event, FormRecord $record): void
    {
        (new \ReflectionMethod(FormPersistence::class, 'update'))->invoke($bundle, $event, $record);
    }
}

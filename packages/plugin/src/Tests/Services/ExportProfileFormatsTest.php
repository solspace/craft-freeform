<?php

namespace Solspace\Freeform\Tests\Services;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Export\Collections\FieldDescriptorCollection;
use Solspace\Freeform\Elements\Db\SubmissionQuery;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Configuration\ExportFormatting;
use Solspace\Freeform\Models\Pro\ExportProfileModel;
use Solspace\Freeform\Records\Pro\ExportNotificationRecord;
use Solspace\Freeform\Services\Pro\ExportProfilesService;
use Solspace\Freeform\Tests\Helpers\UsesCraft6Container;
use yii\web\BadRequestHttpException;

#[CoversClass(ExportProfilesService::class)]
#[CoversClass(ExportNotificationRecord::class)]
class ExportProfileFormatsTest extends TestCase
{
    use UsesCraft6Container;

    public function testExistingProfilesAllowAllRegisteredFormatsIncludingExtensions(): void
    {
        $service = $this->service();
        $profile = new ExportProfileModel();
        self::assertSame(['excel', 'csv', 'json', 'xml', 'text', 'custom'], array_keys($service->getAllowedExporterTypes($profile)));
        self::assertTrue($service->validateAllowedExportTypes($profile));
        self::assertFalse($service->isExportTypeAllowed($profile, 'unknown'));
    }

    public function testRestrictedProfilesOnlyOfferSelectedFormatsInRegisteredOrder(): void
    {
        $service = $this->service();
        $profile = new ExportProfileModel(['allowedExportTypes' => ['json', 'csv']]);
        self::assertSame(['csv' => 'CSV', 'json' => 'JSON'], $service->getAllowedExporterTypes($profile));
        self::assertTrue($service->validateAllowedExportTypes($profile));
        self::assertFalse($service->isExportTypeAllowed($profile, 'excel'));
    }

    #[TestWith([[]])]
    #[TestWith([['unknown']])]
    #[TestWith([['csv', ['excel']]])]
    public function testEmptyUnknownOrMalformedSelectionsCannotBeSaved(array $types): void
    {
        $profile = new ExportProfileModel(['allowedExportTypes' => $types]);
        self::assertFalse($this->service()->save($profile));
        self::assertTrue($profile->hasErrors('allowedExportTypes'));
    }

    public function testRemovingAFormatUsedByAnActiveNotificationIsBlocked(): void
    {
        $service = $this->service([$this->notification('excel')]);
        $profile = new ExportProfileModel(['id' => 12, 'allowedExportTypes' => ['csv']]);
        self::assertFalse($service->save($profile));
        self::assertStringContainsString('active export notification', $profile->getFirstError('allowedExportTypes'));
    }

    public function testFormatsCanBeRemovedWhenNoActiveNotificationUsesThem(): void
    {
        $service = $this->service([$this->notification('csv')]);
        $profile = new ExportProfileModel(['id' => 12, 'allowedExportTypes' => ['csv']]);
        self::assertTrue($service->validateAllowedExportTypes($profile));
    }

    public function testDisallowedDownloadIsRejectedBeforeLoadingSubmissions(): void
    {
        $profile = $this->getMockBuilder(ExportProfileModel::class)->onlyMethods(['getForm', 'getQuery', 'getFieldDescriptors'])->getMock();
        $profile->allowedExportTypes = ['csv'];
        $profile->expects(self::never())->method('getForm');
        $profile->expects(self::never())->method('getQuery');
        $profile->expects(self::never())->method('getFieldDescriptors');

        $this->expectException(BadRequestHttpException::class);
        $this->service()->createProfileExporter('excel', $profile);
    }

    #[TestWith(['csv', false])]
    #[TestWith(['excel', true])]
    #[TestWith(['unknown', true])]
    public function testNotificationFileTypesAreValidatedAgainstTheirProfile(string $type, bool $invalid): void
    {
        $previousApp = \Yii::$app;
        $service = $this->service();
        $plugin = $this->getMockBuilder(Freeform::class)->disableOriginalConstructor()->onlyMethods(['__get'])->getMock();
        $plugin->method('__get')->with('exportProfiles')->willReturn($service);
        app()->instance(Freeform::class, $plugin);
        \Yii::$app = (object) ['loadedModules' => [Freeform::class => $plugin]];

        try {
            $notification = $this->notification($type, new ExportProfileModel(['allowedExportTypes' => ['csv']]));
            $notification->validateFileType('fileType');
            self::assertSame($invalid, $notification->hasErrors('fileType'));
        } finally {
            \Yii::$app = $previousApp;
        }
    }

    public function testMissingNotificationProfilesProduceAValidationError(): void
    {
        $notification = $this->notification('csv');
        $notification->validateFileType('fileType');
        self::assertTrue($notification->hasErrors('profileId'));
    }

    public function testScheduledExportsUseProfileFormattingWithoutAnInteractiveUser(): void
    {
        $previous = \Craft::$app;
        \Craft::$app = new class {
            public object $projectConfig;

            public function __construct()
            {
                $this->projectConfig = new class {
                    public function get($key)
                    {
                        return 'Europe/Berlin';
                    }
                };
            }

            public function getUser(): void
            {
                throw new \LogicException('Scheduled exports have no interactive user.');
            }
        };

        try {
            $profile = $this->getMockBuilder(ExportProfileModel::class)->onlyMethods(['getForm', 'getQuery', 'getFieldDescriptors'])->getMock();
            $profile->method('getForm')->willReturn($this->createMock(Form::class));
            $profile->method('getQuery')->willReturn($this->createMock(SubmissionQuery::class));
            $profile->method('getFieldDescriptors')->willReturn(new FieldDescriptorCollection());
            $profile->formatting = ['headings' => 'handles', 'options' => 'values', 'multiline' => 'singleLine', 'tracking' => 'include'];
            $exporter = (new ExportProfilesService())->createProfileExporter('csv', $profile);
            self::assertTrue($exporter->getSettings()->isHandlesAsNames());
            self::assertFalse($exporter->getSettings()->isExportLabels());
            self::assertTrue($exporter->getSettings()->isRemoveNewlines());
            self::assertTrue($exporter->getSettings()->isExportTrackedUrlParameters());
            self::assertSame('Europe/Berlin', $exporter->getSettings()->getTimezone());
        } finally {
            \Craft::$app = $previous;
        }
    }

    #[TestWith([['headings' => 'handles']])]
    #[TestWith([['headings' => ['labels']]])]
    #[TestWith([['headings' => 'unknown']])]
    public function testMalformedFormattingCannotReplaceAProfile(array $formatting): void
    {
        $profile = new ExportProfileModel(['formatting' => $formatting]);
        self::assertFalse($this->service()->save($profile));
        self::assertTrue($profile->hasErrors('formatting'));
    }

    public function testNewProfilesHaveCompleteIndependentFormattingDefaults(): void
    {
        $first = new ExportProfileModel();
        $second = new ExportProfileModel();
        $first->formatting['headings'] = 'handles';
        self::assertSame(ExportFormatting::DEFAULTS, $second->formatting);
        self::assertTrue(ExportFormatting::isValid($second->formatting));
    }

    private function service(array $activeNotifications = []): ExportProfilesService
    {
        $service = $this->getMockBuilder(ExportProfilesService::class)->onlyMethods(['getExporterTypes', 'getActiveNotificationsForProfile'])->getMock();
        $service->method('getExporterTypes')->willReturn(['excel' => 'Excel', 'csv' => 'CSV', 'json' => 'JSON', 'xml' => 'XML', 'text' => 'Text', 'custom' => 'Custom']);
        $service->method('getActiveNotificationsForProfile')->willReturn($activeNotifications);

        return $service;
    }

    private function notification(string $type, ?ExportProfileModel $profile = null): ExportNotificationRecord
    {
        $notification = new ExportFormatTestNotification();
        $notification->testProfile = $profile;
        $notification->fileType = $type;
        $notification->name = 'Sales report';

        return $notification;
    }
}

class ExportFormatTestNotification extends ExportNotificationRecord
{
    public string $fileType;
    public string $name;
    public ?ExportProfileModel $testProfile = null;

    public function __construct() {}

    public function getProfile(): ?ExportProfileModel
    {
        return $this->testProfile;
    }
}

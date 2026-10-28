<?php

namespace Solspace\Freeform\Tests\Services;

use craft\web\Request;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\controllers\SubmissionsController;
use Solspace\Freeform\Elements\Actions\ExportCSVAction;
use Solspace\Freeform\Elements\Db\SubmissionQuery;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Exceptions\FreeformException;
use Solspace\Freeform\Services\Pro\ExportProfilesService;
use yii\web\BadRequestHttpException;
use yii\web\Response;

#[CoversClass(ExportProfilesService::class)]
#[CoversClass(ExportCSVAction::class)]
#[CoversClass(SubmissionsController::class)]
class SubmissionExportSelectionTest extends TestCase
{
    public function testMixedFormSelectionIsRejectedBeforeContentCanDropSubmissions(): void
    {
        $query = $this->queryWithFormIds(['12', '34', '12']);
        $query->expects(self::never())->method('one');

        $this->expectException(BadRequestHttpException::class);
        $this->expectExceptionMessage('Submissions from multiple forms cannot be exported together. Please select submissions from a single form and try again.');

        (new ExportProfilesService())->getSubmissionForExport($query);
    }

    public function testSingleFormSelectionLoadsContentWithoutChangingTheSelectedIds(): void
    {
        $query = $this->queryWithFormIds(['12', '12']);
        $query->id = [101, 102];
        $submission = $this->createMock(Submission::class);
        $query->expects(self::once())->method('one')->willReturnCallback(static function () use ($query, $submission) {
            self::assertFalse($query->skipContent);
            self::assertSame([101, 102], $query->id);
            self::assertNull($query->select);

            return $submission;
        });

        self::assertSame($submission, (new ExportProfilesService())->getSubmissionForExport($query));
    }

    public function testEmptySelectionDoesNotLoadOrExportContent(): void
    {
        $query = $this->queryWithFormIds([]);
        $query->expects(self::never())->method('one');

        $this->expectException(FreeformException::class);
        $this->expectExceptionMessage('No submissions found');

        (new ExportProfilesService())->getSubmissionForExport($query);
    }

    public function testSubmissionRemovedAfterValidationIsHandled(): void
    {
        $query = $this->queryWithFormIds(['12']);
        $query->expects(self::once())->method('one')->willReturn(null);

        $this->expectException(FreeformException::class);
        $this->expectExceptionMessage('No submissions found');

        (new ExportProfilesService())->getSubmissionForExport($query);
    }

    public function testElementActionReportsMixedFormValidationWithoutExporting(): void
    {
        $previousApp = \Yii::$app;
        $service = $this->getMockBuilder(ExportProfilesService::class)->onlyMethods(['getExportSettings', 'outputFile'])->getMock();
        $service->expects(self::never())->method('getExportSettings');
        $service->expects(self::never())->method('outputFile');
        $plugin = $this->getMockBuilder(Freeform::class)->disableOriginalConstructor()->onlyMethods(['__get'])->getMock();
        $plugin->method('__get')->with('exportProfiles')->willReturn($service);
        \Yii::$app = (object) ['loadedModules' => [Freeform::class => $plugin]];

        try {
            $query = $this->queryWithFormIds(['12', '34']);
            $query->expects(self::never())->method('one');
            $action = new ExportCSVAction();

            self::assertFalse($action->performAction($query));
            self::assertSame('Submissions from multiple forms cannot be exported together. Please select submissions from a single form and try again.', $action->getMessage());
        } finally {
            \Yii::$app = $previousApp;
        }
    }

    public function testControllerValidatesAllPostedIdsBeforeExporting(): void
    {
        $previousApp = \Craft::$app;
        $request = $this->createMock(Request::class);
        $request->method('post')->with('submissionIds')->willReturn('101,102');
        \Craft::$app = (object) ['request' => $request];

        try {
            $service = $this->createMock(ExportProfilesService::class);
            $service->expects(self::never())->method('export');
            $service->expects(self::once())->method('getSubmissionForExport')->willReturnCallback(static function (SubmissionQuery $query) {
                self::assertSame(['101', '102'], $query->id);
                self::assertNull($query->formId);

                throw new BadRequestHttpException('Mixed-form export rejected');
            });
            $controller = $this->getMockBuilder(SubmissionsController::class)
                ->disableOriginalConstructor()
                ->onlyMethods(['requirePostRequest', 'getExportProfileService'])
                ->getMock()
            ;
            $controller->expects(self::once())->method('requirePostRequest');
            $controller->method('getExportProfileService')->willReturn($service);

            $this->expectException(BadRequestHttpException::class);
            $this->expectExceptionMessage('Mixed-form export rejected');

            $controller->actionExport();
        } finally {
            \Craft::$app = $previousApp;
        }
    }

    #[TestWith([true])]
    #[TestWith([false])]
    public function testValidationEndpointReturnsInlineErrorsWithoutStartingAnExport(bool $mixedForms): void
    {
        $previousApp = \Craft::$app;
        $request = $this->createMock(Request::class);
        $request->method('post')->with('submissionIds')->willReturn('101,102');
        \Craft::$app = (object) ['request' => $request];

        try {
            $message = $mixedForms ? 'Select submissions from a single form.' : 'No submissions found';
            $service = $this->createMock(ExportProfilesService::class);
            $service->expects(self::never())->method('export');
            $service->expects(self::once())->method('getSubmissionForExport')->willThrowException(
                $mixedForms ? new BadRequestHttpException($message) : new FreeformException($message)
            );
            $controller = $this->getMockBuilder(SubmissionsController::class)
                ->disableOriginalConstructor()
                ->onlyMethods(['requirePostRequest', 'getExportProfileService', 'asJson'])
                ->getMock()
            ;
            $controller->expects(self::once())->method('requirePostRequest');
            $controller->method('getExportProfileService')->willReturn($service);
            $controller->method('asJson')->willReturnCallback(static fn ($data) => new Response(['charset' => 'UTF-8', 'data' => $data]));

            self::assertSame(['success' => false, 'message' => $message], $controller->actionValidateExport()->data);
        } finally {
            \Craft::$app = $previousApp;
        }
    }

    private function queryWithFormIds(array $formIds): SubmissionQuery
    {
        $query = $this->getMockBuilder(SubmissionExportSelectionQuery::class)
            ->disableOriginalConstructor()
            ->onlyMethods(['one'])
            ->getMock()
        ;
        $query->selectedFormIds = $formIds;

        return $query;
    }
}

class SubmissionExportSelectionQuery extends SubmissionQuery
{
    public array $selectedFormIds = [];

    public function column($db = null): array
    {
        // Reproduce the query's single-form inference when content is loaded.
        return $this->skipContent ? $this->selectedFormIds : \array_slice($this->selectedFormIds, 0, 1);
    }
}

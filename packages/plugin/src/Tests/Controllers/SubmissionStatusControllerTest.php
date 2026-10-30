<?php

namespace Solspace\Freeform\Tests\Controllers;

use craft\services\Elements;
use craft\web\Request;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\controllers\SpamSubmissionsController;
use Solspace\Freeform\controllers\SubmissionsController;
use Solspace\Freeform\Elements\SpamSubmission;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Models\StatusModel;
use Solspace\Freeform\Services\SpamSubmissionsService;
use Solspace\Freeform\Services\StatusesService;
use Solspace\Freeform\Services\SubmissionsService;
use Solspace\Freeform\Services\SubmissionUndoService;
use yii\web\BadRequestHttpException;
use yii\web\ForbiddenHttpException;
use yii\web\HttpException;
use yii\web\Response;

#[CoversClass(SubmissionsController::class)]
class SubmissionStatusControllerTest extends TestCase
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

    #[TestWith([false])]
    #[TestWith([true])]
    public function testSavesOnlyTheStatusThroughTheElementLifecycle(bool $spam): void
    {
        [$controller, $submission, $elements] = $this->fixture(spam: $spam);
        $submission->title = 'Original title';
        $submission->userId = 19;
        $elements->expects(self::once())->method('saveElement')->with(self::callback(static function (Submission $saved) use ($submission, $spam): bool {
            self::assertSame($submission, $saved);
            self::assertSame(2, $saved->statusId);
            self::assertSame('Original title', $saved->title);
            self::assertSame(19, $saved->userId);
            self::assertSame($spam, $saved->isSpam);

            return true;
        }))->willReturn(true);

        self::assertSame(['success' => true, 'undoHistory' => []], $controller->actionSetStatus()->data);
    }

    #[TestWith([false])]
    #[TestWith([true])]
    public function testReadOnlySubmissionsCannotBeUpdated(bool $spam): void
    {
        [$controller, , $elements] = $this->fixture(editable: false, spam: $spam);
        $elements->expects(self::never())->method('saveElement');
        $this->expectException(ForbiddenHttpException::class);
        $controller->actionSetStatus();
    }

    #[TestWith([['submissionId' => [10]]])]
    #[TestWith([['submissionId' => -1]])]
    #[TestWith([['statusId' => 'invalid']])]
    #[TestWith([['statusId' => 0]])]
    #[TestWith([['statusId' => [2]]])]
    public function testMalformedIdsAreRejected(array $params): void
    {
        [$controller, , $elements] = $this->fixture($params);
        $elements->expects(self::never())->method('saveElement');
        $this->expectException(BadRequestHttpException::class);
        $controller->actionSetStatus();
    }

    public function testUnknownStatusCannotBeSaved(): void
    {
        [$controller, , $elements] = $this->fixture(['statusId' => 999]);
        $elements->expects(self::never())->method('saveElement');
        $this->expectException(BadRequestHttpException::class);
        $controller->actionSetStatus();
    }

    #[TestWith(['isHidden'])]
    #[TestWith(['trashed'])]
    public function testUnavailableSubmissionsCannotBeUpdated(string $property): void
    {
        [$controller, $submission, $elements] = $this->fixture();
        $submission->{$property} = true;
        $elements->expects(self::never())->method('saveElement');
        $this->expectException(HttpException::class);
        $controller->actionSetStatus();
    }

    public function testMissingSubmissionIsRejected(): void
    {
        [$controller, , $elements] = $this->fixture(['submissionId' => 999]);
        $elements->expects(self::never())->method('saveElement');
        $this->expectException(HttpException::class);
        $controller->actionSetStatus();
    }

    public function testUnchangedStatusDoesNotSave(): void
    {
        [$controller, , $elements] = $this->fixture(['statusId' => 1]);
        $elements->expects(self::never())->method('saveElement');
        self::assertTrue($controller->actionSetStatus()->data['success']);
    }

    #[TestWith([false])]
    #[TestWith([true])]
    public function testFailedSaveReturnsAnError(bool $spam): void
    {
        [$controller, , $elements] = $this->fixture(spam: $spam);
        $elements->expects(self::once())->method('saveElement')->willReturn(false);
        self::assertFalse($controller->actionSetStatus()->data['success']);
        self::assertSame(422, $controller->response->statusCode);
    }

    #[TestWith([false, true])]
    #[TestWith([true, false])]
    public function testRequiresAPostFromTheControlPanel(bool $cp, bool $post): void
    {
        [$controller, , $elements] = $this->fixture(cp: $cp, post: $post);
        $elements->expects(self::never())->method('saveElement');
        $this->expectException($cp ? HttpException::class : BadRequestHttpException::class);
        $controller->actionSetStatus();
    }

    private function fixture(array $params = [], bool $editable = true, bool $cp = true, bool $post = true, bool $spam = false): array
    {
        $params += ['submissionId' => 10, 'statusId' => 2];
        $request = $this->createStub(Request::class);
        $request->method('getIsCpRequest')->willReturn($cp);
        $request->method('getIsPost')->willReturn($post);
        $request->method('getAcceptsJson')->willReturn(true);
        $request->method('getRequiredBodyParam')->willReturnCallback(static fn ($key) => $params[$key]);
        $submission = $this->createMock($spam ? SpamSubmission::class : Submission::class);
        $submission->id = 10;
        $submission->isSpam = $spam;
        $submission->statusId = 1;
        $submission->method('getIsEditable')->willReturn($editable);
        $submission->expects(self::never())->method('setFormFieldValues');
        $submissions = $this->createStub($spam ? SpamSubmissionsService::class : SubmissionsService::class);
        $submissions->method('getSubmissionById')->willReturnCallback(static fn ($id) => 10 === $id ? $submission : null);
        $statuses = $this->createStub(StatusesService::class);
        $statuses->method('getStatusById')->willReturnCallback(static fn ($id) => \in_array($id, [1, 2], true) ? new StatusModel() : null);
        $elements = $this->createMock(Elements::class);
        \Craft::$app = new class($elements) {
            public function __construct(private Elements $elements) {}

            public function getElements(): Elements
            {
                return $this->elements;
            }
        };
        $serviceMethod = $spam ? 'getSpamSubmissionsService' : 'getSubmissionsService';
        $controller = $this->getMockBuilder($spam ? SpamSubmissionsController::class : SubmissionsController::class)->disableOriginalConstructor()
            ->onlyMethods([$serviceMethod, 'getStatusesService', 'getSubmissionUndoService', 'asJson'])->getMock()
        ;
        $controller->request = $request;
        $response = (new \ReflectionClass(Response::class))->newInstanceWithoutConstructor();
        $controller->response = $response;
        $controller->method($serviceMethod)->willReturn($submissions);
        $controller->method('getStatusesService')->willReturn($statuses);
        $controller->method('getSubmissionUndoService')->willReturn($this->createStub(SubmissionUndoService::class));
        $controller->method('asJson')->willReturnCallback(static function ($data) use ($response) {
            $response->data = $data;

            return $response;
        });

        return [$controller, $submission, $elements];
    }
}

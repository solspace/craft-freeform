<?php

namespace Solspace\Freeform\Tests\Controllers;

use craft\web\Request;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\controllers\SpamSubmissionsController;
use Solspace\Freeform\Elements\Db\SubmissionQuery;
use Solspace\Freeform\Elements\SpamSubmission;
use Solspace\Freeform\Services\SpamSubmissionsService;
use Solspace\Freeform\Services\SubmissionUndoService;
use yii\web\BadRequestHttpException;
use yii\web\ForbiddenHttpException;
use yii\web\HttpException;
use yii\web\NotFoundHttpException;
use yii\web\Response;

#[CoversClass(SpamSubmissionsController::class)]
class SpamReviewControllerTest extends TestCase
{
    public function testApprovalUsesTheExistingWorkflowWithoutReplacingFieldValues(): void
    {
        [$controller, $service, $submission] = $this->fixture();
        $service->expects(self::once())->method('allowSpamSubmission')->with($submission)->willReturn(true);
        $service->expects(self::never())->method('delete');
        self::assertTrue($controller->actionReview()->data['success']);
        self::assertSame('Original title', $submission->title);
        self::assertSame(2, $submission->statusId);
    }

    public function testDeleteIsScopedToOneSpamSubmissionAndCannotHardDelete(): void
    {
        [$controller, $service] = $this->fixture(['operation' => 'delete', 'hard' => true]);
        $service->expects(self::never())->method('allowSpamSubmission');
        $service->expects(self::once())->method('delete')->with(
            self::callback(static fn (SubmissionQuery $query) => 10 === $query->id && true === $query->isSpam && SpamSubmission::class === $query->elementType),
            false,
            false,
        )->willReturn(true);
        self::assertTrue($controller->actionReview()->data['success']);
    }

    #[TestWith(['approve'])]
    #[TestWith(['delete'])]
    public function testReadOnlyUsersCannotReview(string $operation): void
    {
        [$controller, $service] = $this->fixture(['operation' => $operation], editable: false);
        $service->expects(self::never())->method('allowSpamSubmission');
        $service->expects(self::never())->method('delete');
        $this->expectException(ForbiddenHttpException::class);
        $controller->actionReview();
    }

    #[TestWith([['submissionId' => [10]]])]
    #[TestWith([['submissionId' => 0]])]
    #[TestWith([['operation' => 'allow-everything']])]
    #[TestWith([['operation' => ['delete']]])]
    public function testMalformedRequestsCannotReview(array $params): void
    {
        [$controller, $service] = $this->fixture($params);
        $service->expects(self::never())->method('allowSpamSubmission');
        $service->expects(self::never())->method('delete');
        $this->expectException(BadRequestHttpException::class);
        $controller->actionReview();
    }

    #[TestWith(['isSpam', false])]
    #[TestWith(['isHidden', true])]
    #[TestWith(['trashed', true])]
    public function testUnavailableSubmissionsCannotBeReviewed(string $property, bool $value): void
    {
        [$controller, $service, $submission] = $this->fixture();
        $submission->{$property} = $value;
        $service->expects(self::never())->method('allowSpamSubmission');
        $service->expects(self::never())->method('delete');
        $this->expectException(NotFoundHttpException::class);
        $controller->actionReview();
    }

    public function testMissingSubmissionsAreRejected(): void
    {
        [$controller, $service] = $this->fixture(['submissionId' => 999]);
        $service->expects(self::never())->method('allowSpamSubmission');
        $service->expects(self::never())->method('delete');
        $this->expectException(NotFoundHttpException::class);
        $controller->actionReview();
    }

    #[TestWith(['approve', 'allowSpamSubmission'])]
    #[TestWith(['delete', 'delete'])]
    public function testFailedActionsReturnAnError(string $operation, string $method): void
    {
        [$controller, $service] = $this->fixture(['operation' => $operation]);
        $service->expects(self::once())->method($method)->willReturn(false);
        self::assertFalse($controller->actionReview()->data['success']);
        self::assertSame(422, $controller->response->statusCode);
    }

    #[TestWith([false, true])]
    #[TestWith([true, false])]
    public function testReviewRequiresAPostFromTheControlPanel(bool $cp, bool $post): void
    {
        [$controller, $service] = $this->fixture(cp: $cp, post: $post);
        $service->expects(self::never())->method('allowSpamSubmission');
        $service->expects(self::never())->method('delete');
        $this->expectException($cp ? HttpException::class : BadRequestHttpException::class);
        $controller->actionReview();
    }

    public function testActionsAreTheFirstOptionalColumnByDefault(): void
    {
        $attributes = (new \ReflectionMethod(SpamSubmission::class, 'defineDefaultTableAttributes'))->invoke(null, '*');
        self::assertSame('spamActions', $attributes[0]);
        self::assertContains('status', $attributes);
    }

    private function fixture(array $params = [], bool $editable = true, bool $cp = true, bool $post = true): array
    {
        $params += ['submissionId' => 10, 'operation' => 'approve'];
        $request = $this->createStub(Request::class);
        $request->method('getIsCpRequest')->willReturn($cp);
        $request->method('getIsPost')->willReturn($post);
        $request->method('getAcceptsJson')->willReturn(true);
        $request->method('getRequiredBodyParam')->willReturnCallback(static fn ($key) => $params[$key]);
        $submission = $this->createMock(SpamSubmission::class);
        $submission->id = 10;
        $submission->isSpam = true;
        $submission->title = 'Original title';
        $submission->statusId = 2;
        $submission->method('getIsEditable')->willReturn($editable);
        $submission->expects(self::never())->method('setFormFieldValues');
        $service = $this->createMock(SpamSubmissionsService::class);
        $service->method('getSubmissionById')->willReturnCallback(static fn ($id) => 10 === $id ? $submission : null);
        $controller = $this->getMockBuilder(SpamSubmissionsController::class)->disableOriginalConstructor()
            ->onlyMethods(['getSpamSubmissionsService', 'getSubmissionUndoService', 'asJson'])->getMock()
        ;
        $controller->method('getSpamSubmissionsService')->willReturn($service);
        $controller->method('getSubmissionUndoService')->willReturn($this->createStub(SubmissionUndoService::class));
        $controller->request = $request;
        $response = (new \ReflectionClass(Response::class))->newInstanceWithoutConstructor();
        $controller->response = $response;
        $controller->method('asJson')->willReturnCallback(static function ($data) use ($response) {
            $response->data = $data;

            return $response;
        });

        return [$controller, $service, $submission];
    }
}

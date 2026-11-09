<?php

namespace Solspace\Freeform\Tests\Controllers;

use craft\web\Request;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\controllers\SubmissionsController;
use Solspace\Freeform\Services\SubmissionUndoService;
use yii\web\BadRequestHttpException;
use yii\web\ConflictHttpException;
use yii\web\HttpException;
use yii\web\Response;

#[CoversClass(SubmissionsController::class)]
class SubmissionUndoControllerTest extends TestCase
{
    public function testSuccessfulUndoReturnsTheNextHistoryEntry(): void
    {
        [$controller, $undo] = $this->fixture();
        $undo->expects(self::once())->method('undo')->with(str_repeat('a', 32))->willReturn('status');
        $undo->method('getHistory')->willReturn([['token' => 'previous']]);
        self::assertSame(['success' => true, 'operation' => 'status', 'undoHistory' => [['token' => 'previous']]], $controller->actionUndo()->data);
    }

    public function testConflictReturnsAuthoritativeHistoryAndErrorStatus(): void
    {
        [$controller, $undo] = $this->fixture();
        $undo->method('undo')->willThrowException(new ConflictHttpException('Submission changed.'));
        $undo->method('getHistory')->willReturn([]);
        $response = $controller->actionUndo();
        self::assertSame(409, $response->statusCode);
        self::assertSame(['success' => false, 'message' => 'Submission changed.', 'undoHistory' => []], $response->data);
    }

    #[TestWith([[]])]
    #[TestWith([12])]
    #[TestWith([''])]
    #[TestWith(['invalid'])]
    public function testInvalidTokensCannotReachTheUndoService(mixed $token): void
    {
        [$controller, $undo] = $this->fixture($token);
        $undo->expects(self::never())->method('undo');
        $this->expectException(BadRequestHttpException::class);
        $controller->actionUndo();
    }

    #[TestWith([false, true])]
    #[TestWith([true, false])]
    public function testUndoRequiresACpPost(bool $cp, bool $post): void
    {
        [$controller, $undo] = $this->fixture(cp: $cp, post: $post);
        $undo->expects(self::never())->method('undo');
        $this->expectException($cp ? HttpException::class : BadRequestHttpException::class);
        $controller->actionUndo();
    }

    public function testHistoryRequiresTheControlPanelButNotAPost(): void
    {
        [$controller, $undo] = $this->fixture(post: false);
        $undo->method('getHistory')->willReturn([['token' => 'latest']]);
        self::assertSame(['success' => true, 'undoHistory' => [['token' => 'latest']]], $controller->actionUndoHistory()->data);
        [$controller] = $this->fixture(cp: false);
        $this->expectException(BadRequestHttpException::class);
        $controller->actionUndoHistory();
    }

    private function fixture(mixed $token = null, bool $cp = true, bool $post = true): array
    {
        $request = $this->createStub(Request::class);
        $request->method('getIsCpRequest')->willReturn($cp);
        $request->method('getIsPost')->willReturn($post);
        $request->method('getAcceptsJson')->willReturn(true);
        $request->method('getRequiredBodyParam')->willReturn($token ?? str_repeat('a', 32));
        $undo = $this->createMock(SubmissionUndoService::class);
        $controller = $this->getMockBuilder(SubmissionsController::class)->disableOriginalConstructor()
            ->onlyMethods(['getSubmissionUndoService', 'asJson'])->getMock()
        ;
        $controller->method('getSubmissionUndoService')->willReturn($undo);
        $controller->request = $request;
        $response = (new \ReflectionClass(Response::class))->newInstanceWithoutConstructor();
        $controller->response = $response;
        $controller->method('asJson')->willReturnCallback(static function ($data) use ($response) {
            $response->data = $data;

            return $response;
        });

        return [$controller, $undo];
    }
}

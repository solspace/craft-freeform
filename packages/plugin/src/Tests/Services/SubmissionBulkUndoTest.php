<?php

namespace Solspace\Freeform\Tests\Services;

use craft\elements\db\ElementQuery;
use craft\elements\db\ElementQueryInterface;
use craft\services\Elements;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Elements\Actions\AllowSpamAction;
use Solspace\Freeform\Elements\Actions\DeleteAllSubmissionsAction;
use Solspace\Freeform\Elements\Actions\DeleteSubmissionAction;
use Solspace\Freeform\Elements\Actions\SetSubmissionStatusAction;
use Solspace\Freeform\Elements\SpamSubmission;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Submissions\DeleteEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Services\FormsService;
use Solspace\Freeform\Services\SpamSubmissionsService;
use Solspace\Freeform\Services\SubmissionsService;
use Solspace\Freeform\Services\SubmissionUndoService;
use yii\db\Transaction;

#[CoversClass(SubmissionsService::class)]
#[CoversClass(AllowSpamAction::class)]
#[CoversClass(DeleteSubmissionAction::class)]
#[CoversClass(DeleteAllSubmissionsAction::class)]
#[CoversClass(SetSubmissionStatusAction::class)]
class SubmissionBulkUndoTest extends TestCase
{
    private mixed $previousApp;
    private mixed $previousYiiApp;

    protected function setUp(): void
    {
        $this->previousApp = \Craft::$app;
        $this->previousYiiApp = \Yii::$app;
    }

    protected function tearDown(): void
    {
        \Craft::$app = $this->previousApp;
        \Yii::$app = $this->previousYiiApp;
    }

    public function testBulkApprovalRecordsOnlySuccessfulPermittedChangesAsOneBatch(): void
    {
        [$undo, , , $spam] = $this->fixture();
        $first = $this->submission(1, spam: true);
        $failed = $this->submission(2, spam: true);
        $denied = $this->submission(3, spam: true, editable: false);
        $regular = $this->submission(4);
        $spam->expects(self::exactly(2))->method('allowSpamSubmission')->willReturnOnConsecutiveCalls(true, false);
        $undo->expects(self::once())->method('snapshot')->with($first, 'approve')->willReturn(['id' => 1]);
        $undo->expects(self::once())->method('recordBatch')->with([['id' => 1]]);
        $action = new AllowSpamAction();
        self::assertTrue($action->performAction($this->query([$first, $failed, $denied, $regular])));
    }

    public function testStatusBatchRetainsDifferentOriginalStatusesAndSkipsNoOpsAndFailedSaves(): void
    {
        [$undo, $elements] = $this->fixture();
        $first = $this->submission(1);
        $second = $this->submission(2);
        $second->statusId = 2;
        $unchanged = $this->submission(3);
        $unchanged->statusId = 3;
        $failed = $this->submission(4);
        $denied = $this->submission(5);
        $denied->formId = 99;
        $elements->expects(self::exactly(3))->method('saveElement')->willReturnOnConsecutiveCalls(true, true, false);
        $undo->expects(self::exactly(2))->method('snapshot')->willReturnCallback(static function ($submission, $operation, $previous) {
            self::assertSame('status', $operation);
            self::assertSame(3, $submission->statusId);

            return ['id' => $submission->id, 'previousStatusId' => $previous];
        });
        $undo->expects(self::once())->method('recordBatch')->with([
            ['id' => 1, 'previousStatusId' => 1], ['id' => 2, 'previousStatusId' => 2],
        ]);
        $action = new SetSubmissionStatusAction();
        $action->statusId = 3;
        self::assertTrue($action->performAction($this->query([$first, $second, $unchanged, $failed, $denied])));
    }

    public function testBulkDeleteCapturesOnlySuccessfulNewlyTrashedPermittedSubmissions(): void
    {
        [$undo, $elements, $transaction, , $service] = $this->fixture();
        $first = $this->submission(1);
        $failed = $this->submission(2);
        $alreadyTrashed = $this->submission(3);
        $alreadyTrashed->trashed = true;
        $denied = $this->submission(4);
        $denied->formId = 99;
        $vetoed = $this->submission(5);
        $service->on(SubmissionsService::EVENT_BEFORE_DELETE, static function (DeleteEvent $event) use ($vetoed) {
            if ($event->getSubmission() === $vetoed) {
                $event->isValid = false;
            }
        });
        $elements->expects(self::exactly(3))->method('deleteElement')->willReturnOnConsecutiveCalls(true, false, true);
        $transaction->expects(self::once())->method('commit');
        $undo->expects(self::once())->method('snapshot')->with($first, 'delete')->willReturn(['id' => 1]);
        $undo->expects(self::once())->method('recordBatch')->with([['id' => 1]]);
        self::assertTrue($service->deleteWithUndo($this->query([$first, $failed, $alreadyTrashed, $denied, $vetoed])));
    }

    public function testFailedDeleteBatchRollsBackWithoutCreatingUndo(): void
    {
        [$undo, $elements, $transaction, , $service] = $this->fixture();
        $elements->expects(self::exactly(2))->method('deleteElement')->willReturnCallback(static function ($submission) {
            if (2 === $submission->id) {
                throw new \RuntimeException('Interrupted delete');
            }

            return true;
        });
        $undo->method('snapshot')->willReturn(['id' => 1]);
        $undo->expects(self::never())->method('recordBatch');
        $transaction->expects(self::once())->method('rollBack');
        $transaction->expects(self::never())->method('commit');
        $this->expectException(\RuntimeException::class);
        $service->deleteWithUndo($this->query([$this->submission(1), $this->submission(2)]));
    }

    public function testPermanentDeletionNeverCreatesAnUndoReceipt(): void
    {
        [$undo, $elements, , , $service] = $this->fixture();
        $submission = $this->submission(1);
        $undo->expects(self::never())->method('snapshot');
        $undo->expects(self::never())->method('recordBatch');
        $elements->expects(self::once())->method('deleteElement')->with($submission, true)->willReturn(true);
        self::assertTrue($service->delete($this->query([$submission]), false, true));
    }

    public function testDeleteActionsChooseUndoForSoftDeletesAndRetainOtherQueryCriteria(): void
    {
        $service = $this->createMock(SubmissionsService::class);
        $this->fixture($service);
        $query = $this->createMock(ElementQuery::class);
        $query->expects(self::once())->method('id')->with(null)->willReturnSelf();
        $service->expects(self::exactly(2))->method('deleteWithUndo')->with($query)->willReturn(true);
        $service->expects(self::once())->method('delete')->with($query, false, true)->willReturn(false);
        $selected = new DeleteSubmissionAction();
        $selected->successMessage = 'Deleted';
        self::assertTrue($selected->performAction($query));
        $selected->setHardDelete();
        self::assertFalse($selected->performAction($query));
        $all = new DeleteAllSubmissionsAction();
        $all->successMessage = 'Deleted';
        self::assertTrue($all->performAction($query));
    }

    private function submission(int $id, bool $spam = false, bool $editable = true): Submission
    {
        $submission = $this->createMock($spam ? SpamSubmission::class : Submission::class);
        $submission->id = $id;
        $submission->formId = 2;
        $submission->statusId = 1;
        $submission->isSpam = $spam;
        $submission->method('getIsEditable')->willReturn($editable);

        return $submission;
    }

    private function query(array $submissions): ElementQueryInterface
    {
        $query = $this->createMock(ElementQuery::class);
        $query->method('all')->willReturn($submissions);
        $query->method('count')->willReturn(\count($submissions));
        $query->method('batch')->willReturn([$submissions]);

        return $query;
    }

    private function fixture(?SubmissionsService $submissions = null): array
    {
        $undo = $this->createMock(SubmissionUndoService::class);
        $elements = $this->createMock(Elements::class);
        $transaction = $this->createMock(Transaction::class);
        $spam = $this->createMock(SpamSubmissionsService::class);
        $forms = $this->createStub(FormsService::class);
        $forms->method('getAllowedWriteFormIds')->willReturn([2]);
        $service = $submissions ?? $this->getMockBuilder(SubmissionsService::class)->onlyMethods(['getFormsService'])->getMock();
        if (!$submissions) {
            $service->method('getFormsService')->willReturn($forms);
        }
        $plugin = $this->getMockBuilder(Freeform::class)->disableOriginalConstructor()->onlyMethods(['__get'])->getMock();
        $plugin->method('__get')->willReturnMap([['submissionUndo', $undo], ['spamSubmissions', $spam], ['forms', $forms], ['submissions', $service]]);
        \Craft::$app = \Yii::$app = new class($plugin, $elements, $transaction) {
            public array $loadedModules;

            public function __construct(Freeform $plugin, public Elements $elements, private Transaction $transaction)
            {
                $this->loadedModules = [Freeform::class => $plugin];
            }

            public function getElements(): Elements
            {
                return $this->elements;
            }

            public function getDb(): object
            {
                return new class($this->transaction) {
                    public function __construct(private Transaction $transaction) {}

                    public function beginTransaction(): Transaction
                    {
                        return $this->transaction;
                    }
                };
            }
        };

        return [$undo, $elements, $transaction, $spam, $service];
    }
}

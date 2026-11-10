<?php

namespace Solspace\Freeform\Tests\Services;

use craft\services\Elements;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Elements\SpamSubmission;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Models\StatusModel;
use Solspace\Freeform\Services\StatusesService;
use Solspace\Freeform\Services\SubmissionUndoService;
use yii\db\Transaction;
use yii\web\ConflictHttpException;
use yii\web\ForbiddenHttpException;
use yii\web\GoneHttpException;
use yii\web\UnprocessableEntityHttpException;

#[CoversClass(SubmissionUndoService::class)]
class SubmissionUndoServiceTest extends TestCase
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

    public function testSequentialStatusChangesUndoInOrderAndCannotReplay(): void
    {
        [$service, $submission, $elements] = $this->fixture();
        $submission->statusId = 2;
        $service->record($submission, 'status', 1);
        $submission->statusId = 3;
        $service->record($submission, 'status', 2);
        $elements->expects(self::exactly(2))->method('saveElement')->with($submission)->willReturn(true);
        self::assertSame('status', $service->undo($service->getHistory()[1]['token']));
        self::assertSame(2, $submission->statusId);
        $token = $service->getHistory()[0]['token'];
        $service->undo($token);
        self::assertSame(1, $submission->statusId);
        self::assertSame('Original title', $submission->title);
        self::assertSame([], $service->getHistory());
        $this->expectException(GoneHttpException::class);
        $service->undo($token);
    }

    public function testApprovalReturnsToSpamWithoutPostProcessingOrFieldReplacement(): void
    {
        [$service, $submission, $elements] = $this->fixture();
        $service->record($submission, 'approve');
        $elements->expects(self::once())->method('saveElement')->with($submission, false, false, false)->willReturn(true);
        self::assertSame('approve', $service->undo($service->getHistory()[0]['token']));
        self::assertTrue($submission->isSpam);
        self::assertTrue($service->converted);
        self::assertSame([], $service->getHistory());
    }

    public function testBatchRestoresEachPreviousStatusAsOneUndoStep(): void
    {
        [$service, $first, $elements, $transaction] = $this->fixture();
        $second = clone $first;
        $second->id = 11;
        $second->uid = 'second-element';
        $service->submissions[11] = $second;
        $first->statusId = $second->statusId = 3;
        $service->recordBatch([
            $service->snapshot($first, 'status', 1),
            $service->snapshot($second, 'status', 2),
        ]);
        self::assertCount(1, $service->getHistory());
        self::assertCount(2, $service->entries[0]['items']);
        $elements->expects(self::exactly(2))->method('saveElement')->willReturn(true);
        $transaction->expects(self::once())->method('commit');
        $service->undo($service->getHistory()[0]['token']);
        self::assertSame(1, $first->statusId);
        self::assertSame(2, $second->statusId);
        self::assertSame([], $service->getHistory());
    }

    public function testConflictInLastBatchItemPreventsAnyReversal(): void
    {
        [$service, $first, $elements, $transaction] = $this->fixture();
        $second = clone $first;
        $second->id = 11;
        $second->uid = 'second-element';
        $service->submissions[11] = $second;
        $first->statusId = $second->statusId = 3;
        $service->recordBatch([
            $service->snapshot($first, 'status', 1),
            $service->snapshot($second, 'status', 2),
        ]);
        $second->statusId = 4;
        $elements->expects(self::never())->method('saveElement');
        $transaction->expects(self::never())->method('commit');

        try {
            $service->undo($service->getHistory()[0]['token']);
            self::fail('Expected a conflict before any write.');
        } catch (ConflictHttpException) {
            self::assertSame(3, $first->statusId);
            self::assertSame(4, $second->statusId);
        }
    }

    public function testFailedLastBatchRestoreRollsBackAndRetainsTheWholeReceipt(): void
    {
        [$service, $first, $elements, $transaction] = $this->fixture();
        $second = clone $first;
        $second->id = 11;
        $second->uid = 'second-element';
        $service->submissions[11] = $second;
        $service->recordBatch([$service->snapshot($first, 'delete'), $service->snapshot($second, 'delete')]);
        $first->trashed = $second->trashed = true;
        $elements->expects(self::exactly(2))->method('restoreElement')->willReturnOnConsecutiveCalls(true, false);
        $transaction->expects(self::never())->method('commit');
        $transaction->expects(self::once())->method('rollBack');

        try {
            $service->undo($service->getHistory()[0]['token']);
            self::fail('Expected the batch transaction to fail.');
        } catch (UnprocessableEntityHttpException) {
            self::assertCount(1, $service->getHistory());
            self::assertCount(2, $service->entries[0]['items']);
        }
    }

    public function testExistingSingleItemReceiptsCanStillBeUndone(): void
    {
        [$service, $submission, $elements] = $this->fixture();
        $service->entries[] = $service->snapshot($submission, 'approve') + ['token' => str_repeat('a', 32), 'expiresAt' => 2000];
        $elements->expects(self::once())->method('saveElement')->willReturn(true);
        $service->undo(str_repeat('a', 32));
        self::assertTrue($submission->isSpam);
    }

    public function testEmptyBatchDoesNotExposeUndo(): void
    {
        [$service] = $this->fixture();
        $service->recordBatch([]);
        self::assertSame([], $service->getHistory());
    }

    public function testDeleteUsesNativeRestoreAndPreservesSpamClassification(): void
    {
        [$service, $submission, $elements] = $this->fixture(spam: true);
        $service->record($submission, 'delete');
        $submission->trashed = true;
        $elements->expects(self::once())->method('restoreElement')->with($submission)->willReturn(true);
        $elements->expects(self::never())->method('saveElement');
        self::assertSame('delete', $service->undo($service->getHistory()[0]['token']));
        self::assertTrue($submission->isSpam);
    }

    #[TestWith(['status'])]
    #[TestWith(['approve'])]
    #[TestWith(['delete'])]
    public function testFailedReversalRetainsReceiptForRetry(string $operation): void
    {
        [$service, $submission, $elements, $transaction] = $this->fixture(spam: 'delete' === $operation);
        $submission->statusId = 2;
        $service->record($submission, $operation, 1);
        $submission->trashed = 'delete' === $operation;
        $elements->method('saveElement')->willReturn(false);
        $elements->method('restoreElement')->willReturn(false);
        $transaction->expects(self::once())->method('rollBack');

        try {
            $service->undo($service->getHistory()[0]['token']);
            self::fail('Expected a failed reversal.');
        } catch (UnprocessableEntityHttpException) {
            self::assertCount(1, $service->getHistory());
            self::assertSame(2, $submission->statusId);
            self::assertSame('delete' === $operation, $submission->isSpam);
        }
    }

    #[TestWith(['statusId', 3])]
    #[TestWith(['isSpam', true])]
    #[TestWith(['trashed', true])]
    #[TestWith(['uid', 'different-element'])]
    #[TestWith(['formId', 8])]
    #[TestWith(['isHidden', true])]
    public function testConflictingChangesAreNeverOverwritten(string $property, mixed $value): void
    {
        [$service, $submission, $elements] = $this->fixture();
        $submission->statusId = 2;
        $service->record($submission, 'status', 1);
        $token = $service->getHistory()[0]['token'];
        $submission->{$property} = $value;
        $elements->expects(self::never())->method('saveElement');

        try {
            $service->undo($token);
            self::fail();
        } catch (ConflictHttpException) {
            self::assertSame($value, $submission->{$property});
            self::assertSame([], $service->getHistory());
        }
    }

    public function testUnknownTokenCannotUndoOrDiscardTheLatestAction(): void
    {
        [$service, $submission, $elements] = $this->fixture();
        $service->record($submission, 'approve');
        $elements->expects(self::never())->method('saveElement');

        try {
            $service->undo(str_repeat('0', 32));
            self::fail();
        } catch (ConflictHttpException) {
            self::assertCount(1, $service->getHistory());
        }
    }

    public function testPermissionIsRecheckedBeforeUndo(): void
    {
        [$service, $submission, $elements] = $this->fixture(editable: false);
        $service->record($submission, 'approve');
        $elements->expects(self::never())->method('saveElement');
        $this->expectException(ForbiddenHttpException::class);
        $service->undo($service->getHistory()[0]['token']);
    }

    public function testHistoryIsBoundedExpiresAndDoesNotExposePrivateReversalData(): void
    {
        [$service, $submission] = $this->fixture();
        for ($i = 0; $i < 25; ++$i) {
            $service->record($submission, 'approve');
        }
        self::assertCount(20, $service->getHistory());
        self::assertSame(['token', 'operation', 'title', 'expiresAt'], array_keys($service->getHistory()[0]));
        $service->clock += 1800;
        self::assertSame([], $service->getHistory());
    }

    public function testDifferentUsersCannotReadEachOthersReceipts(): void
    {
        $session = new class {
            public array $values = [];

            public function get($key, $default)
            {
                return $this->values[$key] ?? $default;
            }

            public function set($key, $value): void
            {
                $this->values[$key] = $value;
            }
        };
        $user = new class {
            public int $id = 1;

            public function getId(): int
            {
                return $this->id;
            }
        };
        \Craft::$app = new class($session, $user) {
            public function __construct(private object $session, private object $user) {}

            public function getSession(): object
            {
                return $this->session;
            }

            public function getUser(): object
            {
                return $this->user;
            }
        };
        $service = new SubmissionUndoService();
        $submission = $this->createMock(Submission::class);
        $service->record($submission, 'approve');
        $user->id = 2;
        self::assertSame([], $service->getHistory());
        $user->id = 1;
        self::assertCount(1, $service->getHistory());
    }

    private function fixture(bool $spam = false, bool $editable = true): array
    {
        $submission = $this->createMock($spam ? SpamSubmission::class : Submission::class);
        $submission->id = 10;
        $submission->uid = 'same-element';
        $submission->formId = 2;
        $submission->siteId = 1;
        $submission->title = 'Original title';
        $submission->statusId = 1;
        $submission->isSpam = $spam;
        $submission->method('getIsEditable')->willReturn($editable);
        $submission->expects(self::never())->method('setFormFieldValues');
        $elements = $this->createMock(Elements::class);
        $transaction = $this->createMock(Transaction::class);
        $db = new class($transaction) {
            public function __construct(private Transaction $transaction) {}

            public function beginTransaction(): Transaction
            {
                return $this->transaction;
            }
        };
        \Craft::$app = new class($elements, $db) {
            public function __construct(private Elements $elements, private object $db) {}

            public function getElements(): Elements
            {
                return $this->elements;
            }

            public function getDb(): object
            {
                return $this->db;
            }
        };
        $statuses = $this->createStub(StatusesService::class);
        $statuses->method('getStatusById')->willReturn(new StatusModel());
        $service = new class($submission, $statuses) extends SubmissionUndoService {
            public array $entries = [];
            public array $submissions;
            public int $clock = 1000;
            public bool $converted = false;

            public function __construct(Submission $submission, private StatusesService $statuses)
            {
                $this->submissions = [$submission->id => $submission];
            }

            protected function readHistory(): array
            {
                return $this->entries;
            }

            protected function writeHistory(array $history): void
            {
                $this->entries = $history;
            }

            protected function now(): int
            {
                return $this->clock;
            }

            protected function findSubmission(array $entry): ?Submission
            {
                return $this->submissions[$entry['id']] ?? null;
            }

            protected function getStatusesService(): StatusesService
            {
                return $this->statuses;
            }

            protected function convertToSpam(Submission $submission): void
            {
                $this->converted = true;
            }
        };

        return [$service, $submission, $elements, $transaction];
    }
}

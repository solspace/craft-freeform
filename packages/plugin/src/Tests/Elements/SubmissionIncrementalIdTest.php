<?php

namespace Solspace\Freeform\Tests\Elements;

use craft\db\Command;
use craft\db\Connection;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Library\Exceptions\FreeformException;
use yii\mutex\Mutex;

#[CoversClass(Submission::class)]
class SubmissionIncrementalIdTest extends TestCase
{
    private mixed $previousApp;
    private Connection $db;
    private bool $locked = false;

    protected function setUp(): void
    {
        $this->previousApp = \Craft::$app;
        $this->db = new Connection(['dsn' => 'sqlite::memory:']);
    }

    protected function tearDown(): void
    {
        $this->db->close();
        \Craft::$app = $this->previousApp;
    }

    #[DataProvider('transactionOutcomes')]
    public function testLockIsHeldUntilTheOuterTransactionFinishes(bool $commit): void
    {
        $this->configureMutex();
        $outer = $this->db->beginTransaction();

        $this->lock();
        self::assertTrue($this->locked);

        if ($commit) {
            $outer->commit();
        } else {
            $outer->rollBack();
        }
        self::assertFalse($this->locked);
    }

    #[DataProvider('transactionOutcomes')]
    public function testFinishingANestedSaveDoesNotReleaseTheOuterTransactionsLock(bool $commit): void
    {
        $this->configureMutex();
        $outer = $this->db->beginTransaction();
        $nested = $this->db->beginTransaction();

        $this->lock();
        if ($commit) {
            $nested->commit();
        } else {
            $nested->rollBack();
        }
        self::assertTrue($this->locked);

        $outer->commit();
        self::assertFalse($this->locked);
    }

    public static function transactionOutcomes(): iterable
    {
        yield 'commit' => [true];

        yield 'rollback' => [false];
    }

    public function testMultipleSubmissionsInOneTransactionShareTheLock(): void
    {
        $this->configureMutex();
        $outer = $this->db->beginTransaction();

        $this->lock();
        $this->lock();
        self::assertTrue($this->locked);

        $outer->commit();
        self::assertFalse($this->locked);
    }

    public function testTheLockCanBeAcquiredAgainInTheNextTransaction(): void
    {
        $this->configureMutex(2);
        $outer = $this->db->beginTransaction();
        $this->lock();
        $outer->rollBack();

        $outer = $this->db->beginTransaction();
        $this->lock();
        self::assertTrue($this->locked);
        $outer->commit();
        self::assertFalse($this->locked);
    }

    public function testLockTimeoutStopsTheSaveInsteadOfAllocatingAnUnsafeId(): void
    {
        $mutex = $this->createMock(Mutex::class);
        $mutex->method('isAcquired')->willReturn(false);
        $mutex->expects(self::once())->method('acquire')->with('freeform-submission-incremental-id', 30)->willReturn(false);
        $mutex->expects(self::never())->method('release');
        $this->configureApp($this->db, $mutex);

        $this->expectException(FreeformException::class);
        $this->lock();
    }

    #[DataProvider('maximumIds')]
    public function testAllocationReadsTheLatestIdFromThePrimaryDatabase(false|int $maximum, int $expected): void
    {
        $command = $this->createMock(Command::class);
        $command->expects(self::once())->method('queryScalar')->willReturn($maximum);
        $db = $this->createMock(Connection::class);
        $db->expects(self::once())->method('useMaster')->willReturnCallback(static fn (callable $callback) => $callback());
        $db->expects(self::once())->method('createCommand')->with(
            'SELECT [[incrementalId]] FROM '.Submission::TABLE.' ORDER BY [[incrementalId]] DESC LIMIT 1 FOR UPDATE'
        )->willReturn($command);
        $this->configureApp($db, $this->createStub(Mutex::class));
        $submission = (new \ReflectionClass(Submission::class))->newInstanceWithoutConstructor();

        self::assertSame($expected, (new \ReflectionMethod(Submission::class, 'getNewIncrementalId'))->invoke($submission));
    }

    public static function maximumIds(): iterable
    {
        yield 'empty submissions table' => [false, 1];

        yield 'existing submissions' => [42, 43];
    }

    private function lock(): void
    {
        $submission = (new \ReflectionClass(Submission::class))->newInstanceWithoutConstructor();
        (new \ReflectionMethod(Submission::class, 'lockIncrementalId'))->invoke($submission);
    }

    private function configureMutex(int $transactions = 1): void
    {
        $mutex = $this->createMock(Mutex::class);
        $mutex->method('isAcquired')->willReturnCallback(fn () => $this->locked);
        $mutex->expects(self::exactly($transactions))->method('acquire')->with('freeform-submission-incremental-id', 30)->willReturnCallback(function (): bool {
            $this->locked = true;

            return true;
        });
        $mutex->expects(self::exactly($transactions))->method('release')->with('freeform-submission-incremental-id')->willReturnCallback(function (): bool {
            $this->locked = false;

            return true;
        });
        $this->configureApp($this->db, $mutex);
    }

    private function configureApp(Connection $db, Mutex $mutex): void
    {
        \Craft::$app = new class($db, $mutex) {
            public function __construct(private Connection $db, private Mutex $mutex) {}

            public function getDb(): Connection
            {
                return $this->db;
            }

            public function getMutex(): Mutex
            {
                return $this->mutex;
            }
        };
    }
}

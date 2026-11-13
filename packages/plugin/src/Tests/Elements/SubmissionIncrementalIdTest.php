<?php

namespace Solspace\Freeform\Tests\Elements;

use craft\db\Command;
use craft\db\Connection;
use Illuminate\Database\DatabaseTransactionsManager;
use Illuminate\Support\Facades\DB;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Library\Exceptions\FreeformException;
use Solspace\Freeform\Tests\Helpers\UsesCraft6Container;
use yii\mutex\Mutex;

#[CoversClass(Submission::class)]
class SubmissionIncrementalIdTest extends TestCase
{
    use UsesCraft6Container;

    private mixed $previousApp;
    private Connection $db;
    private bool $locked = false;

    protected function setUp(): void
    {
        $this->previousApp = \Craft::$app;
        app()->instance('db.transactions', new DatabaseTransactionsManager());
        $connection = DB::connection();
        $this->db = $this->getMockBuilder(Connection::class)->onlyMethods(['getLaravelConnection'])->getMock();
        $this->db->method('getLaravelConnection')->willReturn($connection);
    }

    protected function tearDown(): void
    {
        while (DB::transactionLevel() > 0) {
            DB::rollBack();
        }
        $this->db->close();
        \Craft::$app = $this->previousApp;
    }

    #[DataProvider('transactionOutcomes')]
    public function testLockIsHeldUntilTheOuterTransactionFinishes(bool $commit): void
    {
        $this->configureMutex();
        DB::beginTransaction();

        $this->lock();
        self::assertTrue($this->locked);

        if ($commit) {
            DB::commit();
        } else {
            DB::rollBack();
        }
        self::assertFalse($this->locked);
    }

    public static function transactionOutcomes(): iterable
    {
        yield 'commit' => [true];

        yield 'rollback' => [false];
    }

    #[DataProvider('nestedTransactionOutcomes')]
    public function testFinishingANestedSaveDoesNotReleaseTheOuterTransactionsLock(bool $commit, bool $commitOuter): void
    {
        $this->configureMutex();
        DB::beginTransaction();
        DB::beginTransaction();

        $this->lock();
        if ($commit) {
            DB::commit();
        } else {
            DB::rollBack();
        }
        self::assertTrue($this->locked);

        if ($commitOuter) {
            DB::commit();
        } else {
            DB::rollBack();
        }
        self::assertFalse($this->locked);
    }

    public static function nestedTransactionOutcomes(): iterable
    {
        yield 'both commit' => [true, true];

        yield 'nested commit, outer rollback' => [true, false];

        yield 'nested rollback, outer commit' => [false, true];

        yield 'both rollback' => [false, false];
    }

    public function testMultipleSubmissionsInOneTransactionShareTheLock(): void
    {
        $this->configureMutex();
        DB::beginTransaction();

        $this->lock();
        $this->lock();
        self::assertTrue($this->locked);

        DB::commit();
        self::assertFalse($this->locked);
    }

    public function testTheLockCanBeAcquiredAgainInTheNextTransaction(): void
    {
        $this->configureMutex(2);
        DB::beginTransaction();
        $this->lock();
        DB::rollBack();

        DB::beginTransaction();
        $this->lock();
        self::assertTrue($this->locked);
        DB::commit();
        self::assertFalse($this->locked);
    }

    public function testAnotherConnectionsTransactionDoesNotReleaseTheLock(): void
    {
        $this->configureMutex();
        config(['database.connections.other' => ['driver' => 'sqlite', 'database' => ':memory:']]);
        $other = DB::connection('other');
        DB::beginTransaction();
        $other->beginTransaction();

        $this->lock();
        $other->commit();
        self::assertTrue($this->locked);

        DB::commit();
        self::assertFalse($this->locked);
    }

    public function testAllocationWithoutATransactionDoesNotAcquireTheLock(): void
    {
        $mutex = $this->createMock(Mutex::class);
        $mutex->method('isAcquired')->willReturn(false);
        $mutex->expects(self::never())->method('acquire');
        $mutex->expects(self::never())->method('release');
        $this->configureApp($this->db, $mutex);

        $this->expectException(FreeformException::class);
        $this->lock();
    }

    public function testLockTimeoutStopsTheSaveInsteadOfAllocatingAnUnsafeId(): void
    {
        $mutex = $this->createMock(Mutex::class);
        $mutex->method('isAcquired')->willReturn(false);
        $mutex->expects(self::once())->method('acquire')->with('freeform-submission-incremental-id', 30)->willReturn(false);
        $mutex->expects(self::never())->method('release');
        $this->configureApp($this->db, $mutex);
        DB::beginTransaction();

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

<?php

namespace Solspace\Freeform\Tests\Bundles\Form\SaveForm;

use Carbon\Carbon;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Form\SaveForm\Events\SavedFormsPurgedEvent;
use Solspace\Freeform\Bundles\Form\SaveForm\SavedFormCleanup;
use Solspace\Freeform\Bundles\Form\SaveForm\SaveForm;
use Solspace\Freeform\Bundles\Notifications\Providers\NotificationLoggerProvider;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Records\SavedFormRecord;
use Solspace\Freeform\Services\Headless\HeadlessDraftService;
use Solspace\Freeform\Services\LockService;
use Solspace\Freeform\Services\SettingsService;
use yii\base\Event;
use yii\db\Connection;
use yii\db\IntegrityException;
use yii\db\Query;

/**
 * Defaults to SQLite. Set FREEFORM_SAVED_FORM_TEST_DSN, _USER and _PASSWORD to
 * run these same checks against MySQL/PostgreSQL using an isolated table prefix.
 */
#[CoversClass(SavedFormCleanup::class)]
#[CoversClass(SavedFormsPurgedEvent::class)]
#[CoversClass(SaveForm::class)]
class SavedFormCleanupTest extends TestCase
{
    private Connection $db;
    private SavedFormCleanup $cleanup;
    private array $events = [];

    protected function setUp(): void
    {
        $this->db = new SavedFormCleanupTestConnection([
            'dsn' => getenv('FREEFORM_SAVED_FORM_TEST_DSN') ?: 'sqlite::memory:',
            'username' => getenv('FREEFORM_SAVED_FORM_TEST_USER') ?: null,
            'password' => getenv('FREEFORM_SAVED_FORM_TEST_PASSWORD') ?: null,
            'tablePrefix' => 'ffpurge_'.bin2hex(random_bytes(4)).'_',
            'schemaCache' => null,
            'enableSchemaCache' => false,
            'enableLogging' => false,
            'enableProfiling' => false,
        ]);
        $this->db->createCommand()->createTable(SavedFormRecord::TABLE, [
            'id' => 'integer PRIMARY KEY',
            'formId' => 'integer NOT NULL',
            'token' => 'varchar(100) NOT NULL',
            'sessionId' => 'varchar(100) NOT NULL',
            'payload' => 'text NOT NULL',
            'dateUpdated' => 'datetime NOT NULL',
        ])->execute();
        $this->cleanup = new SavedFormCleanup($this->db);
    }

    protected function tearDown(): void
    {
        Event::off(SaveForm::class, SaveForm::EVENT_AFTER_PURGE_SAVED_FORMS);
        $this->db->getTransaction()?->rollBack();
        $this->db->createCommand()->dropTable(SavedFormRecord::TABLE)->execute();
        $this->db->close();
    }

    #[TestWith([false])]
    #[TestWith([true])]
    public function testTtlOnlyDeletesExpiredRecordsAndReportsIdentifiersAfterDeletion(bool $listen): void
    {
        $this->seed(1, '2026-10-01 11:59:59');
        $this->seed(2, '2026-10-01 12:00:00');
        $this->seed(3, '2026-10-29 12:00:00', 'other-session');
        if ($listen) {
            $this->listen();
        }

        $this->cleanup->purgeExpired(new \DateTimeImmutable('2026-10-01T07:00:00-05:00'), 28);

        self::assertSame([2, 3], $this->ids());
        self::assertCount($listen ? 1 : 0, $this->events);
        if ($listen) {
            self::assertSame([
                'records' => [['id' => 1, 'token' => 'token-1', 'formId' => 7]],
                'reason' => 'ttl_expired',
                'cutoff' => '2026-10-01 12:00:00',
                'ttlDays' => 28,
            ], $this->events[0]->toArray());
        }

        $this->cleanup->purgeExpired(new \DateTimeImmutable('2026-10-01T12:00:00Z'), 28);
        self::assertCount($listen ? 1 : 0, $this->events, 'An empty cleanup must not emit another event.');
    }

    #[TestWith([false])]
    #[TestWith([true])]
    public function testSessionLimitKeepsNewestRecordsAndOtherSessions(bool $listen): void
    {
        $this->seed(1, '2026-10-27 12:00:00');
        $this->seed(2, '2026-10-28 12:00:00');
        $this->seed(3, '2026-10-29 12:00:00');
        $this->seed(4, '2026-10-01 12:00:00', 'other-session');
        if ($listen) {
            $this->listen();
        }

        $this->cleanup->purgeForSession('session', 2);

        self::assertSame([2, 3, 4], $this->ids());
        if ($listen) {
            self::assertCount(1, $this->events);
            self::assertSame([
                'records' => [['id' => 1, 'token' => 'token-1', 'formId' => 7]],
                'reason' => 'session_limit',
                'cutoff' => null,
                'ttlDays' => null,
            ], $this->events[0]->toArray());
        }
        $this->cleanup->purgeForSession('session', 2);
        self::assertCount($listen ? 1 : 0, $this->events);
    }

    #[TestWith(['session', 0])]
    #[TestWith(['session', -1])]
    #[TestWith(['', 1])]
    public function testDisabledLimitAndMissingSessionDoNotDeleteOrNotify(string $sessionId, int $limit): void
    {
        $this->seed(1);
        $this->seed(2);
        $this->listen();

        $this->cleanup->purgeForSession($sessionId, $limit);

        self::assertSame([1, 2], $this->ids());
        self::assertSame([], $this->events);
    }

    public function testTiedSessionTimestampsKeepTheNewestId(): void
    {
        $this->seed(1);
        $this->seed(2);
        $this->seed(3);
        $this->listen();

        $this->cleanup->purgeForSession('session', 1);

        self::assertSame([3], $this->ids());
        self::assertSame([2, 1], array_column($this->events[0]->records, 'id'));
    }

    #[TestWith(['ttl_expired'])]
    #[TestWith(['session_limit'])]
    public function testLargePurgesAreBatchedWithoutMissingOrRepeatingRecords(string $reason): void
    {
        for ($id = 1; $id <= 205; ++$id) {
            $this->seed($id, formId: $id % 2 + 7);
        }
        $this->seed(206, '2026-10-29 12:00:00');
        $this->listen();

        if ('ttl_expired' === $reason) {
            $this->cleanup->purgeExpired(new \DateTimeImmutable('2026-10-01T12:00:00Z'), 28);
        } else {
            $this->cleanup->purgeForSession('session', 1);
        }

        self::assertSame([206], $this->ids());
        self::assertSame([100, 100, 5], array_map(static fn ($event) => \count($event->records), $this->events));
        $deleted = array_merge(...array_map(static fn ($event) => $event->records, $this->events));
        $ids = array_column($deleted, 'id');
        sort($ids);
        self::assertSame(range(1, 205), $ids);
        self::assertEqualsCanonicalizing([7, 8], array_unique(array_column($deleted, 'formId'), \SORT_NUMERIC));
    }

    public function testListenerCanRefreshAnotherDraftBetweenBatches(): void
    {
        for ($id = 1; $id <= 102; ++$id) {
            $this->seed($id);
        }
        $this->listen();
        Event::on(SaveForm::class, SaveForm::EVENT_AFTER_PURGE_SAVED_FORMS, function (): void {
            $this->db->createCommand()->update(SavedFormRecord::TABLE, ['dateUpdated' => '2026-10-29 12:00:00'], ['id' => 102])->execute();
        });

        $this->cleanup->purgeExpired(new \DateTimeImmutable('2026-10-01T12:00:00Z'), 28);

        self::assertSame([102], $this->ids());
        self::assertSame([100, 1], array_map(static fn ($event) => \count($event->records), $this->events));
    }

    public function testFailedDeletionDoesNotEmitAnEvent(): void
    {
        $this->seed(1);
        $this->db->createCommand()->createTable('{{%saved_form_references}}', ['savedId' => 'integer REFERENCES '.$this->db->quoteTableName(SavedFormRecord::TABLE).'(id)'])->execute();

        try {
            if ('sqlite' === $this->db->getDriverName()) {
                $this->db->createCommand('PRAGMA foreign_keys = ON')->execute();
            } elseif ('mysql' === $this->db->getDriverName()) {
                // MySQL ignores inline REFERENCES clauses on column definitions.
                $this->db->createCommand()->addForeignKey('saved_form_reference', '{{%saved_form_references}}', 'savedId', SavedFormRecord::TABLE, 'id')->execute();
            }
            $this->db->createCommand()->insert('{{%saved_form_references}}', ['savedId' => 1])->execute();
            $this->listen();

            try {
                $this->cleanup->purgeExpired(new \DateTimeImmutable('2026-10-01T12:00:00Z'), 28);
                self::fail('The database should reject deletion of a referenced record.');
            } catch (IntegrityException) {
                self::assertSame([1], $this->ids());
                self::assertSame([], $this->events);
                self::assertNull($this->db->getTransaction());
            }
        } finally {
            $this->db->createCommand()->dropTable('{{%saved_form_references}}')->execute();
        }
    }

    public function testThrowingListenerDoesNotInterruptCleanup(): void
    {
        for ($id = 1; $id <= 101; ++$id) {
            $this->seed($id);
        }
        $this->listen();
        Event::on(SaveForm::class, SaveForm::EVENT_AFTER_PURGE_SAVED_FORMS, static function (): void {
            throw new \RuntimeException('Test listener failure');
        });

        $this->cleanup->purgeExpired(new \DateTimeImmutable('2026-10-01T12:00:00Z'), 28);

        self::assertSame([], $this->ids());
        self::assertCount(2, $this->events);
    }

    public function testUnrelatedDatabaseDeletionDoesNotEmitCleanupEvent(): void
    {
        $this->seed(1);
        $this->listen();

        $this->db->createCommand()->delete(SavedFormRecord::TABLE, ['id' => 1])->execute();

        self::assertSame([], $this->events);
    }

    #[TestWith([28])]
    #[TestWith([0])]
    #[TestWith([-1])]
    public function testStartupWaitsForListenersAndUsesEffectiveTtl(int $ttl): void
    {
        $this->withApp($ttl, function (SavedFormCleanupTestApp $app): void {
            $this->seed(1);
            $this->seed(2, '2026-10-29 12:00:00');
            new SaveForm($this->createMock(NotificationLoggerProvider::class));
            self::assertSame([1, 2], $this->ids(), 'Startup must allow listeners to register first.');
            self::assertCount(1, $app->initCallbacks);
            $this->listen();

            $app->initCallbacks[0]();

            self::assertSame([2], $this->ids());
            self::assertCount(1, $this->events);
            $effectiveTtl = $app->settings->saveFormTtl > 0 ? $app->settings->saveFormTtl : Settings::SAVE_FORM_TTL;
            self::assertSame($effectiveTtl, $this->events[0]->ttlDays);
            self::assertSame(Carbon::now('UTC')->subDays($effectiveTtl)->format('Y-m-d H:i:s'), $this->events[0]->cutoff);
        });
    }

    public function testStartupHonorsCleanupLock(): void
    {
        $this->withApp(28, function (SavedFormCleanupTestApp $app): void {
            $this->seed(1);
            new SaveForm($this->createMock(NotificationLoggerProvider::class));
            $app->locked = true;
            $this->listen();

            $app->initCallbacks[0]();

            self::assertSame([1], $this->ids());
            self::assertSame([], $this->events);
        });
    }

    public function testStartupSkipsMissingTable(): void
    {
        $this->withApp(28, function (SavedFormCleanupTestApp $app): void {
            new SaveForm($this->createMock(NotificationLoggerProvider::class));
            $this->db->createCommand()->renameTable(SavedFormRecord::TABLE, '{{%saved_forms_backup}}')->execute();
            $this->listen();

            try {
                $app->initCallbacks[0]();
                self::assertSame([], $this->events);
            } finally {
                $this->db->createCommand()->renameTable('{{%saved_forms_backup}}', SavedFormRecord::TABLE)->execute();
            }
        });
    }

    #[TestWith([SaveForm::class])]
    #[TestWith([HeadlessDraftService::class])]
    public function testClassicAndHeadlessSessionCleanupUseTheSameEvent(string $class): void
    {
        $this->withApp(28, function () use ($class): void {
            $this->seed(1);
            $this->seed(2, '2026-10-29 12:00:00');
            $this->listen();
            $service = (new \ReflectionClass($class))->newInstanceWithoutConstructor();

            (new \ReflectionMethod($class, 'cleanupForSession'))->invoke($service, 'session');

            self::assertSame([2], $this->ids());
            self::assertCount(1, $this->events);
            self::assertSame(SavedFormsPurgedEvent::REASON_SESSION_LIMIT, $this->events[0]->reason);
        });
    }

    private function withApp(int $ttl, callable $callback): void
    {
        $previousApp = \Craft::$app;
        $previousYiiApp = \Yii::$app;
        $app = new SavedFormCleanupTestApp($this->db);
        \Craft::$app = \Yii::$app = $app;
        Carbon::setTestNow(new Carbon('2026-10-29T12:00:00Z'));

        try {
            $app->settings = (new \ReflectionClass(Settings::class))->newInstanceWithoutConstructor();
            $app->settings->saveFormTtl = $ttl;
            $app->settings->saveFormSessionLimit = 1;
            $settings = $this->createMock(SettingsService::class);
            $settings->method('getSettingsModel')->willReturn($app->settings);
            $lock = $this->createMock(LockService::class);
            $lock->method('isLocked')->with(SaveForm::CLEANUP_CACHE_KEY, SaveForm::CLEANUP_CACHE_TTL)->willReturnCallback(static fn () => $app->locked);
            $plugin = $this->createMock(Freeform::class);
            $plugin->method('__get')->willReturnCallback(static fn ($name) => ['settings' => $settings, 'lock' => $lock][$name] ?? null);
            $app->loadedModules = [Freeform::class => $plugin];

            $callback($app);
        } finally {
            Event::off(Form::class, Form::EVENT_AFTER_HANDLE_REQUEST);
            Carbon::setTestNow();
            \Craft::$app = $previousApp;
            \Yii::$app = $previousYiiApp;
        }
    }

    private function seed(int $id, string $dateUpdated = '2026-09-01 12:00:00', string $sessionId = 'session', int $formId = 7): void
    {
        $this->db->createCommand()->insert(SavedFormRecord::TABLE, [
            'id' => $id,
            'formId' => $formId,
            'token' => 'token-'.$id,
            'sessionId' => $sessionId,
            'payload' => 'encrypted-private-data',
            'dateUpdated' => $dateUpdated,
        ])->execute();
    }

    private function ids(): array
    {
        return array_map('intval', (new Query())->select(['id'])->from(SavedFormRecord::TABLE)->orderBy(['id' => \SORT_ASC])->column($this->db));
    }

    private function listen(): void
    {
        Event::on(SaveForm::class, SaveForm::EVENT_AFTER_PURGE_SAVED_FORMS, function (SavedFormsPurgedEvent $event): void {
            foreach ($event->records as $record) {
                self::assertFalse((new Query())->from(SavedFormRecord::TABLE)->where(['id' => $record['id']])->exists($this->db));
            }
            self::assertNull($this->db->getTransaction(), 'The cleanup transaction must finish before notifying listeners.');
            $this->events[] = $event;
        });
    }
}

class SavedFormCleanupTestConnection extends Connection
{
    public function tableExists(string $table): bool
    {
        return null !== $this->getTableSchema($table, true);
    }
}

class SavedFormCleanupTestApp
{
    public array $loadedModules = [];
    public array $initCallbacks = [];
    public bool $locked = false;
    public Settings $settings;

    public function __construct(public Connection $db) {}

    public function getDb(): Connection
    {
        return $this->db;
    }

    public function onInit(callable $callback): void
    {
        $this->initCallbacks[] = $callback;
    }
}

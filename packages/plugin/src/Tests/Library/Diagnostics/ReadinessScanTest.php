<?php

namespace Solspace\Freeform\Tests\Library\Diagnostics;

use craft\db\Connection;
use craft\elements\Asset;
use craft\models\Volume;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Fields\Implementations\DropdownField;
use Solspace\Freeform\Fields\Implementations\EmailField as EmailInput;
use Solspace\Freeform\Fields\Implementations\FileUploadField;
use Solspace\Freeform\Fields\Implementations\Pro\TableField;
use Solspace\Freeform\Library\Diagnostics\NotificationReadinessScan;
use Solspace\Freeform\Library\Diagnostics\UploadIntegrityScan;
use Solspace\Freeform\Notifications\Types\Admin\Admin;
use Solspace\Freeform\Notifications\Types\Conditional\Conditional;
use Solspace\Freeform\Notifications\Types\Dynamic\Dynamic;
use Solspace\Freeform\Notifications\Types\EmailField\EmailField;
use yii\db\Command;
use yii\db\sqlite\Schema;

#[CoversClass(UploadIntegrityScan::class)]
#[CoversClass(NotificationReadinessScan::class)]
class ReadinessScanTest extends TestCase
{
    private \PDO $pdo;
    private Connection $db;
    private mixed $previousApp;

    protected function setUp(): void
    {
        if (!\in_array('sqlite', \PDO::getAvailableDrivers(), true)) {
            $this->markTestSkipped('PDO SQLite is required.');
        }
        $this->pdo = new \PDO('sqlite::memory:');
        $this->pdo->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
        $this->db = $this->getMockBuilder(Connection::class)->onlyMethods(['getSchema', 'createCommand', 'getServerVersion'])->getMock();
        $this->db->tablePrefix = 'craft_';
        $this->db->method('getServerVersion')->willReturn('8.0');
        $schema = new Schema(['db' => $this->db]);
        $this->db->method('getSchema')->willReturn($schema);
        $this->db->method('createCommand')->willReturnCallback(function ($sql, $params = []) {
            $statement = $this->pdo->prepare($this->db->quoteSql($sql));
            $command = $this->createMock(Command::class);
            $command->expects($this->never())->method('execute');
            $command->method('queryScalar')->willReturnCallback(static function () use ($statement, $params) {
                $statement->execute($params);

                return $statement->fetchColumn();
            });
            $command->method('queryAll')->willReturnCallback(static function () use ($statement, $params) {
                $statement->execute($params);

                return $statement->fetchAll(\PDO::FETCH_ASSOC);
            });
            $command->method('queryOne')->willReturnCallback(static function () use ($statement, $params) {
                $statement->execute($params);

                return $statement->fetch(\PDO::FETCH_ASSOC);
            });

            return $command;
        });
        $this->previousApp = \Craft::$app;
        \Craft::$app = (object) ['db' => $this->db];
        $this->pdo->exec('CREATE TABLE craft_uploads (id INTEGER PRIMARY KEY, uploads TEXT)');
        $this->pdo->exec('CREATE TABLE craft_freeform_forms (id INTEGER PRIMARY KEY, name TEXT, handle TEXT, dateArchived TEXT)');
        $this->pdo->exec('CREATE TABLE craft_freeform_forms_fields (id INTEGER PRIMARY KEY, formId INTEGER, type TEXT, uid TEXT, metadata TEXT, rowId INTEGER DEFAULT 1)');
        $this->pdo->exec('CREATE TABLE craft_freeform_forms_rows (id INTEGER PRIMARY KEY)');
        $this->pdo->exec('INSERT INTO craft_freeform_forms_rows VALUES (1)');
        $this->pdo->exec('CREATE TABLE craft_freeform_forms_notifications (id INTEGER PRIMARY KEY, formId INTEGER, class TEXT, enabled INTEGER, metadata TEXT)');
    }

    protected function tearDown(): void
    {
        if (isset($this->db)) {
            \Craft::$app = $this->previousApp;
        }
    }

    public function testUploadsDistinguishMissingFilesAndStorageFailuresWithoutWrites(): void
    {
        $this->insertUploads(10, [1, 2, 3, 4, 1]);
        $calls = [];
        $scan = new UploadIntegrityScan($this->db, static function ($id) use (&$calls) {
            $calls[] = $id;
            if (4 === $id) {
                throw new \RuntimeException('Remote storage credentials are unavailable.');
            }

            return match ($id) {
                2 => 'The referenced asset no longer exists.',
                3 => 'The asset exists, but its stored file is missing.',
                default => null,
            };
        });
        $result = $scan->scanTask($this->uploadTask());
        $this->assertTrue($result['complete']);
        $this->assertSame(4, $result['scanned']);
        $this->assertSame([1, 2, 3, 4], $calls);
        $this->assertCount(3, $result['results']);
        $this->assertFalse($result['results'][0]['skipped']);
        $this->assertTrue($result['results'][2]['skipped']);
        $this->assertSame(10, $result['results'][0]['context']['submission']);
        $this->assertSame('[1,2,3,4,1]', $this->pdo->query('SELECT uploads FROM craft_uploads')->fetchColumn());
    }

    public function testLargeUploadResumesWithinRowAndExcludesNewSubmissions(): void
    {
        $this->insertUploads(10, range(1, 30));
        $this->insertUploads(20, [31]);
        $calls = [];
        $scan = new UploadIntegrityScan($this->db, static function ($id) use (&$calls) {
            $calls[] = $id;

            return null;
        });
        $first = $scan->scanTask($this->uploadTask());
        $this->assertSame(25, $first['scanned']);
        $this->assertSame(0, $first['cursor']);
        $this->assertSame(25, $first['offset']);
        $this->assertFalse($first['complete']);
        $this->insertUploads(30, [32]);
        $last = $scan->scanTask($this->uploadTask(), $first['cursor'], $first['maxId'], $first['offset']);
        $this->assertSame(6, $last['scanned']);
        $this->assertTrue($last['complete']);
        $this->assertSame(range(1, 31), $calls);
    }

    public function testTableUploadsOnlyCheckFileColumnsAndAllowEmptyCells(): void
    {
        $this->insertUploads(1, [['Text', [1, 2]], ['More text', []]]);
        $calls = [];
        $scan = new UploadIntegrityScan($this->db, static function ($id) use (&$calls) {
            $calls[] = $id;

            return null;
        });
        $result = $scan->scanTask(array_replace($this->uploadTask(), ['columns' => [1]]));
        $this->assertSame([1, 2], $calls);
        $this->assertSame([], $result['results']);
    }

    public function testUnreadableAndEncryptedValuesAreNeverReportedAsClean(): void
    {
        $scan = new UploadIntegrityScan($this->db, static function () { throw new \LogicException('Must not check invalid IDs.'); });
        $encrypted = $scan->scanTask(array_replace($this->uploadTask(), ['encrypted' => true]));
        $this->assertTrue($encrypted['results'][0]['skipped']);
        $this->assertSame(0, $encrypted['scanned']);
        $this->pdo->exec("INSERT INTO craft_uploads VALUES (1, 'invalid-json')");
        $this->insertUploads(2, ['not-an-id']);
        $invalid = $scan->scanTask($this->uploadTask());
        $this->assertCount(2, $invalid['results']);
        $this->assertTrue($invalid['results'][0]['skipped']);
        $missing = $scan->scanTask(array_replace($this->uploadTask(), ['column' => 'missing']));
        $this->assertTrue($missing['results'][0]['skipped']);
    }

    public function testUploadDiscoveryIncludesStandaloneAndTableFiles(): void
    {
        $this->pdo->exec("INSERT INTO craft_freeform_forms VALUES (1, 'Contact', 'contact', NULL)");
        $insert = $this->pdo->prepare('INSERT INTO craft_freeform_forms_fields (id, formId, type, uid, metadata) VALUES (?, 1, ?, ?, ?)');
        $insert->execute([1, FileUploadField::class, 'upload', json_encode(['handle' => 'file', 'label' => 'File'])]);
        $insert->execute([2, TableField::class, 'table', json_encode(['handle' => 'table', 'tableLayout' => [['type' => 'string'], ['type' => 'file']]])]);
        $insert->execute([3, EmailInput::class, 'email', '{}']);
        $tasks = (new UploadIntegrityScan($this->db))->getTasks();
        $this->assertCount(2, $tasks);
        $this->assertSame('{{%freeform_submissions_contact_1}}', $tasks[0]['table']);
        $this->assertSame('file_1', $tasks[0]['column']);
        $this->assertSame([1], $tasks[1]['columns']);
    }

    public function testNotificationDiscoveryExcludesDisabledAndArchived(): void
    {
        $this->pdo->exec("INSERT INTO craft_freeform_forms VALUES (1, 'Contact', 'contact', NULL), (2, 'Archived', 'archive', '2026-10-01')");
        $insert = $this->pdo->prepare('INSERT INTO craft_freeform_forms_notifications VALUES (?, ?, ?, ?, ?)');
        foreach ([[1, 1, 1], [2, 1, 0], [3, 2, 1]] as [$id, $form, $enabled]) {
            $insert->execute([$id, $form, Admin::class, $enabled, json_encode(['template' => 1, 'recipients' => [['email' => 'admin@example.com']]])]);
        }
        $scan = $this->notificationScan();
        $tasks = $scan->getTasks();
        $this->assertCount(1, $tasks);
        $this->assertSame([], $scan->scanTask($tasks[0])['results']);
    }

    public function testTwigRecipientsAndSenderRemainInertAndValid(): void
    {
        $scan = $this->notificationScan(['fromEmail' => '{{ general.systemEmail }}']);
        $issues = $scan->check($this->notification(Admin::class, ['recipients' => [['email' => '{{ submission.email }}']]]), []);
        $this->assertSame([], $issues);
    }

    public function testNotificationReportsMissingTemplateAndInvalidRecipients(): void
    {
        $scan = new NotificationReadinessScan($this->db, static fn () => false);
        $issues = $scan->check($this->notification(Admin::class, ['recipients' => [['email' => 'invalid']]]), []);
        $this->assertCount(2, $issues);
        $this->assertStringContainsString('recipient email', $issues[0]['message']);
        $this->assertStringContainsString('template no longer exists', $issues[1]['message']);
        $this->assertFalse($issues[1]['skipped']);
    }

    public function testNotificationValidatesSelectedFieldAndConditionalRule(): void
    {
        $scan = $this->notificationScan();
        $email = $this->notification(EmailField::class, ['field' => 'email']);
        $this->assertSame([], $scan->check($email, ['email' => ['type' => EmailInput::class]]));
        $this->assertCount(1, $scan->check($email, []));
        $this->assertCount(1, $scan->check($email, ['email' => ['type' => FileUploadField::class]]));
        $conditional = $this->notification(Conditional::class, ['recipients' => [['email' => 'admin@example.com']], 'rule' => 'missing']);
        $this->assertCount(1, $scan->check($conditional, [], false));
    }

    public function testDynamicNotificationChecksOverridesAndAllowsSilentMappings(): void
    {
        $scan = new NotificationReadinessScan($this->db, static fn ($id) => 1 === $id ? ['subject' => 'Hello', 'fromName' => 'Site', 'fromEmail' => 'site@example.com'] : false);
        $notification = $this->notification(Dynamic::class, ['field' => 'choice', 'recipientMapping' => [
            ['value' => 'one', 'template' => 99, 'recipients' => [['email' => 'team@example.com']]],
            ['value' => 'none', 'recipients' => []],
        ]]);
        $fields = ['choice' => ['type' => DropdownField::class]];
        $issues = $scan->check($notification, $fields);
        $this->assertCount(1, $issues);
        $this->assertSame('A selected notification template no longer exists.', $issues[0]['message']);
    }

    public function testUnreadableTemplatesAndCustomTypesRequireAttention(): void
    {
        $scan = new NotificationReadinessScan($this->db, static fn () => ['unreadable' => true]);
        $issue = $scan->check($this->notification(Admin::class, ['recipients' => [['email' => 'admin@example.com']]]), []);
        $this->assertTrue($issue[0]['skipped']);
        $custom = $this->notificationScan()->check($this->notification('CustomNotification', []), []);
        $this->assertTrue($custom[0]['skipped']);
    }

    public function testMissingSubjectAndSenderAreReported(): void
    {
        $issues = $this->notificationScan(['subject' => '', 'fromEmail' => 'invalid'])->check(
            $this->notification(Admin::class, ['recipients' => [['email' => 'admin@example.com']]]),
            []
        );
        $this->assertCount(2, $issues);
    }

    public function testDefaultAssetCheckSearchesAllSitesAndUsesVolumeWithoutDownloading(): void
    {
        $volume = $this->createMock(Volume::class);
        $volume->expects($this->once())->method('fileExists')->with('uploads/file.pdf')->willReturn(false);
        $asset = $this->getMockBuilder(Asset::class)->disableOriginalConstructor()->onlyMethods(['getVolume', 'getPath', 'getCopyOfFile'])->getMock();
        $asset->method('getVolume')->willReturn($volume);
        $asset->method('getPath')->willReturn('uploads/file.pdf');
        $asset->expects($this->never())->method('getCopyOfFile');
        $assets = new class($asset) {
            public function __construct(private $asset) {}

            public function getElementById($id, $class, $site)
            {
                TestCase::assertSame(Asset::class, $class);
                TestCase::assertSame('*', $site);

                return $id === 1 ? $this->asset : null;
            }
        };
        \Craft::$app = new class($assets) {
            public function __construct(private $assets) {}

            public function getElements()
            {
                return $this->assets;
            }
        };
        $this->insertUploads(1, [1, 2]);
        $result = (new UploadIntegrityScan($this->db))->scanTask($this->uploadTask());
        $this->assertCount(2, $result['results']);
        $this->assertSame('The asset exists, but its stored file is missing.', $result['results'][0]['message']);
        $this->assertSame('The referenced asset no longer exists.', $result['results'][1]['message']);
    }

    public function testDatabaseTemplatesAreReadWithoutHydration(): void
    {
        $this->pdo->exec('CREATE TABLE craft_freeform_notification_templates (id INTEGER PRIMARY KEY, subject TEXT, fromName TEXT, fromEmail TEXT, pdfTemplateIds TEXT)');
        $this->pdo->prepare('INSERT INTO craft_freeform_notification_templates VALUES (1, ?, ?, ?, ?)')->execute([
            'Hello', 'Site', 'site@example.com', '{{ neverExecute() }}',
        ]);
        $notification = $this->notification(Admin::class, ['recipients' => [['email' => 'admin@example.com']]]);
        $this->assertSame([], (new NotificationReadinessScan($this->db))->check($notification, []));
        $this->assertSame('{{ neverExecute() }}', $this->pdo->query('SELECT pdfTemplateIds FROM craft_freeform_notification_templates')->fetchColumn());
    }

    public function testMalformedNotificationMetadataIsReportedAsUnchecked(): void
    {
        $task = ['id' => 1, 'formId' => 1, 'formName' => 'Contact', 'class' => Admin::class, 'metadata' => 'not-json'];
        $result = $this->notificationScan()->scanTask($task);
        $this->assertTrue($result['results'][0]['skipped']);
        $this->assertTrue($result['complete']);
    }

    public function testConditionalRuleLookupMatchesRuntimeFormScope(): void
    {
        $this->pdo->exec('CREATE TABLE craft_freeform_rules (id INTEGER PRIMARY KEY, uid TEXT)');
        $this->pdo->exec('CREATE TABLE craft_freeform_rules_notifications (id INTEGER PRIMARY KEY, notificationId INTEGER)');
        $this->pdo->exec("INSERT INTO craft_freeform_rules VALUES (1, 'selected-rule')");
        $this->pdo->exec('INSERT INTO craft_freeform_rules_notifications VALUES (1, 2)');
        $insert = $this->pdo->prepare('INSERT INTO craft_freeform_forms_notifications VALUES (?, 1, ?, 1, ?)');
        $insert->execute([2, Conditional::class, '{}']);
        $task = $this->notification(Conditional::class, ['rule' => 'selected-rule', 'recipients' => [['email' => 'admin@example.com']]])
            + ['id' => 1, 'formId' => 1, 'formName' => 'Contact'];
        $this->assertSame([], $this->notificationScan()->scanTask($task)['results']);
    }

    private function uploadTask(): array
    {
        return ['table' => '{{%uploads}}', 'column' => 'uploads', 'form' => 'Contact', 'field' => 'Files', 'columns' => [], 'encrypted' => false, 'invalid' => false];
    }

    private function insertUploads(int $id, array $value): void
    {
        $this->pdo->prepare('INSERT INTO craft_uploads VALUES (?, ?)')->execute([$id, json_encode($value)]);
    }

    private function notification(string $class, array $metadata): array
    {
        return ['class' => $class, 'metadata' => json_encode($metadata + ['template' => 1])];
    }

    private function notificationScan(array $template = []): NotificationReadinessScan
    {
        return new NotificationReadinessScan($this->db, static fn () => $template + ['subject' => 'Hello', 'fromName' => 'Site', 'fromEmail' => 'site@example.com']);
    }
}

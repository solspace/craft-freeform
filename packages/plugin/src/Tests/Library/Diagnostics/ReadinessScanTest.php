<?php

namespace Solspace\Freeform\Tests\Library\Diagnostics;

use craft\db\Connection;
use craft\elements\Asset;
use craft\models\Volume;
use craft\queue\Queue;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Fields\Implementations\DropdownField;
use Solspace\Freeform\Fields\Implementations\EmailField as EmailInput;
use Solspace\Freeform\Fields\Implementations\FileUploadField;
use Solspace\Freeform\Fields\Implementations\Pro\TableField;
use Solspace\Freeform\Fields\Properties\Options\Elements\Types\Entries\Entries;
use Solspace\Freeform\Fields\Properties\Options\Elements\Types\Users\Users;
use Solspace\Freeform\Integrations\CRM\Salesforce\BaseSalesforceIntegration;
use Solspace\Freeform\Integrations\Other\Supabase\Supabase;
use Solspace\Freeform\Library\Diagnostics\IntegrationReadinessScan;
use Solspace\Freeform\Library\Diagnostics\NotificationReadinessScan;
use Solspace\Freeform\Library\Diagnostics\QueueHealthScan;
use Solspace\Freeform\Library\Diagnostics\UploadIntegrityScan;
use Solspace\Freeform\Library\Helpers\EncryptionHelper;
use Solspace\Freeform\Library\Integrations\Types\EmailMarketing\EmailMarketingIntegration;
use Solspace\Freeform\Notifications\Types\Admin\Admin;
use Solspace\Freeform\Notifications\Types\Conditional\Conditional;
use Solspace\Freeform\Notifications\Types\Dynamic\Dynamic;
use Solspace\Freeform\Notifications\Types\EmailField\EmailField;
use yii\base\Security;
use yii\db\Command;
use yii\db\sqlite\Schema;

#[CoversClass(UploadIntegrityScan::class)]
#[CoversClass(NotificationReadinessScan::class)]
#[CoversClass(IntegrationReadinessScan::class)]
#[CoversClass(QueueHealthScan::class)]
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
        $this->pdo->exec('CREATE TABLE craft_freeform_submissions (id INTEGER PRIMARY KEY, formId INTEGER, statusId INTEGER DEFAULT 1, isSpam INTEGER DEFAULT 0, isHidden INTEGER DEFAULT 0)');
        $this->pdo->exec('CREATE TABLE craft_freeform_statuses (id INTEGER PRIMARY KEY)');
        $this->pdo->exec('INSERT INTO craft_freeform_statuses VALUES (1)');
        $this->pdo->exec('CREATE TABLE craft_elements (id INTEGER PRIMARY KEY, dateDeleted TEXT, archived INTEGER DEFAULT 0, type TEXT DEFAULT '.$this->pdo->quote(Submission::class).')');
        $this->pdo->exec('CREATE TABLE craft_sites (id INTEGER PRIMARY KEY, handle TEXT)');
        $this->pdo->exec("INSERT INTO craft_sites VALUES (1, 'default')");
        $this->pdo->exec('CREATE TABLE craft_elements_sites (elementId INTEGER, siteId INTEGER)');
        $this->pdo->exec('CREATE TABLE craft_freeform_forms_sites (formId INTEGER, siteId INTEGER)');
        $this->pdo->exec('INSERT INTO craft_freeform_forms_sites VALUES (1, 1)');
        $this->insertSubmission(1);
        $this->insertSubmission(10);
        $this->pdo->exec("CREATE TABLE craft_freeform_forms (id INTEGER PRIMARY KEY, name TEXT, handle TEXT, dateArchived TEXT, uid TEXT DEFAULT 'form-uid')");
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
        $this->assertSame([2, 3, 4], array_column(array_column($result['results'], 'context'), 'asset'));
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

    public function testUnreadableValuesAreNeverReportedAsClean(): void
    {
        $scan = new UploadIntegrityScan($this->db, static function () { throw new \LogicException('Must not check invalid IDs.'); });
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
        $this->pdo->exec("INSERT INTO craft_freeform_forms (id, name, handle, dateArchived) VALUES (1, 'Contact', 'contact', NULL)");
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
        $this->pdo->exec("INSERT INTO craft_freeform_forms (id, name, handle, dateArchived) VALUES (1, 'Contact', 'contact', NULL), (2, 'Archived', 'archive', '2026-10-01')");
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
        $this->assertSame('Recipient {recipient} has an invalid email: “{value}”.', $issues[0]['message']);
        $this->assertSame(['recipient' => 1, 'value' => 'invalid'], $issues[0]['params']);
        $this->assertSame('Notification template “{template}” no longer exists.', $issues[1]['message']);
        $this->assertSame(['template' => '1'], $issues[1]['params']);
        $this->assertFalse($issues[1]['skipped']);
    }

    public function testArbitraryEnvironmentReferencesAreResolvedForSendersAndRecipients(): void
    {
        $name = 'FREEFORM_DIAGNOSTICS_WHATEVER_75249';
        $previous = $_SERVER[$name] ?? null;

        try {
            $_SERVER[$name] = 'custom@example.com';
            foreach (['$'.$name, '${'.$name.'}'] as $reference) {
                $issues = $this->notificationScan(['fromEmail' => $reference])->check(
                    $this->notification(Admin::class, ['recipients' => [['email' => $reference]]]),
                    []
                );
                $this->assertSame([], $issues);
            }
        } finally {
            if (null === $previous) {
                unset($_SERVER[$name]);
            } else {
                $_SERVER[$name] = $previous;
            }
        }
    }

    public function testInvalidEnvironmentValuesRetainOnlyTheConfiguredReferenceInFindings(): void
    {
        $name = 'FREEFORM_DIAGNOSTICS_INVALID_75249';
        $previous = $_SERVER[$name] ?? null;
        $reference = '$'.$name;

        try {
            foreach ([null, '', 'private-invalid-value', 'true'] as $value) {
                if (null === $value) {
                    unset($_SERVER[$name]);
                } else {
                    $_SERVER[$name] = $value;
                }
                $issues = $this->notificationScan(['fromEmail' => $reference])->check(
                    $this->notification(Admin::class, ['recipients' => [['email' => $reference]]]),
                    []
                );
                $this->assertCount(2, $issues);
                $this->assertSame($reference, $issues[0]['params']['value']);
                $this->assertSame($reference, $issues[1]['params']['value']);
                $this->assertStringNotContainsString('private-invalid-value', json_encode($issues));
            }
        } finally {
            if (null === $previous) {
                unset($_SERVER[$name]);
            } else {
                $_SERVER[$name] = $previous;
            }
        }
    }

    public function testTemplateFindingsIdentifyTheirOwnerForEditorLinks(): void
    {
        $notification = $this->notification(Admin::class, ['recipients' => [['email' => 'site@example.com']]]);
        $issues = $this->notificationScan(['subject' => '', 'formId' => 7])->check($notification, []);
        $this->assertSame(['id' => '1', 'formId' => 7, 'exists' => true], $issues[0]['template']);
        $issues = (new NotificationReadinessScan($this->db, static fn () => false))->check($notification, []);
        $this->assertSame(['id' => '1', 'formId' => 0, 'exists' => false], $issues[0]['template']);
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
        $this->assertSame('Notification template “{template}” no longer exists.', $issues[0]['message']);
        $this->assertSame(['template' => '99'], $issues[0]['params']);
    }

    public function testUserEmailOptionsDoNotRequireSavedRecipientMappings(): void
    {
        $this->pdo->prepare('INSERT INTO craft_freeform_forms_fields (id, formId, type, uid, metadata) VALUES (1, 1, ?, ?, ?)')->execute([
            DropdownField::class, 'users', json_encode(['optionConfiguration' => [
                'source' => 'elements', 'typeClass' => Users::class, 'properties' => ['value' => 'email', 'label' => 'fullName'],
            ]]),
        ]);
        $task = $this->notification(Dynamic::class, ['field' => 'users', 'recipients' => [], 'recipientMapping' => []])
            + ['id' => 150, 'formId' => 1, 'formName' => 'Newsletter'];
        $this->assertSame([], $this->notificationScan()->scanTask($task)['results']);
    }

    public function testEntryCustomValueFieldsCanSupplyEmailRecipientsByHandleOrId(): void
    {
        $lookups = [];
        $scan = $this->notificationScan(elementFieldExists: static function ($field) use (&$lookups) {
            $lookups[] = $field;

            return \in_array($field, ['contactEmail', '87'], true);
        });
        $notification = $this->notification(Dynamic::class, ['field' => 'entries']);
        foreach (['contactEmail', '87'] as $value) {
            $fields = ['entries' => ['type' => DropdownField::class, 'metadata' => json_encode(['optionConfiguration' => [
                'source' => 'elements', 'typeClass' => Entries::class, 'properties' => ['value' => $value],
            ]])]];
            $this->assertSame([], $scan->check($notification, $fields));
        }
        $this->assertSame(['contactEmail', '87'], $lookups);
    }

    public function testCustomOptionsAndMappingValuesCanSupplyEmailRecipients(): void
    {
        $fields = ['choice' => ['type' => DropdownField::class, 'metadata' => json_encode(['optionConfiguration' => [
            'source' => 'custom', 'options' => [
                ['label' => 'Please choose', 'value' => ''], ['label' => 'Team', 'value' => 'team@example.com'],
            ],
        ]])]];
        $notification = $this->notification(Dynamic::class, ['field' => 'choice']);
        $this->assertSame([], $this->notificationScan()->check($notification, $fields));
        $notification = $this->notification(Dynamic::class, ['field' => 'choice', 'recipientMapping' => [
            ['value' => 'team@example.com', 'recipients' => []],
        ]]);
        $this->assertSame([], $this->notificationScan()->check($notification, ['choice' => ['type' => DropdownField::class]]));
    }

    public function testNonEmailOptionsAndMissingElementFieldsStillRequireRecipients(): void
    {
        $scan = $this->notificationScan(elementFieldExists: static fn () => false);
        $notification = $this->notification(Dynamic::class, ['field' => 'choice']);
        foreach ([
            ['source' => 'elements', 'typeClass' => Users::class, 'properties' => ['value' => 'id']],
            ['source' => 'elements', 'typeClass' => Entries::class, 'properties' => ['value' => 'missingField']],
            ['source' => 'custom', 'options' => [['value' => 'not-an-email']]],
            ['source' => 'custom', 'options' => [['value' => 'group@example.com', 'optgroup' => true]]],
            ['source' => 'predefined'],
        ] as $configuration) {
            $fields = ['choice' => ['type' => DropdownField::class, 'metadata' => json_encode(['optionConfiguration' => $configuration])]];
            $issues = $scan->check($notification, $fields);
            $this->assertCount(1, $issues);
            $this->assertSame('No recipients or recipient mappings are configured.', $issues[0]['message']);
        }
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
        $issues = $this->notificationScan(['name' => 'Admin template', 'subject' => '', 'fromEmail' => 'invalid'])->check(
            $this->notification(Admin::class, ['recipients' => [['email' => 'admin@example.com']]]),
            []
        );
        $this->assertCount(2, $issues);
        $this->assertSame(['template' => 'Admin template', 'value' => 'invalid'], $issues[1]['params']);
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

    public function testNotificationNameAndLiteralInvalidValueArePreserved(): void
    {
        $task = $this->notification(Admin::class, ['name' => 'Admin <Team>', 'recipients' => [['email' => '<invalid@example>']]])
            + ['id' => 42, 'formId' => 1, 'formName' => 'Contact'];
        $result = $this->notificationScan()->scanTask($task);
        $this->assertSame('Admin <Team>', $result['results'][0]['context']['notificationName']);
        $this->assertSame('42', $result['results'][0]['context']['notification']);
        $this->assertSame('<invalid@example>', $result['results'][0]['params']['value']);
    }

    public function testEmptyEmailIsReportedWithoutAnInvalidValuePlaceholder(): void
    {
        $issues = $this->notificationScan(['fromEmail' => ''])->check($this->notification(Admin::class, ['recipients' => [['email' => '']]]), []);
        $this->assertSame('Recipient {recipient} has an empty email.', $issues[0]['message']);
        $this->assertSame(['recipient' => 1], $issues[0]['params']);
        $this->assertSame('Notification template “{template}” has no sender email.', $issues[1]['message']);
    }

    public function testEncryptedUploadValuesUseTheFormKeyWithoutChangingStoredData(): void
    {
        $security = new Security();
        \Craft::$app = new class($security) {
            public function __construct(private $security) {}

            public function getSecurity()
            {
                return $this->security;
            }
        };
        $key = 'diagnostic-test-key-form-uid';
        $encrypted = EncryptionHelper::encrypt($key, '[1,2]');
        $this->pdo->prepare('INSERT INTO craft_uploads VALUES (1, ?)')->execute([$encrypted]);
        $decrypt = function ($value, $formUid) use ($key) {
            $this->assertSame('form-uid', $formUid);

            return EncryptionHelper::decrypt($key, $value);
        };
        $scan = new UploadIntegrityScan($this->db, static fn ($id) => $id === 2 ? 'The referenced asset no longer exists.' : null, $decrypt);
        // Encrypted values can remain after the field's encryption setting is disabled.
        $result = $scan->scanTask($this->uploadTask());
        $this->assertSame(2, $result['scanned']);
        $this->assertFalse($result['results'][0]['informational']);
        $this->assertSame(2, $result['results'][0]['context']['asset']);
        $this->assertSame($encrypted, $this->pdo->query('SELECT uploads FROM craft_uploads')->fetchColumn());
    }

    public function testFailedDecryptionIsInformationalAndAdvancesTheScan(): void
    {
        $this->pdo->exec("INSERT INTO craft_uploads VALUES (10, 'encrypted:unavailable')");
        $scan = new UploadIntegrityScan($this->db, static function () { throw new \LogicException('Must not check ciphertext as an asset ID.'); }, static fn () => false);
        $result = $scan->scanTask($this->uploadTask());
        $this->assertTrue($result['complete']);
        $this->assertSame(10, $result['cursor']);
        $this->assertSame(0, $result['scanned']);
        $this->assertTrue($result['results'][0]['skipped']);
        $this->assertTrue($result['results'][0]['informational']);
    }

    public function testTrashedSubmissionsAreNotReportedAsMissingUploads(): void
    {
        $this->pdo->exec("INSERT INTO craft_uploads VALUES (1, 'encrypted:deleted-submission')");
        $this->pdo->exec("UPDATE craft_elements SET dateDeleted = '2026-10-07' WHERE id = 1");
        $this->insertUploads(10, [4]);
        $calls = [];
        $scan = new UploadIntegrityScan($this->db, static function ($id) use (&$calls) {
            $calls[] = $id;

            return null;
        }, static function () { throw new \LogicException('Trashed values must not be decrypted.'); });
        $result = $scan->scanTask($this->uploadTask());
        $this->assertSame([], $result['results']);
        $this->assertSame([4], $calls);
        $this->assertSame(1, $result['scanned']);
        $this->assertSame(10, $result['cursor']);
        $this->assertTrue($result['complete']);
    }

    public function testUnavailableSubmissionRowsAreReportedSeparatelyFromMissingAssets(): void
    {
        foreach ([2, 3, 4, 6] as $id) {
            $this->insertUploads($id, [99]);
        }
        $this->insertUploads(5, []);
        $this->pdo->exec('DELETE FROM craft_freeform_submissions WHERE id IN (2, 5)');
        $this->pdo->exec('DELETE FROM craft_elements WHERE id = 3');
        $this->pdo->exec('UPDATE craft_freeform_submissions SET formId = 9 WHERE id = 4');
        $this->pdo->exec('DELETE FROM craft_elements_sites WHERE elementId = 6');
        $scan = new UploadIntegrityScan($this->db, static function () { throw new \LogicException('Unavailable submissions must not trigger asset checks.'); });
        $result = $scan->scanTask($this->uploadTask());
        $this->assertSame(0, $result['scanned']);
        $this->assertCount(4, $result['results']);
        $this->assertSame([2, 3, 4, 6], array_column(array_column($result['results'], 'context'), 'submission'));
        $this->assertSame('related', $result['results'][0]['context']['integrityCheck']);
        $this->assertSame('orphan', $result['results'][1]['context']['integrityCheck']);
        foreach ($result['results'] as $issue) {
            $this->assertFalse($issue['context']['submissionAvailable']);
            $this->assertArrayNotHasKey('asset', $issue['context']);
            $this->assertFalse($issue['skipped']);
        }
        $this->assertSame(6, $result['cursor']);
        $this->assertTrue($result['complete']);
    }

    public function testUploadFindingsIncludeSpamStatusAndTheSubmissionSite(): void
    {
        $this->insertUploads(10, [99]);
        $this->pdo->exec("INSERT INTO craft_sites VALUES (2, 'german')");
        $this->pdo->exec('UPDATE craft_elements_sites SET siteId = 2 WHERE elementId = 10');
        $this->pdo->exec('UPDATE craft_freeform_submissions SET isSpam = 1 WHERE id = 10');
        $result = (new UploadIntegrityScan($this->db, static fn () => 'The referenced asset no longer exists.'))->scanTask($this->uploadTask());
        $context = $result['results'][0]['context'];
        $this->assertTrue($context['submissionAvailable']);
        $this->assertTrue($context['isSpam']);
        $this->assertSame('german', $context['siteHandle']);
        $this->assertSame(99, $context['asset']);
    }

    public function testMissingStatusAndIncompatibleElementAreNotReportedAsMissingAssets(): void
    {
        $this->insertUploads(8669, [8668]);
        $this->insertUploads(8673, [8672]);
        $this->pdo->exec('UPDATE craft_freeform_submissions SET statusId = 99 WHERE id = 8669');
        $this->pdo->prepare('UPDATE craft_elements SET type = ? WHERE id = 8673')->execute([Asset::class]);
        $scan = new UploadIntegrityScan($this->db, static function () { throw new \LogicException('Broken submission records must not trigger asset checks.'); });
        $result = $scan->scanTask($this->uploadTask());
        $this->assertSame(0, $result['scanned']);
        $this->assertCount(2, $result['results']);
        $this->assertStringContainsString('status no longer exists', $result['results'][0]['message']);
        $this->assertStringContainsString('incompatible Craft element', $result['results'][1]['message']);
        foreach ($result['results'] as $issue) {
            $this->assertFalse($issue['context']['submissionAvailable']);
            $this->assertSame('console', $issue['context']['integrityCheck']);
            $this->assertArrayNotHasKey('asset', $issue['context']);
        }
    }

    public function testLinksSelectAStoredSiteThatIsAlsoAssignedToTheForm(): void
    {
        $this->insertUploads(10, [99]);
        $this->pdo->exec("INSERT INTO craft_sites VALUES (2, 'german')");
        $this->pdo->exec('INSERT INTO craft_elements_sites VALUES (10, 2)');
        $this->pdo->exec('UPDATE craft_freeform_forms_sites SET siteId = 2 WHERE formId = 1');
        $scan = new UploadIntegrityScan($this->db, static fn () => 'The referenced asset no longer exists.', sitesEnabled: true);
        $result = $scan->scanTask($this->uploadTask());
        $this->assertTrue($result['results'][0]['context']['submissionAvailable']);
        $this->assertSame('german', $result['results'][0]['context']['siteHandle']);
        $this->pdo->exec('DELETE FROM craft_freeform_forms_sites');
        $result = $scan->scanTask($this->uploadTask());
        $this->assertFalse($result['results'][0]['context']['submissionAvailable']);
        $this->assertSame('The submission is unavailable in the form’s assigned sites. Check the form’s site settings.', $result['results'][0]['message']);
        $result = (new UploadIntegrityScan($this->db, static fn () => 'The referenced asset no longer exists.'))->scanTask($this->uploadTask());
        $this->assertTrue($result['results'][0]['context']['submissionAvailable']);
        $this->assertSame('default', $result['results'][0]['context']['siteHandle']);
    }

    public function testArchivedElementsAndHiddenSpamAreExcludedButHiddenSubmissionsCanBeOpened(): void
    {
        foreach ([1, 2, 3] as $id) {
            $this->insertUploads($id, [99]);
        }
        $this->pdo->exec('UPDATE craft_elements SET archived = 1 WHERE id = 1');
        $this->pdo->exec('UPDATE craft_freeform_submissions SET isSpam = 1, isHidden = 1 WHERE id = 2');
        $this->pdo->exec('UPDATE craft_freeform_submissions SET isHidden = 1 WHERE id = 3');
        $result = (new UploadIntegrityScan($this->db, static fn () => 'The referenced asset no longer exists.'))->scanTask($this->uploadTask());
        $this->assertSame(1, $result['scanned']);
        $this->assertCount(1, $result['results']);
        $this->assertSame(3, $result['results'][0]['context']['submission']);
        $this->assertTrue($result['results'][0]['context']['submissionAvailable']);
    }

    public function testPostgresBooleanStringsDoNotChangeSubmissionAvailabilityOrSpamLinks(): void
    {
        $this->insertUploads(1, [99]);
        $this->insertUploads(2, [99]);
        $this->pdo->exec("UPDATE craft_elements SET archived = 'f'");
        $this->pdo->exec("UPDATE craft_freeform_submissions SET isSpam = 'f', isHidden = 'f'");
        $this->pdo->exec("UPDATE craft_freeform_submissions SET isSpam = 't' WHERE id = 2");
        $result = (new UploadIntegrityScan($this->db, static fn () => 'The referenced asset no longer exists.'))->scanTask($this->uploadTask());
        $this->assertSame(2, $result['scanned']);
        $this->assertSame([false, true], array_column(array_column($result['results'], 'context'), 'isSpam'));
        $this->assertSame([true, true], array_column(array_column($result['results'], 'context'), 'submissionAvailable'));
    }

    public function testPlainUploadValuesDoNotNeedDecryption(): void
    {
        $this->insertUploads(1, [1]);
        $scan = new UploadIntegrityScan($this->db, static fn () => null, static function () { throw new \LogicException('Plain values do not need decryption.'); });
        $result = $scan->scanTask($this->uploadTask());
        $this->assertSame(1, $result['scanned']);
        $this->assertSame([], $result['results']);
    }

    public function testIntegrationCredentialsAreCheckedWithoutExposingValuesOrCallingServices(): void
    {
        $scan = new IntegrationReadinessScan($this->db, static fn ($value) => 'encrypted-secret' === $value ? 'resolved-secret' : false);
        $context = ['integration' => 1];
        $settings = ['projectUrl' => 'https://example.test', 'apiKey' => 'encrypted-secret', 'schema' => 'public'];
        $this->assertSame([], $scan->check(Supabase::class, $settings, [], $context, false));
        $settings['apiKey'] = '$FREEFORM_DIAGNOSTICS_NONEXISTENT_SECRET';
        $issues = $scan->check(Supabase::class, $settings, [], $context, false);
        $this->assertCount(1, $issues);
        $this->assertStringContainsString('required setting', $issues[0]['message']);
        $settings['apiKey'] = 'invalid-ciphertext';
        $issues = $scan->check(Supabase::class, $settings, [], $context, false);
        $this->assertTrue($issues[0]['skipped']);
        $this->assertStringNotContainsString('invalid-ciphertext', json_encode($issues));
        $this->assertStringNotContainsString('resolved-secret', json_encode($issues));
    }

    public function testIntegrationMappingsPreserveCustomValuesAndFlagMissingFields(): void
    {
        $scan = new IntegrationReadinessScan($this->db);
        $metadata = ['table' => 'contacts', 'fieldMapping' => ['email' => ['type' => 'relation', 'value' => 'email-field'], 'name' => ['type' => 'custom', 'value' => '{{ submission.id }}']]];
        $this->assertSame([], $scan->check(Supabase::class, $metadata, ['email-field' => ['type' => EmailInput::class]], [], true));
        $result = $scan->check(Supabase::class, $metadata, [], [], true);
        $this->assertCount(1, $result);
        $this->assertStringContainsString('no longer exists', $result[0]['message']);
        $metadata['fieldMapping']['email'] = ['value' => 'missing-type'];
        $this->assertStringContainsString('incomplete entry', $scan->check(Supabase::class, $metadata, [], [], true)[0]['message']);
        $metadata['table'] = '';
        $result = $scan->check(Supabase::class, $metadata, [], [], true);
        $this->assertCount(1, $result, 'Hidden mappings must not generate warnings when the required table is missing.');
        $this->assertStringContainsString('required setting', $result[0]['message']);
        $this->assertSame([], $scan->check(Supabase::class, ['table' => 'contacts'], [], [], true), 'Unmapped columns may have database defaults.');
    }

    public function testOAuthAuthorizationIsCheckedLocallyWithoutTrustingTheConnectionFlag(): void
    {
        $scan = new IntegrationReadinessScan($this->db, static fn ($value) => 'unreadable' === $value ? false : 'secret-token');
        $class = BaseSalesforceIntegration::class;
        $metadata = ['clientId' => 'saved-id', 'clientSecret' => 'saved-secret', 'accessToken' => 'saved-token'];
        $this->assertSame([], $scan->check($class, $metadata, [], [], false));
        $metadata['accessToken'] = '';
        $issues = $scan->check($class, $metadata, [], [], false);
        $this->assertCount(1, $issues);
        $this->assertStringContainsString('Authorize it again', $issues[0]['message']);
        $metadata['accessToken'] = 'unreadable';
        $this->assertCount(1, $scan->check($class, $metadata, [], [], false));
        $this->assertStringNotContainsString('secret-token', json_encode($issues));
    }

    public function testIntegrationEmailFieldsMustExistAndHaveCompatibleTypes(): void
    {
        $scan = new IntegrationReadinessScan($this->db);
        $metadata = ['mailingList' => ['id' => 'list'], 'emailField' => 'email-field'];
        $this->assertSame([], $scan->check(EmailMarketingIntegration::class, $metadata, ['email-field' => ['type' => EmailInput::class]], [], true));
        $result = $scan->check(EmailMarketingIntegration::class, $metadata, ['email-field' => ['type' => DropdownField::class]], [], true);
        $this->assertCount(1, $result);
        $this->assertStringContainsString('incompatible type', $result[0]['message']);
    }

    public function testIntegrationTasksExcludeDisabledAndArchivedConnectionsAndKeepCredentialsOutOfCache(): void
    {
        $this->pdo->exec('CREATE TABLE craft_freeform_integrations (id INTEGER PRIMARY KEY, enabled INTEGER, name TEXT, type TEXT, class TEXT, metadata TEXT)');
        $this->pdo->exec('CREATE TABLE craft_freeform_forms_integrations (id INTEGER PRIMARY KEY, formId INTEGER, integrationId INTEGER, enabled INTEGER, metadata TEXT)');
        $insert = $this->pdo->prepare('INSERT INTO craft_freeform_integrations VALUES (?, ?, ?, ?, ?, ?)');
        $insert->execute([1, 1, 'Supabase', 'other', Supabase::class, json_encode(['apiKey' => 'secret-value', 'projectUrl' => 'https://example.test'])]);
        $insert->execute([2, 0, 'Disabled', 'other', Supabase::class, '{}']);
        $this->pdo->exec("INSERT INTO craft_freeform_forms (id, name, dateArchived) VALUES (1, 'Active', NULL), (2, 'Archived', '2026-10-07')");
        $this->pdo->exec("INSERT INTO craft_freeform_forms_integrations VALUES (1, 1, 1, 1, '{\"table\":\"contacts\"}'), (2, 1, 1, 0, '{}'), (3, 2, 1, 1, '{}'), (4, 1, 2, 1, '{}'), (5, 1, 999, 1, '{}')");
        $scan = new IntegrationReadinessScan($this->db, static fn () => 'secret-value');
        $tasks = $scan->getTasks();
        $this->assertSame([['id' => 1, 'scope' => 'global'], ['id' => 1, 'scope' => 'form'], ['id' => 5, 'scope' => 'form']], $tasks);
        $this->assertStringNotContainsString('secret-value', json_encode($tasks));
        $this->assertSame([], $scan->scanTask($tasks[1])['results']);
        $this->pdo->exec("UPDATE craft_freeform_forms_integrations SET metadata = '{}' WHERE id = 1");
        $this->assertSame('Supabase', $scan->scanTask($tasks[1])['results'][0]['context']['integrationClass']);
        $this->assertStringContainsString('no longer exists', $scan->scanTask($tasks[2])['results'][0]['message']);
        $this->pdo->exec("UPDATE craft_freeform_forms_integrations SET metadata = 'invalid' WHERE id = 1");
        $this->assertTrue($scan->scanTask($tasks[1])['results'][0]['skipped']);
        $this->pdo->exec('UPDATE craft_freeform_integrations SET enabled = 0 WHERE id = 1');
        $this->assertSame(0, $scan->scanTask($tasks[0])['scanned']);
    }

    public function testQueueHealthRespectsDelaysChannelsAndRunTimeWithoutReadingPayloadsOrWriting(): void
    {
        $this->pdo->exec('CREATE TABLE craft_queue (id INTEGER PRIMARY KEY, channel TEXT, fail INTEGER, timePushed INTEGER, delay INTEGER, timeUpdated INTEGER, ttr INTEGER)');
        $this->pdo->exec("INSERT INTO craft_queue VALUES (1, 'queue', 1, 9999, 0, NULL, 300), (2, 'queue', 0, 1000, 0, 9500, 300), (3, 'queue', 0, 1000, 0, 9950, 300), (4, 'queue', 0, 1000, 10000, NULL, 300), (5, 'queue', 0, 6000, 0, NULL, 300), (6, 'queue', 0, 9950, 0, NULL, 300), (7, 'other', 1, 1000, 0, NULL, 300)");
        $queue = (new \ReflectionClass(Queue::class))->newInstanceWithoutConstructor();
        $queue->db = $this->db;
        $scan = new QueueHealthScan($queue, 10000);
        $result = $scan->scanTask([]);
        $this->assertTrue($result['complete']);
        $this->assertSame(6, $result['scanned']);
        $this->assertSame([1, 2, 5], array_column(array_column($result['results'], 'context'), 'job'));
        $this->assertStringContainsString('failed', $result['results'][0]['message']);
        $this->assertStringContainsString('may be stalled', $result['results'][1]['message']);
        $this->assertSame(7, (int) $this->pdo->query('SELECT COUNT(*) FROM craft_queue')->fetchColumn());
        $queue->channel = 'other';
        $this->assertSame(1, $scan->scanTask([])['scanned']);
    }

    public function testQueueHealthBatchesAndExcludesNewJobsAndReportsUnsupportedDrivers(): void
    {
        $unsupported = (new QueueHealthScan(new \stdClass()))->scanTask([]);
        $this->assertSame(0, $unsupported['scanned']);
        $this->assertTrue($unsupported['results'][0]['skipped']);
        $this->pdo->exec('CREATE TABLE craft_queue (id INTEGER PRIMARY KEY, channel TEXT, fail INTEGER, timePushed INTEGER, delay INTEGER, timeUpdated INTEGER, ttr INTEGER)');
        $queue = (new \ReflectionClass(Queue::class))->newInstanceWithoutConstructor();
        $queue->db = $this->db;
        $scan = new QueueHealthScan($queue, 10000);
        $this->assertSame([], $scan->scanTask([])['results']);
        $this->assertTrue($scan->scanTask([])['complete']);
        for ($id = 1; $id <= 30; ++$id) {
            $this->pdo->exec("INSERT INTO craft_queue VALUES ({$id}, 'queue', 0, 9999, 0, NULL, 300)");
        }
        $first = $scan->scanTask([]);
        $this->assertFalse($first['complete']);
        $this->assertSame(25, $first['scanned']);
        $this->pdo->exec("INSERT INTO craft_queue VALUES (31, 'queue', 1, 9999, 0, NULL, 300)");
        $last = $scan->scanTask([], $first['cursor'], $first['maxId']);
        $this->assertTrue($last['complete']);
        $this->assertSame(5, $last['scanned']);
        $this->assertSame([], $last['results']);
    }

    private function uploadTask(): array
    {
        return ['table' => '{{%uploads}}', 'column' => 'uploads', 'form' => 'Contact', 'formId' => 1, 'formUid' => 'form-uid', 'field' => 'Files', 'columns' => [], 'invalid' => false];
    }

    private function insertUploads(int $id, array $value): void
    {
        $this->insertSubmission($id);
        $this->pdo->prepare('INSERT INTO craft_uploads VALUES (?, ?)')->execute([$id, json_encode($value)]);
    }

    private function insertSubmission(int $id): void
    {
        $this->pdo->prepare('INSERT OR IGNORE INTO craft_freeform_submissions (id, formId) VALUES (?, 1)')->execute([$id]);
        $this->pdo->prepare('INSERT OR IGNORE INTO craft_elements (id) VALUES (?)')->execute([$id]);
        $this->pdo->prepare('INSERT INTO craft_elements_sites (elementId, siteId) SELECT ?, 1 WHERE NOT EXISTS (SELECT 1 FROM craft_elements_sites WHERE elementId = ?)')->execute([$id, $id]);
    }

    private function notification(string $class, array $metadata): array
    {
        return ['class' => $class, 'metadata' => json_encode($metadata + ['template' => 1])];
    }

    private function notificationScan(array $template = [], ?\Closure $elementFieldExists = null): NotificationReadinessScan
    {
        return new NotificationReadinessScan($this->db, static fn () => $template + ['subject' => 'Hello', 'fromName' => 'Site', 'fromEmail' => 'site@example.com'], $elementFieldExists);
    }
}

<?php

namespace Solspace\Freeform\Tests\Elements;

use craft\behaviors\CustomFieldBehavior;
use craft\db\Connection;
use craft\elements\User;
use craft\services\Plugins;
use craft\web\Request;
use Illuminate\Database\SQLiteConnection;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Elements\Db\SubmissionQuery;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\EditionHelper;
use Solspace\Freeform\Services\FormsService;
use Solspace\Freeform\Tests\Fixtures\CustomFieldQueryBehavior;
use Solspace\Freeform\Tests\Helpers\UsesCraft6Container;
use yii\di\Container;

#[CoversClass(SubmissionQuery::class)]
#[CoversClass(Submission::class)]
class SubmissionReadPermissionsTest extends TestCase
{
    use UsesCraft6Container;

    private mixed $previousApp;
    private mixed $previousYiiApp;
    private Container $previousContainer;

    protected function setUp(): void
    {
        $this->previousApp = \Craft::$app;
        $this->previousYiiApp = \Yii::$app;
        $this->previousContainer = \Yii::$container;
        \Yii::$container = new Container([
            'definitions' => [CustomFieldBehavior::class => CustomFieldQueryBehavior::class],
        ]);
    }

    protected function tearDown(): void
    {
        \Craft::$app = $this->previousApp;
        \Yii::$app = $this->previousYiiApp;
        \Yii::$container = $this->previousContainer;
    }

    #[DataProvider('elementPermissions')]
    public function testElementVisibilityUsesTheSuppliedUsersReadOrManagePermissions(array $permissions, bool $expected): void
    {
        $user = $this->createStub(User::class);
        $user->method('can')->willReturnCallback(static fn ($permission) => \in_array($permission, $permissions, true));
        $submission = (new \ReflectionClass(Submission::class))->newInstanceWithoutConstructor();
        $submission->formId = 1;

        self::assertSame($expected, $submission->canView($user));
    }

    public static function elementPermissions(): iterable
    {
        yield 'no permissions' => [[], false];

        yield 'CP access alone' => [['accessCp'], false];

        yield 'read another form' => [[Freeform::PERMISSION_SUBMISSIONS_READ.':2'], false];

        yield 'manage another form' => [[Freeform::PERMISSION_SUBMISSIONS_MANAGE.':2'], false];

        yield 'read this form' => [[Freeform::PERMISSION_SUBMISSIONS_READ.':1'], true];

        yield 'manage this form' => [[Freeform::PERMISSION_SUBMISSIONS_MANAGE.':1'], true];

        yield 'read all forms' => [[Freeform::PERMISSION_SUBMISSIONS_READ], true];

        yield 'manage all forms' => [[Freeform::PERMISSION_SUBMISSIONS_MANAGE], true];
    }

    #[DataProvider('readScenarios')]
    public function testQueriesReturnOnlyReadableSubmissions(mixed $formId, array $allowedIds, ?string $bodyContext, bool $cp, bool $console, bool $spam, array $expected, string $path = 'actions/element-indexes/get-elements'): void
    {
        $db = new Connection(['dsn' => 'sqlite::memory:']);
        $db->createCommand('CREATE TABLE freeform_submissions (id INTEGER, formId INTEGER, statusId INTEGER, isSpam INTEGER, isHidden INTEGER)')->execute();
        $db->createCommand('CREATE TABLE freeform_statuses (id INTEGER)')->execute();
        $db->createCommand('CREATE TABLE freeform_forms (id INTEGER)')->execute();
        $db->createCommand()->batchInsert('freeform_forms', ['id'], [[1], [2]])->execute();
        $db->createCommand()->insert('freeform_statuses', ['id' => 1])->execute();
        $db->createCommand()->batchInsert('freeform_submissions', ['id', 'formId', 'statusId', 'isSpam', 'isHidden'], [
            [11, 1, 1, 0, 0],
            [22, 2, 1, 0, 0],
            [23, 2, 1, 1, 0],
        ])->execute();

        $request = $this->createStub(Request::class);
        $request->method('getIsCpRequest')->willReturn($cp);
        $request->method('getIsConsoleRequest')->willReturn($console);
        $request->method('getPathInfo')->willReturn($path);
        $request->method('post')->willReturnCallback(static fn ($key) => 'context' === $key ? $bodyContext : null);
        $request->method('getQueryParam')->willReturnCallback(static fn ($key) => 'context' === $key ? 'index' : null);
        $forms = $this->createStub(FormsService::class);
        $forms->method('getAllForms')->willReturn([]);
        $forms->method('getAllowedReadFormIds')->willReturn($allowedIds);
        $plugin = $this->getMockBuilder(Freeform::class)->disableOriginalConstructor()->onlyMethods(['__get', 'edition'])->getMock();
        app()->instance(Freeform::class, $plugin);
        $plugin->method('__get')->with('forms')->willReturn($forms);
        $plugin->method('edition')->willReturn(new EditionHelper(Freeform::EDITION_EXPRESS, [Freeform::EDITION_EXPRESS, Freeform::EDITION_PRO]));
        \Yii::$app = (object) ['loadedModules' => [Freeform::class => $plugin]];
        \Craft::$app = new class($request, $this->createStub(Plugins::class), $db) {
            public function __construct(private Request $request, private Plugins $plugins, private Connection $db) {}

            public function getRequest(): Request
            {
                return $this->request;
            }

            public function getPlugins(): Plugins
            {
                return $this->plugins;
            }

            public function getDb(): Connection
            {
                return $this->db;
            }
        };

        // Exercise the production preparation and execute its WHERE conditions.
        // Only Craft's element-table join is omitted from this focused fixture.
        $connection = new SQLiteConnection($db->pdo);
        $query = new SubmissionReadPermissionsQuery($connection);
        $query->formId = $formId;
        $query->skipContent(true);
        $query->isSpam = $spam;
        self::assertTrue($query->prepareReadQuery());
        $ids = $query->getQuery()->select('freeform_submissions.id')->orderBy('freeform_submissions.id')->pluck('freeform_submissions.id')->all();
        self::assertSame($expected, array_map('intval', $ids));
    }

    public static function readScenarios(): iterable
    {
        yield 'normal index without permissions' => [null, [], 'index', true, false, false, []];

        yield 'explicit unauthorized form' => [2, [1], 'index', true, false, false, []];

        yield 'explicit form without permissions' => [2, [], 'index', true, false, false, []];

        yield 'query-string context without permissions' => [null, [], null, true, false, false, []];

        yield 'query-string context with restricted forms' => [null, [1], null, true, false, false, [11]];

        yield 'modal context' => [2, [1], 'modal', true, false, false, []];

        yield 'mixed form criteria' => [[1, 2], [1], 'index', true, false, false, [11]];

        yield 'negated form criteria' => ['not 1', [1], 'index', true, false, false, []];

        yield 'empty form criteria stay permission-scoped' => [[], [1], 'index', true, false, false, [11]];

        yield 'allowed form' => [1, [1], 'index', true, false, false, [11]];

        yield 'all forms allowed' => [null, [1, 2], 'index', true, false, false, [11, 22]];

        yield 'spam without permissions' => [2, [], null, true, false, true, []];

        yield 'allowed spam' => [2, [2], null, true, false, true, [23]];

        yield 'export without permissions' => [2, [], 'index', true, false, false, [], 'actions/element-indexes/export'];

        yield 'count without permissions' => [null, [], null, true, false, false, [], 'actions/element-indexes/count-elements'];

        yield 'detail without permissions' => [2, [], null, true, false, false, [], 'freeform/submissions/22'];

        yield 'frontend queries retain their scope' => [2, [], null, false, false, false, [22]];

        yield 'console queries retain their scope' => [2, [], null, true, true, false, [22]];
    }
}

class SubmissionReadPermissionsQuery extends SubmissionQuery
{
    public function __construct(\Illuminate\Database\Connection $connection)
    {
        $this->query = $connection->table('freeform_submissions');
    }

    public function prepareReadQuery(): bool
    {
        return parent::prepareSubmissionQuery();
    }

    protected function joinElementTable(string $table): void {}
}

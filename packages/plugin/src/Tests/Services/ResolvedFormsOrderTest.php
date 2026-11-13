<?php

namespace Solspace\Freeform\Tests\Services;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Services\FormsService;
use yii\db\Command;
use yii\db\Connection;

#[CoversClass(FormsService::class)]
class ResolvedFormsOrderTest extends TestCase
{
    private mixed $previousApp;
    private mixed $previousYiiApp;
    private FormsService $service;

    protected function setUp(): void
    {
        $this->previousApp = \Craft::$app;
        $this->previousYiiApp = \Yii::$app;
        $this->service = (new \ReflectionClass(FormsService::class))->newInstanceWithoutConstructor();
    }

    protected function tearDown(): void
    {
        \Craft::$app = $this->previousApp;
        \Yii::$app = $this->previousYiiApp;
    }

    #[DataProvider('invalidOrders')]
    public function testRejectsExpressionsAndUnknownColumnsBeforeQuerying(mixed $orderBy): void
    {
        $db = $this->createMock(Connection::class);
        $db->expects(self::never())->method('createCommand');
        $this->setDb($db);

        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Invalid form orderBy property.');
        $this->service->getResolvedForms(['orderBy' => $orderBy]);
    }

    public static function invalidOrders(): array
    {
        return [
            ['(CASE WHEN (SELECT COUNT(*) FROM users WHERE admin=1) > 0 THEN forms.id ELSE -forms.id END)'],
            ['(CASE WHEN (SELECT COUNT(*) FROM users WHERE admin=1) > 999999 THEN forms.id ELSE -forms.id END)'],
            ['(SELECT 1)'],
            ['RAND()'],
            ['forms.id DESC'],
            ['forms.id, forms.name'],
            ['forms.id; SELECT 1'],
            ['forms.id -- comment'],
            ['forms.id/*comment*/'],
            ['forms.name COLLATE utf8mb4_bin'],
            ['users.password'],
            ['sites.unknown'],
            ['unknown'],
            [''],
            [['forms.id']],
            [42],
        ];
    }

    #[DataProvider('validOrders')]
    public function testBuildsSupportedOrderingForBothDatabases(string $driver, array $arguments, string $column, int $direction): void
    {
        // Use the real SQL builders without connecting to a database.
        $db = $this->getMockBuilder(Connection::class)
            ->setConstructorArgs([['dsn' => $driver.':host=localhost;dbname=freeform_test', 'schemaCache' => null]])
            ->onlyMethods(['createCommand', 'getServerVersion', 'getSlavePdo'])
            ->getMock()
        ;
        $db->method('getServerVersion')->willReturn('mysql' === $driver ? '8.0.0' : '14.0');
        $pdo = $this->createMock(\PDO::class);
        $pdo->method('getAttribute')->with(\PDO::ATTR_SERVER_VERSION)->willReturn('8.0.0');
        $db->method('getSlavePdo')->willReturn($pdo);
        $command = $this->createMock(Command::class);
        $command->expects(self::once())->method('queryAll')->willReturn([]);
        $db->expects(self::once())->method('createCommand')->willReturnCallback(static function ($sql) use ($db, $column, $direction, $command) {
            $columns = [$column => $direction, 'forms.name' => \SORT_ASC];
            $expected = [];
            foreach ($columns as $name => $sort) {
                $expected[] = $db->quoteColumnName($name).(\SORT_DESC === $sort ? ' DESC' : '');
            }
            self::assertStringEndsWith('ORDER BY '.implode(', ', $expected), $sql);

            return $command;
        });
        $this->setDb($db);

        self::assertSame([], $this->service->getResolvedForms($arguments));
    }

    public static function validOrders(): iterable
    {
        foreach (['mysql', 'pgsql'] as $driver) {
            yield [$driver, [], 'forms.order', \SORT_ASC];

            yield [$driver, ['orderBy' => null], 'forms.order', \SORT_ASC];
            foreach (['id', 'uid', 'type', 'name', 'handle', 'order', 'metadata', 'spamBlockCount', 'createdByUserId', 'dateCreated', 'updatedByUserId', 'dateUpdated', 'dateArchived'] as $column) {
                yield [$driver, ['orderBy' => $column], 'forms.'.$column, \SORT_ASC];

                yield [$driver, ['orderBy' => 'forms.'.$column, 'sort' => 'DESC'], 'forms.'.$column, \SORT_DESC];
            }
            foreach (['id', 'uid', 'handle', 'name', 'sortOrder'] as $column) {
                yield [$driver, ['orderBy' => 'sites.'.$column, 'sort' => 'desc'], 'sites.'.$column, \SORT_DESC];
            }

            yield [$driver, ['orderBy' => 'id', 'sort' => 'desc; SELECT 1'], 'forms.id', \SORT_ASC];
        }
    }

    private function setDb(Connection $db): void
    {
        \Craft::$app = \Yii::$app = new class($db) {
            public function __construct(private Connection $db) {}

            public function getDb(): Connection
            {
                return $this->db;
            }
        };
    }
}

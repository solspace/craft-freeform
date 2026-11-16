<?php

namespace Solspace\Freeform\Tests\Library\Compatibility;

use CraftCms\Cms\Element\Queries\ElementQuery;
use CraftCms\Cms\Element\Queries\Exceptions\QueryAbortedException;
use Illuminate\Database\Connection;
use Illuminate\Database\Query\Grammars\SQLiteGrammar;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Elements\Db\SubmissionQuery;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Tests\Helpers\UsesCraft6Container;

#[CoversClass(SubmissionQuery::class)]
class Craft6SubmissionQueryLifecycleTest extends TestCase
{
    use UsesCraft6Container;

    public function testNativePreparationRunsOnceAndClonesUseTheirOwnFormCriteria(): void
    {
        $query = $this->query();
        $query->formId(1);
        $query->applyBeforeQueryCallbacks();
        $query->applyBeforeQueryCallbacks();
        self::assertSame([11], $query->getQuery()->pluck('id')->all());
        self::assertSame(1, $query->preparations);

        $other = clone $query;
        $other->formId(2);
        $other->applyBeforeQueryCallbacks();
        self::assertSame([22, 23], $other->getQuery()->pluck('id')->all());
        self::assertSame([11], $query->getQuery()->pluck('id')->all());
    }

    public function testRejectedPreparationAbortsBeforeAnyResultsCanBeRead(): void
    {
        $query = $this->query();
        $query->formId(-1);
        $this->expectException(QueryAbortedException::class);
        $query->applyBeforeQueryCallbacks();
    }

    private function query(): SubmissionQuery
    {
        $connection = new Connection(new \PDO('sqlite::memory:'));
        $connection->setQueryGrammar(new SQLiteGrammar($connection));
        $connection->statement('CREATE TABLE freeform_submissions (id INTEGER PRIMARY KEY, formId INTEGER)');
        $connection->table('freeform_submissions')->insert([
            ['id' => 11, 'formId' => 1], ['id' => 22, 'formId' => 2], ['id' => 23, 'formId' => 2],
        ]);

        return new class($connection) extends SubmissionQuery {
            public int $preparations = 0;

            public function __construct(Connection $connection)
            {
                $this->elementType = Submission::class;
                (new \ReflectionProperty(ElementQuery::class, 'columnMap'))->setValue($this, ['id' => 'freeform_submissions.id']);
                $this->query = $connection->table('freeform_submissions')->select('id')->orderBy('id');
                (new \ReflectionProperty(ElementQuery::class, 'hasElementSourceTable'))->setValue($this, true);
            }

            protected function prepareSubmissionQuery(): bool
            {
                ++$this->preparations;
                if ($this->formId < 0) {
                    return false;
                }
                $this->query->where('formId', $this->formId);

                return true;
            }
        };
    }
}

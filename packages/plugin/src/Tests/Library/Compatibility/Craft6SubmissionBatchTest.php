<?php

namespace Solspace\Freeform\Tests\Library\Compatibility;

use CraftCms\Cms\Element\ElementCollection;
use Illuminate\Database\Connection;
use Illuminate\Database\Query\Builder;
use Illuminate\Database\Query\Grammars\SQLiteGrammar;
use Illuminate\Support\Collection;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Elements\Db\SubmissionQuery;

#[CoversClass(SubmissionQuery::class)]
class Craft6SubmissionBatchTest extends TestCase
{
    public function testBatchesHydratedResultsWithoutChangingOriginalQuery(): void
    {
        $query = $this->query([1, 2, 3, 4, 5]);

        self::assertSame([[1, 2], [3, 4], [5]], iterator_to_array($query->batch(2)));
        self::assertNull($query->getQuery()->orders);
        self::assertNull($query->getLimit());
        self::assertNull($query->getOffset());
    }

    public function testPreservesConfiguredLimitOffsetAndOrder(): void
    {
        $query = $this->query([5, 4, 3, 2, 1]);
        $query->orderBy('elements.id', 'desc')->offset(1)->limit(3);

        self::assertSame([[4, 3], [2]], iterator_to_array($query->batch(2)));
        self::assertSame([['column' => 'elements.id', 'direction' => 'desc']], $query->getQuery()->orders);
        self::assertSame(3, $query->getLimit());
        self::assertSame(1, $query->getOffset());
    }

    private function query(array $elements): SubmissionQuery
    {
        return new class($elements) extends SubmissionQuery {
            public function __construct(private array $elements)
            {
                $connection = new Connection(null);
                $this->query = new Builder($connection, new SQLiteGrammar($connection));
            }

            public function get($columns = ['*']): Collection|ElementCollection
            {
                return new Collection(\array_slice($this->elements, $this->query->offset ?? 0, $this->query->limit));
            }
        };
    }
}

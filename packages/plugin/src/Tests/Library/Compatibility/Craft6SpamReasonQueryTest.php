<?php

namespace Solspace\Freeform\Tests\Library\Compatibility;

use Illuminate\Database\Connection;
use Illuminate\Database\Query\Builder;
use Illuminate\Database\Query\Grammars\SQLiteGrammar;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Elements\Db\SubmissionQuery;

#[CoversClass(SubmissionQuery::class)]
class Craft6SpamReasonQueryTest extends TestCase
{
    public function testFiltersReasonsWithoutDuplicatingSubmissionsOrMatchingOtherSubmissionsReasons(): void
    {
        $query = $this->query();
        $query->spamReason('honeypot');
        (new \ReflectionMethod(SubmissionQuery::class, 'applySpamReasonFilter'))->invoke($query);

        self::assertSame([1], $query->getQuery()->pluck('id')->all());
    }

    public function testAnEmptyReasonLeavesTheIndexUnfiltered(): void
    {
        $query = $this->query();
        $query->spamReason('');
        (new \ReflectionMethod(SubmissionQuery::class, 'applySpamReasonFilter'))->invoke($query);

        self::assertSame([1, 2, 3], $query->getQuery()->pluck('id')->all());
    }

    private function query(): SubmissionQuery
    {
        $connection = new Connection(new \PDO('sqlite::memory:'));
        $connection->setQueryGrammar(new SQLiteGrammar($connection));
        $connection->statement('CREATE TABLE freeform_submissions (id INTEGER PRIMARY KEY)');
        $connection->statement('CREATE TABLE freeform_spam_reason (submissionId INTEGER, reasonType TEXT)');
        $connection->table('freeform_submissions')->insert([['id' => 1], ['id' => 2], ['id' => 3]]);
        $connection->table('freeform_spam_reason')->insert([
            ['submissionId' => 1, 'reasonType' => 'honeypot'],
            ['submissionId' => 1, 'reasonType' => 'honeypot'],
            ['submissionId' => 2, 'reasonType' => 'captcha'],
        ]);

        return new class($connection) extends SubmissionQuery {
            public function __construct(Connection $connection)
            {
                $this->query = (new Builder($connection, new SQLiteGrammar($connection)))->from('freeform_submissions')->orderBy('id');
            }
        };
    }
}

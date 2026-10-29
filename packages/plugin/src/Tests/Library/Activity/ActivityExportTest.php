<?php

namespace Solspace\Freeform\Tests\Library\Activity;

use craft\db\Query;
use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Activity\ActivityExport;
use Solspace\Freeform\Library\Activity\ActivityInput;
use Solspace\Freeform\Library\Activity\ActivityQuery;
use yii\db\Connection;

#[CoversNothing]
class ActivityExportTest extends TestCase
{
    public function testBothFormatsOnlyExportAllowedOperationalFacts(): void
    {
        $row = $this->row() + ['message' => 'SECRET', 'formName' => '=DANGEROUS()'];
        $row['metadata'] = json_encode(['httpStatus' => 401, 'message' => 'SECRET', 'recipient' => 'SECRET', 'reasonCode' => 999]);
        foreach (['csv', 'json'] as $format) {
            $stream = fopen('php://temp', 'w+');
            self::assertSame(1, ActivityExport::write($stream, [$row], $format));
            rewind($stream);
            $text = stream_get_contents($stream);
            self::assertStringNotContainsString('SECRET', $text);
            self::assertStringNotContainsString('DANGEROUS', $text);
            self::assertStringContainsString('2026-10-28T12:00:00+00:00', $text);
            if ('json' === $format) {
                $data = json_decode($text, true, 512, \JSON_THROW_ON_ERROR);
                self::assertSame(['httpStatus' => 401], $data[0]['metadata']);
                self::assertSame('integration-error', $data[0]['eventType']);
            } else {
                rewind($stream);
                $headers = fgetcsv($stream, 0, ',', '"', '');
                $record = array_combine($headers, fgetcsv($stream, 0, ',', '"', ''));
                self::assertSame(['httpStatus' => 401], json_decode($record['metadata'], true));
            }
            fclose($stream);
        }
    }

    public function testExportIsBoundedEvenWhenTheInputHasMoreRows(): void
    {
        $rows = function () {
            for ($id = 1; $id <= ActivityExport::LIMIT + 1; ++$id) {
                yield array_replace($this->row(), ['id' => $id]);
            }
        };
        $stream = fopen('php://temp', 'w+');
        self::assertSame(ActivityExport::LIMIT, ActivityExport::write($stream, $rows(), 'json'));
        rewind($stream);
        self::assertCount(ActivityExport::LIMIT, json_decode(stream_get_contents($stream), true, 512, \JSON_THROW_ON_ERROR));
        fclose($stream);
    }

    public function testUnknownEventsAndEmptyResultsCannotLeakArbitraryStrings(): void
    {
        $stream = fopen('php://temp', 'w+');
        self::assertSame(0, ActivityExport::write($stream, [array_replace($this->row(), ['event' => '=SECRET()'])], 'json'));
        rewind($stream);
        self::assertSame([], json_decode(stream_get_contents($stream), true, 512, \JSON_THROW_ON_ERROR));
        fclose($stream);
        $this->expectException(\InvalidArgumentException::class);
        ActivityExport::write(null, [], '../invalid');
    }

    public function testBatchedReadsRespectFiltersExpiryAndTheStartingSnapshot(): void
    {
        $previousApp = \Craft::$app;
        $previousYiiApp = \Yii::$app;
        $db = new Connection(['dsn' => 'sqlite::memory:']);

        try {
            $db->createCommand('CREATE TABLE freeform_activity (id INTEGER PRIMARY KEY, event TEXT, category TEXT, level TEXT, formId INTEGER, submissionId INTEGER, metadata TEXT, dateCreated TEXT)')->execute();
            \Craft::$app = \Yii::$app = new class($db) {
                public function __construct(private Connection $db) {}

                public function getDb(): Connection
                {
                    return $this->db;
                }
            };
            for ($id = 1; $id <= 505; ++$id) {
                $row = $this->row();
                $db->createCommand()->insert('freeform_activity', array_replace($row, ['id' => $id, 'category' => 'integrations', 'level' => 'error']))->execute();
            }
            $db->createCommand()->update('freeform_activity', ['dateCreated' => '2026-09-01 00:00:00'], ['id' => 1])->execute();
            $db->createCommand()->update('freeform_activity', ['formId' => 99], ['id' => 2])->execute();
            $query = ActivityQuery::filtered(ActivityInput::filters(['formId' => 12, 'level' => 'error']), '2026-10-01 00:00:00');
            $rows = ActivityExport::rows($query);
            $rows->rewind();
            self::assertSame(505, (int) $rows->current()['id']);
            $db->createCommand()->insert('freeform_activity', array_replace($this->row(), ['id' => 506, 'category' => 'integrations', 'level' => 'error']))->execute();
            $ids = [];
            foreach ($rows as $row) {
                $ids[] = (int) $row['id'];
            }
            self::assertSame(range(505, 3), $ids);
            self::assertSame(506, (int) (new Query())->from('freeform_activity')->max('id'));
        } finally {
            $db->close();
            \Craft::$app = $previousApp;
            \Yii::$app = $previousYiiApp;
        }
    }

    private function row(): array
    {
        return ['id' => 42, 'event' => 'integration-error', 'formId' => 12, 'submissionId' => 1042, 'metadata' => '{}', 'dateCreated' => '2026-10-28 12:00:00'];
    }
}

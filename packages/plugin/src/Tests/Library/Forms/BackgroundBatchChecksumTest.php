<?php

namespace Solspace\Freeform\Tests\Library\Forms;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Services\FormMergeService;

#[CoversClass(FormMergeService::class)]
class BackgroundBatchChecksumTest extends TestCase
{
    public function testAChangedSkippedValueInvalidatesTheReviewedBatch(): void
    {
        $reviewed = [
            ['id' => 17, 'contentId' => 17, 'isSpam' => false, 'value_30' => null, 'value_31' => 'Mapped name'],
            ['id' => 18, 'contentId' => 18, 'isSpam' => false, 'value_30' => null, 'value_31' => 'Another name'],
        ];

        $edited = $reviewed;
        $edited[0]['value_30'] = 'New data in an omitted field';
        self::assertNotSame($this->checksum($reviewed), $this->checksum($edited));
        self::assertNotSame($this->checksum($reviewed), $this->checksum(\array_slice($reviewed, 1)));
    }

    public function testDatabaseScalarRepresentationDoesNotInvalidateAReviewedBatch(): void
    {
        self::assertSame(
            $this->checksum([['id' => 17, 'contentId' => 17, 'isSpam' => false, 'value_30' => '0']]),
            $this->checksum([['id' => '17', 'contentId' => '17', 'isSpam' => 0, 'value_30' => '0']]),
        );
    }

    private function checksum(array $rows): string
    {
        return (new \ReflectionMethod(FormMergeService::class, 'batchChecksum'))->invoke(new FormMergeService(), $rows);
    }
}

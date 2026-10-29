<?php

namespace Solspace\Freeform\Tests\Library\Activity;

use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Activity\ActivityPolicy;
use Solspace\Freeform\Library\Activity\FormChangeSummary;

#[CoversNothing]
class FormChangeSummaryTest extends TestCase
{
    public function testOnlyCountsAreRetainedFromAddedRemovedAndChangedPrivateConfigurations(): void
    {
        $before = $this->emptySnapshot();
        $after = $before;
        $before['fields'] = FormChangeSummary::fingerprints([
            ['uid' => 'same', 'metadata' => '{"defaultValue":"old-private@example.test"}'],
            ['uid' => 'removed', 'metadata' => '{"secret":"private-key"}'],
        ]);
        $after['fields'] = FormChangeSummary::fingerprints([
            ['uid' => 'same', 'metadata' => '{"defaultValue":"new-private@example.test"}'],
            ['uid' => 'added', 'metadata' => '{"secret":"another-private-key"}'],
        ]);
        $after['formSettings'] = FormChangeSummary::fingerprints([['uid' => 'form', 'metadata' => '{"description":"Private notes"}']]);
        $summary = FormChangeSummary::compare($before, $after);
        self::assertSame(['formSettingsChanged' => 1, 'fieldsAdded' => 1, 'fieldsRemoved' => 1, 'fieldsUpdated' => 1], $summary);
        self::assertEquals($summary, ActivityPolicy::metadata($summary));
        self::assertStringNotContainsString('private', json_encode($summary));
        self::assertStringNotContainsString('same', json_encode($summary));
        self::assertStringNotContainsString('metadata', json_encode($summary));
    }

    public function testVolatileTimestampsUserIdsAndJsonKeyOrderDoNotProduceFalseChanges(): void
    {
        $first = [['uid' => 'field', 'metadata' => '{"required":false,"defaultValue":""}', 'dateUpdated' => '2026-01-01', 'updatedByUserId' => 1]];
        $second = [['uid' => 'field', 'metadata' => '{"defaultValue":"","required":false}', 'dateUpdated' => '2026-02-01', 'updatedByUserId' => 2]];
        self::assertSame(FormChangeSummary::fingerprints($first), FormChangeSummary::fingerprints($second));
        $before = $after = $this->emptySnapshot();
        $before['fields'] = FormChangeSummary::fingerprints($first);
        $after['fields'] = FormChangeSummary::fingerprints($second);
        self::assertSame([], FormChangeSummary::compare($before, $after));
    }

    public function testClearingAValueAndDisablingAnOptionAreRealChanges(): void
    {
        $before = $after = $this->emptySnapshot();
        $before['notifications'] = FormChangeSummary::fingerprints([['uid' => 'notification', 'enabled' => 1, 'metadata' => '{"recipient":"private@example.test"}']]);
        $after['notifications'] = FormChangeSummary::fingerprints([['uid' => 'notification', 'enabled' => 0, 'metadata' => '{"recipient":""}']]);
        self::assertSame(['notificationsUpdated' => 1], FormChangeSummary::compare($before, $after));
    }

    public function testIncompleteOrOversizedAreasDoNotInventRemovalCounts(): void
    {
        self::assertNull(FormChangeSummary::fingerprints(array_fill(0, 501, ['uid' => 'field'])));
        self::assertNull(FormChangeSummary::fingerprints([['uid' => 'field', 'metadata' => str_repeat('x', 4097)]]));
        $before = $after = $this->emptySnapshot();
        $before['fields'] = null;
        $after['fields'] = ['field' => 'hash'];
        self::assertSame(['summaryIncomplete' => 1], FormChangeSummary::compare($before, $after));
    }

    private function emptySnapshot(): array
    {
        return array_fill_keys(['formSettings', 'fields', 'pages', 'notifications', 'integrations'], []);
    }
}

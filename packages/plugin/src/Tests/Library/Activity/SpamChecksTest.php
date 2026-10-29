<?php

namespace Solspace\Freeform\Tests\Library\Activity;

use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Activity\ActivityPolicy;
use Solspace\Freeform\Library\Activity\ActivityPresentation;
use Solspace\Freeform\Library\Activity\SpamChecks;

#[CoversNothing]
class SpamChecksTest extends TestCase
{
    public function testOnlyCheckIdentitiesAreRecordedWithoutReadingMessagesOrValues(): void
    {
        $private = new class implements \JsonSerializable {
            public function jsonSerialize(): mixed
            {
                throw new \RuntimeException('Never serialize private spam data');
            }
        };
        $metadata = SpamChecks::metadata([
            ['type' => 'honeypot', 'message' => $private, 'value' => $private],
            ['type' => 'minimum_submit_time', 'message' => 'SECRET', 'value' => '192.0.2.1'],
            ['type' => 'honeypot', 'message' => 'another SECRET'],
        ]);
        self::assertSame(['spamChecks' => 258], $metadata);
        self::assertSame(['Honeypot', 'Minimum submission time'], SpamChecks::labels($metadata['spamChecks']));
        self::assertStringNotContainsString('SECRET', json_encode($metadata));
    }

    public function testUnknownChecksHaveAGenericLabelAndMalformedTypesAreIgnored(): void
    {
        self::assertSame(['spamChecks' => 1], SpamChecks::metadata([['type' => 'SECRET custom provider']]));
        self::assertSame([], SpamChecks::metadata([['type' => ['SECRET']], new \stdClass()]));
        self::assertSame(['Other spam check'], SpamChecks::labels(1));
    }

    public function testUntrustedMasksAndStringsAreRejected(): void
    {
        self::assertSame([], ActivityPolicy::metadata(['spamChecks' => '258']));
        self::assertSame([], ActivityPolicy::metadata(['spamChecks' => 2048]));
        self::assertSame(['spamChecks' => 1024], ActivityPolicy::metadata(['spamChecks' => 1024, 'reason' => 'SECRET']));
    }

    public function testSpamPresentationUsesLabelsFromTheSafeCatalog(): void
    {
        $row = ActivityPresentation::present(['event' => 'spam', 'formId' => 12, 'submissionId' => 42, 'dateCreated' => '2026-10-28 12:00:00', 'metadata' => ['spamChecks' => 2 | 8 | 1024]]);
        self::assertSame('Honeypot, CAPTCHA, AI spam detection', $row['context']['Flagged by']);
        $row['metadata'] = [];
        self::assertArrayNotHasKey('Flagged by', ActivityPresentation::present($row)['context']);
    }
}

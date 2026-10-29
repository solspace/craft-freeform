<?php

namespace Solspace\Freeform\Tests\Library\Activity;

use GuzzleHttp\Exception\ConnectException;
use GuzzleHttp\Exception\RequestException;
use GuzzleHttp\Psr7\Request;
use GuzzleHttp\Psr7\Response;
use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Activity\ActivityContext;
use Solspace\Freeform\Library\Activity\ActivityExamples;
use Solspace\Freeform\Library\Activity\ActivityPolicy;
use Solspace\Freeform\Library\Activity\ActivityPresentation;

#[CoversNothing]
class ActivityPresentationTest extends TestCase
{
    #[TestWith([401, ActivityContext::INTEGRATION_AUTH])]
    #[TestWith([403, ActivityContext::INTEGRATION_AUTH])]
    #[TestWith([429, ActivityContext::INTEGRATION_RATE_LIMIT])]
    #[TestWith([503, ActivityContext::INTEGRATION_REMOTE_ERROR])]
    #[TestWith([422, ActivityContext::INTEGRATION_REQUEST_REJECTED])]
    public function testFailureClassificationUsesStatusWithoutCopyingPayloads(int $status, int $reason): void
    {
        $exception = new RequestException('SECRET message', new Request('POST', 'https://private.example/SECRET'), new Response($status, [], 'SECRET body'));
        self::assertSame(['httpStatus' => $status, 'reasonCode' => $reason], ActivityContext::integrationFailure($exception));
    }

    public function testConnectionClassificationDoesNotInspectExceptionText(): void
    {
        $exception = new ConnectException('SECRET', new Request('POST', 'https://private.example/SECRET'));
        self::assertSame(['reasonCode' => ActivityContext::INTEGRATION_CONNECTION], ActivityContext::integrationFailure($exception));
        self::assertSame(['reasonCode' => ActivityContext::INTEGRATION_FAILED], ActivityContext::integrationFailure(new \RuntimeException('SECRET')));
        self::assertSame([], ActivityPolicy::metadata(['reasonCode' => 999, 'durationMs' => 'SECRET', 'elapsedMs' => new \stdClass()]));
        self::assertSame(['reasonCode' => ActivityContext::MAIL_RENDER_FAILED, 'durationMs' => 100], ActivityPolicy::metadata(['reasonCode' => ActivityContext::MAIL_RENDER_FAILED, 'durationMs' => 100]));
    }

    public function testExamplesUseTheSamePresentationContractAsRealRecords(): void
    {
        $examples = ActivityExamples::all();
        self::assertSame(array_keys(ActivityPolicy::EVENTS), array_keys($examples));
        foreach ($examples as $example) {
            $record = ActivityPresentation::present($example, [12 => 'Contact'], [4 => 'HubSpot'], [7 => 'Admin alert']);
            self::assertSame($example, $record);
        }
        self::assertSame('HubSpot · Integration authorization rejected', $examples['integration-error']['title']);
        self::assertSame(401, $examples['integration-error']['context']['HTTP status']);
        self::assertSame('Yes', $examples['form-change']['changes']['Form settings changed']);
        self::assertNull($examples['warning']['submissionId']);
    }

    public function testOldAndDeletedRecordsRemainUsefulWithoutLabelsOrPrivateText(): void
    {
        $record = ActivityPresentation::present([
            'event' => 'integration-error', 'formId' => 12, 'submissionId' => 1042,
            'dateCreated' => '2026-10-28 12:00:00',
            'metadata' => json_encode(['httpStatus' => 401, 'integrationId' => 4, 'notificationId' => 7, 'message' => 'SECRET', 'recipient' => 'SECRET']),
        ]);
        self::assertSame('Integration authorization rejected', $record['title']);
        self::assertSame('Integration #4', $record['context']['Integration']);
        self::assertSame('Notification #7', $record['context']['Notification']);
        self::assertStringNotContainsString('SECRET', json_encode($record));
        self::assertSame('2026-10-28T12:00:00+00:00', $record['recordedAt']);
        $record['event'] = 'warning';
        $record['metadata'] = '{}';
        self::assertSame('Operational warning', ActivityPresentation::present($record)['title']);
    }
}

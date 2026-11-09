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
use Solspace\Freeform\Library\Activity\ActivityDiagnostics;
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

    #[TestWith(['spam'])]
    #[TestWith(['validation'])]
    public function testLegacySubmissionWarningsPresentAsNoticesWithoutResolutionActions(string $event): void
    {
        $record = ActivityPresentation::present(['event' => $event, 'level' => 'warning', 'dateCreated' => '2026-11-06 08:00:00']);
        self::assertSame('notice', $record['level']);
        self::assertFalse($record['actionable']);
        self::assertFalse($record['isResolved']);
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

    public function testExamplesDistinguishWarningsFromEmailFailuresAndLinkIntegrationSteps(): void
    {
        $examples = ActivityExamples::all();
        self::assertSame('Operational warning', $examples['warning']['title']);
        self::assertArrayNotHasKey('reasonCode', $examples['warning']['metadata']);
        self::assertStringContainsString('Integration connection check', $examples['warning']['metadata']['diagnostics']['message']);

        $failure = $examples['email-error'];
        self::assertSame('Mail transport authorization failed', $failure['title']);
        self::assertSame('Digest email', $failure['context']['Email type']);
        self::assertNull($failure['formId']);
        self::assertNull($failure['submissionId']);
        self::assertArrayNotHasKey('notificationId', $failure['metadata']);

        foreach (['error', 'response', 'started', 'finished', 'skipped', 'action'] as $step) {
            self::assertSame(123456, $examples['integration-'.$step]['context']['Processing ID']);
        }
    }

    public function testScheduledEmailDescriptionsDoNotAssumeAFormNotification(): void
    {
        foreach (['email-error', 'email-sent'] as $event) {
            $record = ActivityPresentation::present([
                'event' => $event, 'metadata' => ['emailType' => 3], 'dateCreated' => '2026-11-03 12:00:00',
            ]);
            self::assertSame('Export notification', $record['context']['Email type']);
            self::assertStringContainsString('Email', $record['title']);
            self::assertStringNotContainsString('notification', $record['description']);
        }
    }

    public function testDiagnosticExamplesUseProductionMaskingAndOnlyAppearForRelevantEvents(): void
    {
        $examples = ActivityExamples::all();
        $withDetails = array_keys(array_filter($examples, static fn ($example) => isset($example['metadata']['diagnostics'])));
        self::assertSame(['error', 'warning', 'email-error', 'integration-error'], $withDetails);
        $email = $examples['email-error']['metadata']['diagnostics'];
        self::assertStringContainsString('d***@example.com', $email['message']);
        self::assertStringNotContainsString('demo@example.com', json_encode($examples));
        foreach ($withDetails as $key) {
            $details = $examples[$key]['metadata']['diagnostics'];
            self::assertSame($details, ActivityDiagnostics::clean($details));
            foreach ($details['trace'] ?? [] as $frame) {
                self::assertArrayNotHasKey('args', $frame);
                self::assertStringNotContainsString('/', $frame['file']);
            }
        }
    }

    public function testExamplesShowPartialApiKeyMaskingAndFullyHiddenMailCredentials(): void
    {
        $examples = ActivityExamples::all();
        $key = $examples['warning']['metadata']['diagnostics']['context']['apiKey'];
        self::assertStringContainsString('demo_test_****c3d4', $key);
        self::assertSame('Example CRM', $examples['warning']['metadata']['diagnostics']['context']['service']);
        $mail = $examples['email-error']['metadata']['diagnostics']['message'];
        self::assertStringContainsString('smtp://*********@mail.example.com:587', $mail);
        foreach (['demo-user', 'demo-password', 'demo_test_7f8a9b0c1d2e3f4a5b6c7d8ea1b2c3d4'] as $secret) {
            self::assertStringNotContainsString($secret, json_encode($examples));
        }
    }
}

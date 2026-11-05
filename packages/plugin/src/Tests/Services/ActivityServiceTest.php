<?php

namespace Solspace\Freeform\Tests\Services;

use craft\db\Command;
use craft\db\Connection;
use GuzzleHttp\Exception\RequestException;
use GuzzleHttp\Psr7\Request;
use GuzzleHttp\Psr7\Response;
use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Activity\ActivityContext;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Services\ActivityService;
use Solspace\Freeform\Services\SettingsService;
use yii\db\mysql\Schema;
use yii\db\Transaction;

#[CoversNothing]
class ActivityServiceTest extends TestCase
{
    public function testDisabledCategoriesAreNeverWritten(): void
    {
        $service = $this->service($this->settings(['activityMode' => 'custom', 'activityEvents' => ['submission' => true, 'email-error' => false]]));
        $service->expects(self::once())->method('write')->with(self::callback(static function ($rows) {
            self::assertCount(1, $rows);
            $row = $rows[0];
            self::assertSame('submission', $row['event']);
            self::assertSame(7, $row['formId']);
            self::assertSame(42, $row['submissionId']);
            self::assertSame('[]', $row['metadata']);

            return true;
        }));
        $service->record('email-error', 7, 42);
        $service->record('submission', 7, 42, ['email' => 'private@example.test', 'password' => 'secret']);
        $service->record('unsupported', 7, 42);
        $service->flush();
    }

    public function testPauseStopsEveryCategory(): void
    {
        $service = $this->service($this->settings(['activityMode' => 'detailed', 'activityEnabled' => '0']));
        $service->expects(self::never())->method('write');
        $service->record('error');
        $service->record('submission');
        $service->flush();
    }

    public function testNoneStopsActivityEvenWithBothCompatibilityGuardsEnabled(): void
    {
        $service = $this->service($this->settings(['loggingStyle' => 'none', 'activityMode' => 'detailed', 'activityEnabled' => '1', 'technicalFileLogging' => '1']));
        $service->expects(self::never())->method('write');
        $service->record('error');
        $service->record('submission');
        $service->flush();
        self::assertFalse($service->isEnabled('error'));
    }

    public function testDiagnosticsAreSanitizedAtStorageAndExcludedFromSuccessfulEvents(): void
    {
        $service = $this->service($this->settings(['activityMode' => 'standard']));
        $service->expects(self::once())->method('write')->with(self::callback(static function ($rows) {
            $error = json_decode($rows[0]['metadata'], true);
            self::assertStringContainsString('j***@example.com', $error['diagnostics']['message']);
            self::assertStringNotContainsString('private-password', $rows[0]['metadata']);
            self::assertArrayNotHasKey('diagnostics', json_decode($rows[1]['metadata'], true));

            return true;
        }));
        $data = ['diagnostics' => ['message' => 'Rejected jane@example.com password=private-password', 'context' => ['payload' => ['answer' => 'private-answer']]]];
        $service->record('error', metadata: $data);
        $service->record('submission', metadata: $data);
        $service->flush();
    }

    public function testClassicStyleStopsActivityWithoutChangingSavedPreferences(): void
    {
        $settings = $this->settings(['loggingStyle' => 'classic', 'activityEnabled' => '1', 'activityMode' => 'detailed']);
        $service = $this->service($settings);
        $service->expects(self::once())->method('write')->with(self::callback(static fn ($rows) => 1 === \count($rows) && 'submission' === $rows[0]['event']));
        self::assertFalse($service->isEnabled('submission'));
        $service->record('submission', 7, 42);
        $service->record('error');
        $service->flush();
        $settings->loggingStyle = 'activity';
        self::assertTrue($service->isEnabled('submission'));
        $service->record('submission', 7, 42);
        $service->flush();
        self::assertSame('detailed', $settings->activityMode);
        self::assertSame('1', $settings->activityEnabled);
    }

    public function testTypedSkipDiagnosticsAreScopedDeduplicatedAndCorrelated(): void
    {
        $service = $this->service($this->settings(['activityMode' => 'detailed']));
        $form = $this->createStub(Form::class);
        $form->method('getId')->willReturn(7);
        $service->expects(self::once())->method('write')->with(self::callback(static function ($rows) {
            self::assertSame(['integration-started', 'integration-skipped', 'integration-action', 'integration-finished'], array_column($rows, 'event'));
            self::assertSame(ActivityContext::INTEGRATION_CREATED, json_decode($rows[2]['metadata'], true)['reasonCode']);
            $metadata = array_map(static fn ($row) => json_decode($row['metadata'], true), $rows);
            self::assertSame(ActivityContext::INTEGRATION_NO_OPT_IN, $metadata[1]['reasonCode']);
            self::assertSame(9, $metadata[1]['integrationId']);
            self::assertSame(2, $metadata[1]['attempt']);
            self::assertSame(7, $rows[1]['formId']);
            self::assertCount(1, array_unique(array_column($metadata, 'operationId')));

            return true;
        }));
        $service->recordIntegrationDiagnostic(ActivityContext::INTEGRATION_NO_MAPPING);
        $service->observeIntegration($form, static function () use ($service) {
            $service->recordIntegrationDiagnostic(ActivityContext::INTEGRATION_NO_OPT_IN);
            $service->recordIntegrationDiagnostic(ActivityContext::INTEGRATION_NO_OPT_IN);
            $service->recordIntegrationDiagnostic(ActivityContext::INTEGRATION_CREATED);
            $service->recordIntegrationDiagnostic(ActivityContext::INTEGRATION_CREATED);
            $service->recordIntegrationDiagnostic(9999);
        }, 9, 2);
        $service->recordIntegrationDiagnostic(ActivityContext::INTEGRATION_NO_EMAIL);
        $service->flush();
    }

    public function testScheduledEmailRecordsRejectionAndPreservesTheTransportResult(): void
    {
        $service = $this->service($this->settings(['activityMode' => 'detailed']));
        $service->expects(self::once())->method('write')->with(self::callback(static function ($rows) {
            self::assertSame(['email-sent', 'email-error', 'email-error'], array_column($rows, 'event'));
            self::assertSame(2, json_decode($rows[0]['metadata'], true)['emailType']);
            self::assertSame(ActivityContext::MAIL_REJECTED, json_decode($rows[1]['metadata'], true)['reasonCode']);
            self::assertStringNotContainsString('SECRET', json_encode($rows));

            return true;
        }));
        self::assertTrue($service->observeEmail(static fn () => true, 2));
        self::assertFalse($service->observeEmail(static fn () => false, 3));
        $exception = new \RuntimeException('Transport failed: password=SECRET');

        try {
            $service->observeEmail(static fn () => throw $exception, 3);
            self::fail('Transport exception was swallowed.');
        } catch (\RuntimeException $actual) {
            self::assertSame($exception, $actual);
        }
        $service->flush();
    }

    public function testStorageFailureCannotBreakSubmissionAndDoesNotKeepRetrying(): void
    {
        $service = $this->service($this->settings());
        $service->expects(self::once())->method('write')->willThrowException(new \RuntimeException('Storage unavailable'));
        $service->record('submission');
        $service->flush();
        $service->record('email-sent');
        $service->record('error');
        $service->flush();
        self::assertTrue(true, 'Logging failures are swallowed, without recursively logging the failure.');
    }

    public function testRequestWorkIsBoundedAndQueueResetAllowsTheNextJob(): void
    {
        $service = $this->service($this->settings());
        $sizes = [];
        $service->expects(self::exactly(2))->method('write')->willReturnCallback(static function ($rows) use (&$sizes) { $sizes[] = \count($rows); });
        for ($i = 0; $i < 150; ++$i) {
            $service->record('submission');
        }
        $service->reset();
        $service->record('submission');
        $service->flush();
        self::assertSame([100, 1], $sizes);
    }

    public function testIntegrationFailuresPropagateAndContextDoesNotLeakToTheNextOperation(): void
    {
        $service = $this->service($this->settings());
        $form = $this->createMock(Form::class);
        $form->method('getId')->willReturn(7);
        $form->method('getSubmission')->willReturn(null);
        $service->expects(self::once())->method('write')->with(self::callback(static function ($rows) {
            self::assertCount(1, $rows);
            self::assertSame('integration-error', $rows[0]['event']);
            $metadata = json_decode($rows[0]['metadata'], true);
            self::assertSame(ActivityContext::INTEGRATION_FAILED, $metadata['reasonCode']);
            self::assertSame(1, $metadata['attempt']);
            self::assertGreaterThanOrEqual(1, $metadata['durationMs']);
            self::assertSame('Original integration failure', $metadata['diagnostics']['message']);

            return true;
        }));

        try {
            $service->observeIntegration($form, static fn () => throw new \RuntimeException('Original integration failure'));
            self::fail('The original failure was swallowed.');
        } catch (\RuntimeException $exception) {
            self::assertSame('Original integration failure', $exception->getMessage());
        }
        $service->recordIntegrationResponse(200, 9);
        $service->flush();
    }

    public function testQueueResetRecoversAfterAStorageFailure(): void
    {
        $service = $this->service($this->settings());
        $attempts = 0;
        $service->expects(self::exactly(2))->method('write')->willReturnCallback(static function () use (&$attempts) {
            if (0 === $attempts++) {
                throw new \RuntimeException('Temporary storage failure');
            }
        });
        $service->record('error');
        $service->flush();
        $service->record('submission');
        $service->reset();
        $service->record('submission');
        $service->flush();
    }

    public function testScopedResponsesAreBatchedWithoutRecordingUnrelatedMetadataReads(): void
    {
        $service = $this->service($this->settings(['activityMode' => 'detailed']));
        $form = $this->createMock(Form::class);
        $form->method('getId')->willReturn(7);
        $form->method('getSubmission')->willReturn(null);
        $service->expects(self::once())->method('write')->with(self::callback(static function ($rows) {
            self::assertSame(['integration-started', 'integration-response', 'integration-finished'], array_column($rows, 'event'));
            self::assertSame(7, $rows[1]['formId']);
            $metadata = json_decode($rows[1]['metadata'], true);
            self::assertSame(200, $metadata['httpStatus']);
            self::assertSame(9, $metadata['integrationId']);
            self::assertSame(1, $metadata['attempt']);
            self::assertGreaterThanOrEqual(1, $metadata['elapsedMs']);

            return true;
        }));
        $service->recordIntegrationResponse(200, 9);
        $service->observeIntegration($form, static fn () => $service->recordIntegrationResponse(200, 9));
        $service->recordIntegrationResponse(200, 9);
        $service->flush();
        $service->flush();
    }

    public function testHttpFailureIsRecordedOnceAndRetryKeepsItsOwnAttempt(): void
    {
        $service = $this->service($this->settings(['activityMode' => 'detailed']));
        $form = $this->createMock(Form::class);
        $form->method('getId')->willReturn(7);
        $form->method('getSubmission')->willReturn(null);
        $exception = new RequestException('SECRET response body', new Request('POST', 'https://private.example/secret'), new Response(401, [], 'SECRET'));
        $service->expects(self::once())->method('write')->with(self::callback(static function ($rows) {
            self::assertSame(['integration-started', 'integration-error', 'integration-started', 'integration-response', 'integration-finished'], array_column($rows, 'event'));
            $first = json_decode($rows[1]['metadata'], true);
            $second = json_decode($rows[3]['metadata'], true);
            self::assertNotSame($first['operationId'], $second['operationId']);
            self::assertSame(ActivityContext::INTEGRATION_AUTH, $first['reasonCode']);
            self::assertSame(1, $first['attempt']);
            self::assertSame(2, $second['attempt']);
            self::assertStringNotContainsString('SECRET', json_encode($rows));

            return true;
        }));

        try {
            $service->observeIntegration($form, static function () use ($service, $exception) {
                $service->recordIntegrationResponse(401, 9);

                throw $exception;
            }, 9);
        } catch (RequestException $actual) {
            self::assertSame($exception, $actual);
        }
        self::assertTrue($service->hasRecordedIntegrationFailure($exception));
        $service->observeIntegration($form, static fn () => $service->recordIntegrationResponse(200, 9), 9, 2);
        $service->flush();
    }

    public function testFailedActivityInsertRollsBackOnlyItsSavepoint(): void
    {
        $schema = $this->createMock(Schema::class);
        $schema->method('supportsSavepoint')->willReturn(true);
        $schema->expects(self::once())->method('createSavepoint');
        $schema->expects(self::once())->method('rollBackSavepoint');
        $schema->expects(self::never())->method('releaseSavepoint');
        $outer = $this->createMock(Transaction::class);
        $outer->expects(self::never())->method('rollBack');
        $outer->expects(self::never())->method('commit');
        $command = $this->createMock(Command::class);
        $command->method('batchInsert')->willReturnSelf();
        $command->method('execute')->willThrowException(new \RuntimeException('Activity storage failure'));
        $db = $this->createMock(Connection::class);
        $db->method('getTransaction')->willReturn($outer);
        $db->method('getSchema')->willReturn($schema);
        $db->method('createCommand')->willReturn($command);
        $provider = $this->createStub(SettingsService::class);
        $provider->method('getSettingsModel')->willReturn($this->settings());
        $service = $this->getMockBuilder(ActivityService::class)->onlyMethods(['getSettingsService', 'database'])->getMock();
        $service->method('getSettingsService')->willReturn($provider);
        $service->method('database')->willReturn($db);
        $service->record('submission', 7, 42);
        $service->flush();
    }

    private function service(Settings $settings): ActivityService
    {
        $provider = $this->createMock(SettingsService::class);
        $provider->method('getSettingsModel')->willReturn($settings);
        $service = $this->getMockBuilder(ActivityService::class)->onlyMethods(['getSettingsService', 'write', 'inTransaction'])->getMock();
        $service->method('getSettingsService')->willReturn($provider);
        $service->method('inTransaction')->willReturn(false);

        return $service;
    }

    private function settings(array $values = []): Settings
    {
        $settings = (new \ReflectionClass(Settings::class))->newInstanceWithoutConstructor();
        foreach ($values as $property => $value) {
            $settings->{$property} = $value;
        }

        return $settings;
    }
}

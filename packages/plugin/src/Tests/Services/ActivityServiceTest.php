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
            self::assertStringNotContainsString('Original integration failure', $rows[0]['metadata']);

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
            self::assertCount(1, $rows);
            self::assertSame(7, $rows[0]['formId']);
            $metadata = json_decode($rows[0]['metadata'], true);
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
            self::assertCount(2, $rows);
            self::assertSame(['integration-error', 'integration-response'], array_column($rows, 'event'));
            $first = json_decode($rows[0]['metadata'], true);
            $second = json_decode($rows[1]['metadata'], true);
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

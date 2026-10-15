<?php

namespace Solspace\Freeform\Tests\Library\AI;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\AI\FormGenerationException;
use Solspace\Freeform\Library\AI\FormGenerationStore;
use yii\base\Security;

#[CoversClass(FormGenerationStore::class)]
class FormGenerationStoreTest extends TestCase
{
    private string $directory;
    private FormGenerationStore $store;
    private Security $security;
    private string $requestId;

    protected function setUp(): void
    {
        $this->directory = sys_get_temp_dir().'/ff-ai-'.bin2hex(random_bytes(8));
        $this->security = new Security();
        $this->store = new FormGenerationStore($this->directory, 'test-secret-key', $this->security);
        $this->requestId = str_repeat('a', 32);
    }

    protected function tearDown(): void
    {
        foreach (glob($this->directory.'/*') as $file) {
            unlink($file);
        }
        rmdir($this->directory);
    }

    public function testQueueInputsAreEncryptedOwnerBoundAndStartIsIdempotent(): void
    {
        $queued = [];
        $enqueue = static function ($id) use (&$queued) { $queued[] = $id; };
        $this->store->start(7, $this->requestId, ['prompt' => 'PRIVATE CONTENT', 'files' => ['PRIVATE FILE'], 'userId' => 999], $enqueue);
        $this->store->start(7, $this->requestId, ['prompt' => 'different'], $enqueue);
        self::assertCount(1, $queued);
        self::assertSame(['status' => 'queued'], $this->store->status(7, $this->requestId));
        foreach (glob($this->directory.'/*') as $file) {
            self::assertStringNotContainsString('PRIVATE', file_get_contents($file));
            if ('\\' !== \DIRECTORY_SEPARATOR) {
                self::assertSame(0600, fileperms($file) & 0777);
            }
        }
        $this->store->execute($queued[0], static function ($request) {
            self::assertSame(7, $request['userId']);
            self::assertSame('PRIVATE CONTENT', $request['prompt']);

            return 42;
        });
        self::assertSame(['status' => 'complete', 'formId' => 42], $this->store->status(7, $this->requestId));
        self::assertFileDoesNotExist($this->directory.'/'.$queued[0].'.request');
        $this->store->execute($queued[0], static function () { self::fail('A duplicate job must not generate again.'); });
    }

    public function testDifferentUserCannotReadRequestEvenWithItsClientIdentifier(): void
    {
        $this->start();
        $this->expectException(\OutOfBoundsException::class);
        $this->store->status(8, $this->requestId);
    }

    public function testInvalidIdentifiersCannotAccessFilesystemPaths(): void
    {
        $this->expectException(\OutOfBoundsException::class);
        $this->store->status(7, '../secret');
    }

    public function testFailedGenerationDiscardsInputsAndDoesNotExposeExceptionDetails(): void
    {
        $id = $this->start();
        $this->store->execute($id, static function () { throw new \RuntimeException('secret-key <html>private upstream data</html>'); });
        self::assertSame(['status' => 'failed', 'message' => ''], $this->store->status(7, $this->requestId));
        self::assertFileDoesNotExist($this->directory.'/'.$id.'.request');
        $this->store->execute($id, static function () { self::fail('A failed generation must not be retried automatically.'); });
    }

    public function testIntentionalSafeErrorIsReturned(): void
    {
        $id = $this->start();
        $this->store->execute($id, static function () { throw new FormGenerationException('Readable error'); });
        self::assertSame('Readable error', $this->store->status(7, $this->requestId)['message']);
    }

    public function testExpiredQueuedRequestIsNeverExecutedAndItsInputsAreDeleted(): void
    {
        $id = $this->start();
        $this->changeState($id, ['createdAt' => time() - FormGenerationStore::QUEUED_TTL - 1]);
        self::assertSame('expired', $this->store->status(7, $this->requestId)['status']);
        $this->store->execute($id, static function () { self::fail('Expired request must not call the provider.'); });
        self::assertFileDoesNotExist($this->directory.'/'.$id.'.request');
    }

    public function testInterruptedJobIsReportedAndNeverReexecuted(): void
    {
        $id = $this->start();
        $this->changeState($id, ['status' => 'running', 'startedAt' => time() - FormGenerationStore::RUNNING_TTL - 1]);
        self::assertSame('interrupted', $this->store->status(7, $this->requestId)['status']);
        $this->store->execute($id, static function () { self::fail('A killed worker must not create a duplicate form.'); });
    }

    public function testQueueFailureRemovesPrivateInputs(): void
    {
        try {
            $this->store->start(7, $this->requestId, ['prompt' => 'private'], static function () { throw new \RuntimeException('queue down'); });
            self::fail('Queue error expected.');
        } catch (\RuntimeException) {
            self::assertSame([], glob($this->directory.'/*.request'));
            self::assertSame([], glob($this->directory.'/*.status'));
        }
    }

    public function testAbandonedEncryptedFilesArePruned(): void
    {
        $this->start();
        foreach (glob($this->directory.'/*') as $file) {
            touch($file, time() - FormGenerationStore::TTL - 1);
        }
        $this->store->prune();
        self::assertSame([], glob($this->directory.'/*'));
    }

    private function start(): string
    {
        $id = '';
        $this->store->start(7, $this->requestId, ['prompt' => 'private'], static function ($queued) use (&$id) { $id = $queued; });

        return $id;
    }

    private function changeState(string $id, array $changes): void
    {
        $path = $this->directory.'/'.$id.'.status';
        $state = json_decode($this->security->decryptByKey(file_get_contents($path), 'test-secret-key'), true);
        $state = array_replace($state, $changes);
        file_put_contents($path, $this->security->encryptByKey(json_encode($state), 'test-secret-key'));
    }
}

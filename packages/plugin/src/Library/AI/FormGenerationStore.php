<?php

namespace Solspace\Freeform\Library\AI;

use yii\base\Security;

/** Private, encrypted, short-lived inputs. Queue payloads contain only an opaque identifier. */
final class FormGenerationStore
{
    public const TTL = 3600;
    public const QUEUED_TTL = 1800;
    public const RUNNING_TTL = 300;

    public function __construct(private string $directory, private string $key, private Security $security)
    {
        if ('' === $key || (!is_dir($directory) && !@mkdir($directory, 0700, true))) {
            throw new \RuntimeException('Could not initialize private AI generation storage.');
        }
        @chmod($directory, 0700);
    }

    public function start(int $userId, string $requestId, array $request, callable $enqueue): array
    {
        $id = $this->identifier($userId, $requestId);
        $this->prune();

        return $this->locked($id, 'start', function () use ($id, $userId, $request, $enqueue) {
            if (is_file($this->path($id, 'status'))) {
                return $this->read($id, 'status');
            }
            $state = ['userId' => $userId, 'status' => 'queued', 'createdAt' => time()];
            $request['userId'] = $userId;

            try {
                $this->write($id, 'request', $request);
                $this->write($id, 'status', $state);
                $enqueue($id);
            } catch (\Throwable $exception) {
                $this->removeRequest($id);
                @unlink($this->path($id, 'status'));

                throw $exception;
            }

            return $state;
        });
    }

    public function status(int $userId, string $requestId): array
    {
        $state = $this->read($this->identifier($userId, $requestId), 'status');
        if (($state['userId'] ?? null) !== $userId || time() - ($state['createdAt'] ?? 0) > self::TTL) {
            throw new \OutOfBoundsException('Generation not found.');
        }
        if ('queued' === $state['status'] && time() - $state['createdAt'] > self::QUEUED_TTL) {
            $state['status'] = 'expired';
        }
        if ('running' === $state['status'] && (!isset($state['responseId']) || !empty($state['importing'])) && time() - ($state['startedAt'] ?? 0) > self::RUNNING_TTL) {
            $state['status'] = 'interrupted';
        }

        // Never expose the encrypted request, owner, filesystem path or internal timestamps.
        return array_intersect_key($state, array_flip(['status', 'formId', 'message']));
    }

    /** Advance an owner-bound OpenAI request from a short, authenticated CP request. */
    public function advance(int $userId, string $requestId, callable $generate): void
    {
        $this->status($userId, $requestId);
        $this->execute($this->identifier($userId, $requestId), $generate, true);
    }

    public function execute(string $id, callable $generate, bool $backgroundOnly = false): void
    {
        $this->locked($id, 'run', function () use ($id, $generate, $backgroundOnly) {
            $state = $this->read($id, 'status');
            // A killed/released/retried job must never create a second form.
            $resuming = $backgroundOnly && 'running' === $state['status'] && isset($state['responseId']) && empty($state['importing']);
            if ('queued' !== $state['status'] && !$resuming) {
                return;
            }
            if (time() - $state['createdAt'] > ($resuming ? self::TTL : self::QUEUED_TTL)) {
                $state['status'] = 'expired';
                $this->write($id, 'status', $state);
                $this->removeRequest($id);

                return;
            }
            $request = $this->read($id, 'request');
            if ($backgroundOnly && empty($request['background'])) {
                return;
            }
            $state['status'] = 'running';
            $state['startedAt'] = time();
            $this->write($id, 'status', $state);

            try {
                $request['responseId'] = $state['responseId'] ?? null;
                $state['formId'] = $generate($request, function () use ($id, &$state) {
                    $state['importing'] = true;
                    $state['startedAt'] = time();
                    $this->write($id, 'status', $state);
                });
                $state['status'] = 'complete';
            } catch (PendingFormGeneration $pending) {
                if (null === $pending->responseId) {
                    // Submission may have reached OpenAI, but its ID was lost.
                    // Keep this uncertain instead of automatically resubmitting.
                    $state['status'] = 'interrupted';
                } else {
                    $state['responseId'] = $pending->responseId;
                }
            } catch (\Throwable $exception) {
                $state['status'] = 'failed';
                // Only deliberate validation/provider errors are suitable for display.
                // Callers wrap them before they reach this storage boundary.
                $state['message'] = $exception instanceof FormGenerationException ? $exception->getMessage() : '';
                if (!$exception instanceof FormGenerationException) {
                    // Messages and trace arguments can contain credentials, SQL,
                    // document contents or provider payloads. Log code locations only.
                    \Yii::error([
                        'message' => 'Unexpected AI form generation failure.',
                        'generationId' => $id,
                        'exception' => $exception::class,
                        'file' => $exception->getFile(),
                        'line' => $exception->getLine(),
                        'trace' => array_map(static fn (array $frame) => array_intersect_key($frame, array_flip(['file', 'line', 'class', 'type', 'function'])), $exception->getTrace()),
                    ], self::class.'::execute');
                }
            } finally {
                if ('running' !== $state['status']) {
                    $this->removeRequest($id);
                    unset($state['responseId']);
                }
                $this->write($id, 'status', $state);
            }
        });
    }

    public function prune(): void
    {
        // Work is bounded per start. Abandoned inputs are removed on subsequent starts.
        $processed = 0;
        foreach (new \DirectoryIterator($this->directory) as $file) {
            if (++$processed > 500) {
                break;
            }
            if ($file->isFile() && !$file->isLink() && $file->getMTime() < time() - self::TTL && preg_match('/^[a-f0-9]{64}\.(?:request|status|start|run|tmp-[a-f0-9]+)$/D', $file->getFilename())) {
                @unlink($file->getPathname());
            }
        }
    }

    private function identifier(int $userId, string $requestId): string
    {
        if ($userId <= 0 || !preg_match('/^[a-f0-9]{32}$/D', $requestId)) {
            throw new \OutOfBoundsException('Generation not found.');
        }

        return hash_hmac('sha256', $userId.':'.$requestId, $this->key);
    }

    private function path(string $id, string $suffix): string
    {
        if (!preg_match('/^[a-f0-9]{64}$/D', $id)) {
            throw new \OutOfBoundsException('Generation not found.');
        }

        return $this->directory.\DIRECTORY_SEPARATOR.$id.'.'.$suffix;
    }

    private function locked(string $id, string $suffix, callable $callback): mixed
    {
        $path = $this->path($id, $suffix);
        $handle = @fopen($path, 'c+');
        if (!$handle) {
            throw new \RuntimeException('Could not lock generation.');
        }
        @chmod($path, 0600);
        if (!flock($handle, \LOCK_EX | \LOCK_NB)) {
            fclose($handle);

            // Concurrent starts can be polled; a worker never waits behind another worker.
            if ('run' === $suffix) {
                return null;
            }

            throw new \RuntimeException('Generation is already being processed.');
        }

        try {
            return $callback();
        } finally {
            flock($handle, \LOCK_UN);
            fclose($handle);
        }
    }

    private function read(string $id, string $suffix): array
    {
        $bytes = @file_get_contents($this->path($id, $suffix));
        if (false === $bytes) {
            throw new \OutOfBoundsException('Generation not found.');
        }
        $decoded = $this->security->decryptByKey($bytes, $this->key);
        if (false === $decoded) {
            throw new \OutOfBoundsException('Generation not found.');
        }

        return json_decode($decoded, true, flags: \JSON_THROW_ON_ERROR);
    }

    private function write(string $id, string $suffix, array $data): void
    {
        $path = $this->path($id, 'tmp-'.bin2hex(random_bytes(8)));
        $bytes = $this->security->encryptByKey(json_encode($data, \JSON_THROW_ON_ERROR), $this->key);

        try {
            if (file_put_contents($path, $bytes, \LOCK_EX) !== \strlen($bytes)) {
                throw new \RuntimeException('Could not store generation.');
            }
            @chmod($path, 0600);
            if (!rename($path, $this->path($id, $suffix))) {
                throw new \RuntimeException('Could not store generation.');
            }
        } finally {
            @unlink($path);
        }
    }

    private function removeRequest(string $id): void
    {
        @unlink($this->path($id, 'request'));
    }
}

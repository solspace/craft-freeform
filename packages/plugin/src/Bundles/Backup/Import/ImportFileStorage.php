<?php

namespace Solspace\Freeform\Bundles\Backup\Import;

use Solspace\Freeform\Library\Helpers\CryptoHelper;
use yii\helpers\FileHelper;

/**
 * Keeps uploads available between requests. Multi-instance hosts must use a shared Craft cache.
 */
class ImportFileStorage
{
    private const CACHE_PREFIX = 'freeform-import-file-';
    private const CACHE_DURATION = 3600;
    private const CHUNK_SIZE = 524288;

    public function store(string $token, string $file, ?string $password = null): void
    {
        $handle = fopen($file, 'r');
        if (false === $handle) {
            throw new \RuntimeException('Could not read the uploaded import file.');
        }

        $cache = \Craft::$app->cache;
        $key = self::CACHE_PREFIX.$token;
        $chunks = 0;

        try {
            while (!feof($handle)) {
                $chunk = fread($handle, self::CHUNK_SIZE);
                if (false === $chunk) {
                    throw new \RuntimeException('Could not read the uploaded import file.');
                }

                if ('' === $chunk) {
                    break;
                }

                if (!$cache->set($key.'-'.$chunks, $chunk, self::CACHE_DURATION)) {
                    throw new \RuntimeException('Could not store the import file in the Craft cache.');
                }

                ++$chunks;
            }

            if (!$cache->set($key, [
                'chunks' => $chunks,
                'password' => $password,
                'hash' => hash_file('sha256', $file),
            ], self::CACHE_DURATION)) {
                throw new \RuntimeException('Could not store the import file in the Craft cache.');
            }
        } catch (\Throwable $e) {
            for ($index = 0; $index < $chunks; ++$index) {
                $cache->delete($key.'-'.$index);
            }

            throw $e;
        } finally {
            fclose($handle);
        }
    }

    public function restore(string $token): string
    {
        $cache = \Craft::$app->cache;
        $key = self::CACHE_PREFIX.$token;
        $metadata = $cache->get($key);
        if (!\is_array($metadata)) {
            throw new \RuntimeException('Import file is missing or expired. Please upload it again.');
        }

        // Each request gets its own working directory, even on the same PHP instance.
        $path = \Craft::$app->path->getTempPath().'/freeform-import-'.CryptoHelper::getUniqueToken(24);
        FileHelper::createDirectory($path, 0700);
        $archive = $path.'.zip';

        try {
            $handle = fopen($archive, 'w');
            if (false === $handle) {
                throw new \RuntimeException('Could not create the import working file.');
            }

            try {
                for ($index = 0; $index < $metadata['chunks']; ++$index) {
                    $chunk = $cache->get($key.'-'.$index);
                    if (!\is_string($chunk)) {
                        throw new \RuntimeException('Import file is incomplete or expired. Please upload it again.');
                    }

                    if (fwrite($handle, $chunk) !== \strlen($chunk)) {
                        throw new \RuntimeException('Could not write the import working file.');
                    }
                }
            } finally {
                fclose($handle);
            }

            if (hash_file('sha256', $archive) !== $metadata['hash']) {
                throw new \RuntimeException('Import file is incomplete or corrupted. Please upload it again.');
            }

            $zip = new \ZipArchive();
            if (true !== $zip->open($archive)) {
                throw new \RuntimeException('Failed to open ZIP file.');
            }

            try {
                if ($metadata['password']) {
                    $zip->setPassword($metadata['password']);
                }

                if (!@$zip->extractTo($path) || \ZipArchive::ER_OK !== $zip->status) {
                    throw new \RuntimeException('Failed to extract ZIP file: '.$zip->getStatusString(), 403);
                }
            } finally {
                $zip->close();
            }

            return $path;
        } catch (\Throwable $e) {
            FileHelper::removeDirectory($path);

            throw $e;
        } finally {
            if (is_file($archive)) {
                unlink($archive);
            }
        }
    }

    public function delete(string $token): void
    {
        $cache = \Craft::$app->cache;
        $key = self::CACHE_PREFIX.$token;
        $metadata = $cache->get($key);

        if (\is_array($metadata)) {
            for ($index = 0; $index < $metadata['chunks']; ++$index) {
                $cache->delete($key.'-'.$index);
            }
        }

        $cache->delete($key);
    }
}

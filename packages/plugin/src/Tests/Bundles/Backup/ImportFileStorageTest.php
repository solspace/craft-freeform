<?php

namespace Solspace\Freeform\Tests\Bundles\Backup;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Bundles\Backup\Export\FileExportReader;
use Solspace\Freeform\Bundles\Backup\Import\ImportFileStorage;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationTypeProvider;
use yii\caching\ArrayCache;
use yii\di\Container;
use yii\helpers\FileHelper;
use yii\web\NotFoundHttpException;

#[CoversClass(ImportFileStorage::class)]
#[CoversClass(FileExportReader::class)]
class ImportFileStorageTest extends TestCase
{
    private mixed $previousApp;
    private mixed $previousContainer;
    private string $root;
    private ArrayCache $cache;
    private ImportFileStorage $storage;

    protected function setUp(): void
    {
        $this->previousApp = \Craft::$app;
        $this->previousContainer = \Craft::$container;
        $this->root = sys_get_temp_dir().'/freeform-import-test-'.bin2hex(random_bytes(8));
        FileHelper::createDirectory($this->root);
        $this->cache = new ArrayCache();
        $this->storage = new ImportFileStorage();
        \Craft::$container = new Container();
        \Craft::$container->setSingleton(ImportFileStorage::class, $this->storage);
        $this->useInstance('upload');
    }

    protected function tearDown(): void
    {
        \Craft::$app = $this->previousApp;
        \Craft::$container = $this->previousContainer;
        FileHelper::removeDirectory($this->root);
    }

    public function testImportRestoresAllFilesOnAnotherInstanceAndCleansUp(): void
    {
        $favorite = ['uid' => 'favorite-uid', 'label' => 'Favorite', 'type' => 'text', 'metadata' => []];
        $form = [
            'uid' => 'form-uid', 'name' => 'Contact', 'handle' => 'contact', 'order' => 1,
            'settings' => [], 'notifications' => [], 'integrations' => [], 'rules' => [], 'pages' => [],
        ];
        $template = '{% extends "freeform" %}';
        $this->storage->store('token', $this->createZip([
            'forms.jsonl' => json_encode($form)."\n",
            'favorites.jsonl' => json_encode($favorite)."\n",
            'templates/formatting/custom/index.twig' => $template,
            'submissions-form-uid.jsonl' => "{\"title\":\"Submission\"}\n",
            'large.bin' => random_bytes(1100000),
        ]));
        $metadata = $this->cache->get('freeform-import-file-token');
        self::assertGreaterThan(1, $metadata['chunks']);

        // Release the preview's local files but retain the shared upload for the import request.
        $preview = $this->reader();
        self::assertCount(1, $this->invoke($preview, 'collectForms'));
        self::assertCount(1, $this->invoke($preview, 'collectFavorites'));
        $previewPath = $this->invoke($preview, 'getPath');
        $preview->release();
        self::assertDirectoryDoesNotExist($previewPath);
        self::assertIsArray($this->cache->get('freeform-import-file-token'));

        $this->useInstance('import');
        $reader = $this->reader();
        $reader->setOptions(['fileToken' => 'token', 'forms' => ['form-uid'], 'favorites' => ['favorite-uid'], 'formSubmissions' => ['form-uid']]);
        $forms = $this->invoke($reader, 'collectForms', ['form-uid']);
        self::assertCount(1, $forms);
        self::assertSame('Contact', iterator_to_array($forms)[0]->name);
        $favorites = $this->invoke($reader, 'collectFavorites', ['favorite-uid']);
        self::assertCount(1, $favorites);
        self::assertSame('Favorite', iterator_to_array($favorites)[0]->label);
        $path = $this->invoke($reader, 'getPath');
        self::assertStringStartsWith($this->root.'/import/', $path);
        self::assertSame($template, file_get_contents($path.'/templates/formatting/custom/index.twig'));
        self::assertSame("{\"title\":\"Submission\"}\n", file_get_contents($path.'/submissions-form-uid.jsonl'));

        $reader->destruct();
        self::assertDirectoryDoesNotExist($path);
        self::assertFalse($this->cache->get('freeform-import-file-token'));
        for ($index = 0; $index < $metadata['chunks']; ++$index) {
            self::assertFalse($this->cache->get('freeform-import-file-token-'.$index));
        }
    }

    public function testMissingUploadThrowsInsteadOfReturningAnEmptyCollection(): void
    {
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Import file is missing or expired');
        $this->invoke($this->reader(), 'collectFavorites');
    }

    public function testMissingChunkThrowsAndRemovesWorkingFiles(): void
    {
        $this->storage->store('token', $this->createZip(['forms.jsonl' => '{}']));
        $this->cache->delete('freeform-import-file-token-0');
        $this->useInstance('import');

        try {
            $this->storage->restore('token');
            self::fail('Missing chunks must not produce empty collections');
        } catch (\RuntimeException $e) {
            self::assertStringContainsString('incomplete or expired', $e->getMessage());
        }

        self::assertSame([], glob($this->root.'/import/*'));
    }

    public function testCorruptChunkThrowsAndRemovesWorkingFiles(): void
    {
        $this->storage->store('token', $this->createZip(['forms.jsonl' => '{}']));
        $this->cache->set('freeform-import-file-token-0', 'corrupted archive');

        try {
            $this->storage->restore('token');
            self::fail('Corrupted chunks must not be imported');
        } catch (\RuntimeException $e) {
            self::assertStringContainsString('incomplete or corrupted', $e->getMessage());
        }

        self::assertSame([], glob($this->root.'/upload/*'));
    }

    public function testPartialExportCanOmitFormsAndOtherCollections(): void
    {
        $this->storage->store('token', $this->createZip(['submissions-form-uid.jsonl' => '{}']));
        $reader = $this->reader();

        try {
            self::assertCount(0, $this->invoke($reader, 'collectForms'));
            self::assertCount(0, $this->invoke($reader, 'collectFavorites'));
            self::assertNull($this->invoke($reader, 'collectSettings', true));
            self::assertCount(1, iterator_to_array($this->invoke($reader, 'getSubmissionFiles')));
        } finally {
            $reader->destruct();
        }
    }

    public function testDeletedWorkingDirectoryIsNotSilentlyIgnored(): void
    {
        $this->storage->store('token', $this->createZip(['forms.jsonl' => '{}']));
        $reader = $this->reader();
        FileHelper::removeDirectory($this->invoke($reader, 'getPath'));

        $this->expectException(NotFoundHttpException::class);
        $this->expectExceptionMessage('Import file no longer exists');
        $this->invoke($reader, 'collectFavorites');
    }

    public function testMissingSelectedCollectionIsReported(): void
    {
        $this->storage->store('token', $this->createZip(['submissions-form-uid.jsonl' => '{}']));
        $reader = $this->reader();

        try {
            $this->expectException(\RuntimeException::class);
            $this->expectExceptionMessage('Import file is missing: forms.jsonl');
            $this->invoke($reader, 'collectForms', ['form-uid']);
        } finally {
            $reader->destruct();
        }
    }

    public function testMalformedJsonIsReported(): void
    {
        $this->storage->store('token', $this->createZip(['favorites.jsonl' => 'broken json']));
        $reader = $this->reader();

        try {
            $this->expectException(\JsonException::class);
            $this->invoke($reader, 'collectFavorites');
        } finally {
            $reader->destruct();
        }
    }

    public function testPasswordProtectedArchiveRestoresOnAnotherInstance(): void
    {
        $this->storage->store('token', $this->createZip(['forms.jsonl' => '{}'], 'secret'), 'secret');
        $this->useInstance('import');
        $path = $this->storage->restore('token');
        self::assertSame('{}', file_get_contents($path.'/forms.jsonl'));
    }

    public function testIncorrectPasswordReportsAnErrorAndRemovesWorkingFiles(): void
    {
        $this->storage->store('token', $this->createZip(['forms.jsonl' => '{}'], 'secret'), 'wrong');

        try {
            $this->storage->restore('token');
            self::fail('Incorrect passwords must be rejected');
        } catch (\RuntimeException $e) {
            self::assertSame(403, $e->getCode());
            self::assertStringContainsString('Failed to extract ZIP file', $e->getMessage());
        }

        self::assertSame([], glob($this->root.'/upload/*'));
    }

    public function testCacheWriteFailureRemovesPreviouslyWrittenChunks(): void
    {
        $cache = $this->createMock(ArrayCache::class);
        $cache->expects(self::exactly(2))->method('set')->willReturnOnConsecutiveCalls(true, false);
        $cache->expects(self::once())->method('delete')->with('freeform-import-file-token-0');
        \Craft::$app->cache = $cache;

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Could not store the import file in the Craft cache');
        $this->storage->store('token', $this->createZip(['large.bin' => random_bytes(1100000)]));
    }

    private function useInstance(string $instance): void
    {
        $path = $this->root.'/'.$instance;
        FileHelper::createDirectory($path);
        \Craft::$app = (object) [
            'cache' => $this->cache,
            'path' => new class($path) {
                public function __construct(private string $path) {}

                public function getTempPath(): string
                {
                    return $this->path;
                }
            },
        ];
    }

    private function createZip(array $files, ?string $password = null): string
    {
        $file = $this->root.'/upload.zip';
        $zip = new \ZipArchive();
        self::assertTrue($zip->open($file, \ZipArchive::CREATE | \ZipArchive::OVERWRITE));
        foreach ($files as $name => $content) {
            $zip->addFromString($name, $content);
            if (null !== $password) {
                $zip->setEncryptionName($name, \ZipArchive::EM_AES_256, $password);
            }
        }
        $zip->close();

        return $file;
    }

    private function reader(): FileExportReader
    {
        $reader = new FileExportReader(
            $this->createMock(PropertyProvider::class),
            $this->createMock(IntegrationTypeProvider::class),
        );
        $reader->setOptions(['fileToken' => 'token']);

        return $reader;
    }

    private function invoke(FileExportReader $reader, string $method, mixed ...$args): mixed
    {
        return (new \ReflectionMethod(FileExportReader::class, $method))->invoke($reader, ...$args);
    }
}

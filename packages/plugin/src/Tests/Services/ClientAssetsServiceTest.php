<?php

namespace Solspace\Freeform\Tests\Services;

use craft\web\View;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Services\ClientAssetsService;

#[CoversClass(ClientAssetsService::class)]
class ClientAssetsServiceTest extends TestCase
{
    public function testIncompletePublishedAssetsAreRepairedBeforeRegisteringTheirUrls(): void
    {
        $resources = \dirname(__DIR__, 2).'/Resources';
        $published = sys_get_temp_dir().'/freeform-client-published-'.bin2hex(random_bytes(8));
        mkdir($published.'/js/client/assets', 0775, true);
        file_put_contents($published.'/js/client/manifest.json', '{}');
        $manifest = json_decode(file_get_contents($resources.'/js/client/manifest.json'), true, flags: \JSON_THROW_ON_ERROR);
        $view = $this->getMockBuilder(View::class)->disableOriginalConstructor()->onlyMethods(['registerCssFile', 'registerJsFile', 'registerHtml'])->getMock();
        $view->method('registerJsFile')->willReturnCallback(static function () use ($manifest, $published): void {
            foreach ($manifest as $chunk) {
                foreach (array_merge([$chunk['file']], $chunk['css'] ?? [], $chunk['assets'] ?? []) as $file) {
                    self::assertFileExists($published.'/js/client/'.$file);
                }
            }
        });
        $previous = $_SERVER['FF_CLIENT_DEV_ENABLED'] ?? null;
        $_SERVER['FF_CLIENT_DEV_ENABLED'] = false;

        try {
            $service = new ClientAssetsService();
            $service->registerAssets($view, 'https://example.test/assets', $resources, $published);
            $entry = $published.'/js/client/'.$manifest['src/index.tsx']['file'];
            touch($entry, 1000000000);
            // A complete published copy is reused, including its lazy chunks.
            $service->registerAssets($view, 'https://example.test/assets', $resources, $published);
            clearstatcache(true, $entry);
            self::assertSame(1000000000, filemtime($entry));
        } finally {
            if (null === $previous) {
                unset($_SERVER['FF_CLIENT_DEV_ENABLED']);
            } else {
                $_SERVER['FF_CLIENT_DEV_ENABLED'] = $previous;
            }
            $iterator = new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($published, \FilesystemIterator::SKIP_DOTS), \RecursiveIteratorIterator::CHILD_FIRST);
            foreach ($iterator as $file) {
                $file->isDir() ? rmdir($file->getPathname()) : unlink($file->getPathname());
            }
            rmdir($published);
        }
    }

    public function testCommittedManifestCanRegisterProductionAssets(): void
    {
        $resources = \dirname(__DIR__, 2).'/Resources';
        $manifest = json_decode(file_get_contents($resources.'/js/client/manifest.json'), true, flags: \JSON_THROW_ON_ERROR);
        self::assertArrayHasKey('src/index.tsx', $manifest);
        $entry = $manifest['src/index.tsx'];
        $stylesheets = $this->collectStylesheets($manifest, 'src/index.tsx');
        $view = $this->getMockBuilder(View::class)->disableOriginalConstructor()->onlyMethods(['registerCssFile', 'registerJsFile', 'registerHtml'])->getMock();
        $registeredCss = [];
        $view->expects(self::exactly(\count($stylesheets)))->method('registerCssFile')->willReturnCallback(static function (string $url, array $options, string $key) use (&$registeredCss, $resources): void {
            self::assertStringStartsWith('https://example.test/assets/js/client/', $url);
            $file = substr($url, \strlen('https://example.test/assets/'));
            self::assertFileExists($resources.'/'.$file);
            self::assertSame([], $options);
            self::assertSame('ff-client-css:'.substr($file, \strlen('js/client/')), $key);
            self::assertNotContains($url, $registeredCss);
            $registeredCss[] = $url;
        });
        $view->expects(self::once())->method('registerJsFile')->with(
            'https://example.test/assets/js/client/'.$entry['file'],
            ['type' => 'module', 'position' => View::POS_HEAD, 'appendTimestamp' => false],
            'ff-client-entry'
        );

        $previous = $_SERVER['FF_CLIENT_DEV_ENABLED'] ?? null;
        $_SERVER['FF_CLIENT_DEV_ENABLED'] = false;

        try {
            (new ClientAssetsService())->registerAssets($view, 'https://example.test/assets', $resources);
            foreach ($stylesheets as $file) {
                self::assertContains('https://example.test/assets/js/client/'.$file, $registeredCss);
            }
        } finally {
            if (null === $previous) {
                unset($_SERVER['FF_CLIENT_DEV_ENABLED']);
            } else {
                $_SERVER['FF_CLIENT_DEV_ENABLED'] = $previous;
            }
        }
    }

    public function testAllManifestReferencesResolveToCommittedBuildFiles(): void
    {
        $build = \dirname(__DIR__, 2).'/Resources/js/client';
        $manifest = json_decode(file_get_contents($build.'/manifest.json'), true, flags: \JSON_THROW_ON_ERROR);
        foreach ($manifest as $key => $chunk) {
            foreach (array_merge([$chunk['file']], $chunk['css'] ?? [], $chunk['assets'] ?? []) as $file) {
                self::assertFileExists($build.'/'.$file, $key);
            }
            foreach (array_merge($chunk['imports'] ?? [], $chunk['dynamicImports'] ?? []) as $import) {
                self::assertArrayHasKey($import, $manifest, $key);
            }
        }
    }

    /** Mirrors ClientAssetsService::collectChunkGraph CSS collection. */
    private function collectStylesheets(array $manifest, string $chunkKey, array &$visited = []): array
    {
        if (isset($visited[$chunkKey])) {
            return [];
        }

        $visited[$chunkKey] = true;
        $chunk = $manifest[$chunkKey] ?? [];
        $stylesheets = $chunk['css'] ?? [];

        foreach ($chunk['imports'] ?? [] as $importKey) {
            $stylesheets = array_merge(
                $stylesheets,
                $this->collectStylesheets($manifest, $importKey, $visited)
            );
        }

        return array_values(array_unique($stylesheets));
    }
}

<?php

namespace Solspace\Freeform\Tests\Services;

use craft\web\View;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Services\ClientAssetsService;

#[CoversClass(ClientAssetsService::class)]
class ClientAssetsServiceTest extends TestCase
{
    public function testCommittedManifestCanRegisterProductionAssets(): void
    {
        $resources = \dirname(__DIR__, 2).'/Resources';
        $manifest = json_decode(file_get_contents($resources.'/js/client/manifest.json'), true, flags: \JSON_THROW_ON_ERROR);
        self::assertArrayHasKey('src/index.tsx', $manifest);
        $entry = $manifest['src/index.tsx'];
        $view = $this->getMockBuilder(View::class)->disableOriginalConstructor()->onlyMethods(['registerCssFile', 'registerJsFile', 'registerHtml'])->getMock();
        $registeredCss = [];
        $view->method('registerCssFile')->willReturnCallback(static function (string $url, array $options, string $key) use (&$registeredCss, $resources): void {
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
            foreach ($entry['css'] ?? [] as $file) {
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
}

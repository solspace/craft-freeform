<?php

namespace Solspace\Freeform\Services;

use craft\helpers\App;
use craft\helpers\Html;
use craft\helpers\Json;
use craft\web\View;
use GuzzleHttp\Exception\GuzzleException;

class ClientAssetsService extends BaseService
{
    private const BUILD_DIRECTORY = 'js/client';
    private const ENTRY_FILE = 'src/index.tsx';
    private const MANIFEST_FILE = 'manifest.json';
    private const DEFAULT_DEV_SERVER_URL = 'https://127.0.0.1:5173';
    private const DEFAULT_DEV_PROBE_URL = 'https://127.0.0.1:5173';

    private const ENV_ENABLED = 'FF_CLIENT_DEV_ENABLED';
    private const ENV_PROBE = 'FF_CLIENT_DEV_PROBE_URL';
    private const ENV_SERVER = 'FF_CLIENT_DEV_SERVER_URL';

    private ?array $manifest = null;
    private ?bool $devServerAvailable = null;

    public function registerAssets(View $view, string $resourceBaseUrl, string $resourceSourcePath): void
    {
        if ($this->registerDevServerAssets($view)) {
            return;
        }

        $manifest = $this->getManifest($resourceSourcePath);
        $entry = $this->getChunk($manifest, self::ENTRY_FILE);

        $visited = [];
        $preloads = [];
        $stylesheets = [];

        $this->collectChunkGraph($manifest, self::ENTRY_FILE, $visited, $preloads, $stylesheets);

        foreach (array_keys($stylesheets) as $cssFile) {
            $view->registerCssFile(
                $this->buildAssetUrl($resourceBaseUrl, $cssFile),
                [],
                'ff-client-css:'.$cssFile
            );
        }

        foreach (array_keys($preloads) as $chunkFile) {
            $view->registerHtml(
                Html::beginTag('link', [
                    'rel' => 'modulepreload',
                    'href' => $this->buildAssetUrl($resourceBaseUrl, $chunkFile),
                ]),
                View::POS_HEAD,
                'ff-client-preload:'.$chunkFile
            );
        }

        $view->registerJsFile(
            $this->buildAssetUrl($resourceBaseUrl, $entry['file']),
            [
                'type' => 'module',
                'position' => View::POS_HEAD,
            ],
            'ff-client-entry'
        );
    }

    private function registerDevServerAssets(View $view): bool
    {
        if (!$this->isDevModeEnabled() || !$this->isDevServerAvailable()) {
            return false;
        }

        $origin = $this->getDevServerUrl();

        $script = <<<JS
                import RefreshRuntime from '{$origin}/@react-refresh';
                RefreshRuntime.injectIntoGlobalHook(window);
                window.\$RefreshReg\$ = () => {};
                window.\$RefreshSig\$ = () => (type) => type;
                window.__vite_plugin_react_preamble_installed__ = true;
            JS;

        $view->registerScript(
            $script,
            View::POS_HEAD,
            ['type' => 'module'],
            'ff-vite-react-preamble'
        );

        $view->registerJsFile(
            $origin.'/@vite/client',
            [
                'type' => 'module',
                'position' => View::POS_HEAD,
            ],
            'ff-vite-client'
        );

        $view->registerJsFile(
            $origin.'/'.self::ENTRY_FILE,
            [
                'type' => 'module',
                'position' => View::POS_HEAD,
            ],
            'ff-client-entry'
        );

        return true;
    }

    private function isDevModeEnabled(): bool
    {
        return filter_var(App::env(self::ENV_ENABLED), \FILTER_VALIDATE_BOOLEAN);
    }

    private function isDevServerAvailable(): bool
    {
        if (null !== $this->devServerAvailable) {
            return $this->devServerAvailable;
        }

        try {
            $url = $this->getDevProbeUrl().'/@vite/client';
            $config = [
                'connect_timeout' => 0.5,
                'timeout' => 1.0,
                'http_errors' => false,
                'verify' => false,
            ];

            $response = \Craft::createGuzzleClient($config)->get($url);

            $this->devServerAvailable = 200 === $response->getStatusCode();
        } catch (GuzzleException|\Throwable) {
            $this->devServerAvailable = false;
        }

        return $this->devServerAvailable;
    }

    private function getDevServerUrl(): string
    {
        return App::env(self::ENV_SERVER) ?: self::DEFAULT_DEV_SERVER_URL;
    }

    private function getDevProbeUrl(): string
    {
        return App::env(self::ENV_PROBE) ?: self::DEFAULT_DEV_PROBE_URL;
    }

    private function getManifest(string $resourceSourcePath): array
    {
        if (null !== $this->manifest) {
            return $this->manifest;
        }

        $manifestPath = $resourceSourcePath.'/'.self::BUILD_DIRECTORY.'/'.self::MANIFEST_FILE;
        if (!is_file($manifestPath)) {
            throw new \RuntimeException(\sprintf('Freeform client manifest not found at "%s"', $manifestPath));
        }

        $contents = file_get_contents($manifestPath);
        $manifest = Json::decode($contents);
        if (!\is_array($manifest)) {
            throw new \RuntimeException(\sprintf('Freeform client manifest at "%s" is invalid', $manifestPath));
        }

        $this->manifest = $manifest;

        return $this->manifest;
    }

    private function collectChunkGraph(
        array $manifest,
        string $chunkKey,
        array &$visited,
        array &$preloads,
        array &$stylesheets
    ): void {
        if (isset($visited[$chunkKey])) {
            return;
        }

        $visited[$chunkKey] = true;
        $chunk = $this->getChunk($manifest, $chunkKey);

        foreach ($chunk['css'] ?? [] as $cssFile) {
            $stylesheets[$cssFile] = true;
        }

        foreach ($chunk['imports'] ?? [] as $importKey) {
            $importChunk = $this->getChunk($manifest, $importKey);
            $preloads[$importChunk['file']] = true;

            $this->collectChunkGraph($manifest, $importKey, $visited, $preloads, $stylesheets);
        }
    }

    private function getChunk(array $manifest, string $chunkKey): array
    {
        if (isset($manifest[$chunkKey]) && \is_array($manifest[$chunkKey])) {
            return $manifest[$chunkKey];
        }

        foreach ($manifest as $manifestEntry) {
            if (!\is_array($manifestEntry)) {
                continue;
            }

            $file = $manifestEntry['file'] ?? null;
            $src = $manifestEntry['src'] ?? null;

            if ($file === $chunkKey || $src === $chunkKey) {
                return $manifestEntry;
            }
        }

        throw new \RuntimeException(\sprintf('Freeform client manifest entry "%s" is missing', $chunkKey));
    }

    private function buildAssetUrl(string $resourceBaseUrl, string $relativePath): string
    {
        $chunks = [
            rtrim($resourceBaseUrl, '/'),
            self::BUILD_DIRECTORY,
            ltrim($relativePath, '/'),
        ];

        return implode('/', $chunks);
    }
}

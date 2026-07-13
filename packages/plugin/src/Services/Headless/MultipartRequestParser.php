<?php

namespace Solspace\Freeform\Services\Headless;

use craft\web\Request;

/**
 * Parses headless multipart submit payloads:
 *   _freeform: { ...json... }
 *   files[{handle}][]: <File>
 *
 * Remaps namespaced file keys into $_FILES[$handle] for existing validators.
 */
class MultipartRequestParser
{
    private const FILES_NAMESPACE = 'files';

    /**
     * @return null|array<string, mixed>
     */
    public function parseMetadata(Request $request): ?array
    {
        $raw = $request->post('_freeform');
        if (!\is_string($raw) || '' === $raw) {
            return null;
        }

        try {
            $decoded = json_decode($raw, true, 512, \JSON_THROW_ON_ERROR);
        } catch (\JsonException) {
            return null;
        }

        return \is_array($decoded) ? $decoded : null;
    }

    /**
     * Inspect raw Yii/Craft parsed file upload structure for spike diagnostics.
     *
     * @return array<string, mixed>
     */
    public function describeRawFiles(Request $request): array
    {
        return [
            'filesSuperglobal' => $_FILES['files'] ?? null,
            'allSuperglobalKeys' => array_keys($_FILES),
            'postKeys' => array_keys($request->post()),
        ];
    }

    /**
     * Extract files keyed by field handle from files[{handle}][] naming.
     *
     * @return array<string, array{name: array, type: array, tmp_name: array, error: array, size: array}>
     */
    public function extractFilesByHandle(Request $request): array
    {
        $namespace = $_FILES[self::FILES_NAMESPACE] ?? null;
        if (!\is_array($namespace) || !isset($namespace['name']) || !\is_array($namespace['name'])) {
            return [];
        }

        $byHandle = [];
        foreach ($namespace['name'] as $handle => $names) {
            if (!\is_string($handle) || '' === $handle) {
                continue;
            }

            $byHandle[$handle] = $this->sliceHandleFiles($namespace, $handle);
        }

        return $byHandle;
    }

    /**
     * Remap files[{handle}][] into $_FILES[$handle] for existing Freeform validators.
     *
     * @return array<string, array{name: array, type: array, tmp_name: array, error: array, size: array}>
     */
    public function remapFilesToFieldHandles(Request $request): array
    {
        $byHandle = $this->extractFilesByHandle($request);
        foreach ($byHandle as $handle => $files) {
            $_FILES[$handle] = $files;
        }

        return $byHandle;
    }

    /**
     * @return array<string, array{name: array, type: array, tmp_name: array, error: array, size: array}>
     */
    private function sliceHandleFiles(array $namespace, string $handle): array
    {
        $result = [];
        foreach (['name', 'type', 'tmp_name', 'error', 'size'] as $key) {
            $value = $namespace[$key][$handle] ?? [];
            $result[$key] = \is_array($value) ? array_values($value) : [$value];
        }

        return $result;
    }
}

<?php

namespace Solspace\Freeform\Bundles\Fields\Validation\Helpers;

use Solspace\Freeform\Freeform;
use Solspace\Freeform\Services\FilesService;

class FileUploadValidationHelper
{
    private const FILE_KEYS = ['name', 'tmp_name', 'error', 'size', 'type'];

    public function __construct(private FilesService $filesService) {}

    public function normalizeFilesInput(array $files): array
    {
        $name = $files['name'] ?? null;
        if (null === $name || '' === $name) {
            return [];
        }

        if (!\is_array($name)) {
            $entries = [];
            foreach (self::FILE_KEYS as $key) {
                $entries[$key] = [$files[$key] ?? null];
            }

            $files = $entries;
        }

        $normalized = [];
        foreach ($files['name'] as $index => $entryName) {
            $normalized[] = [
                'name' => (string) $entryName,
                'tmp_name' => (string) ($files['tmp_name'][$index] ?? ''),
                'error' => (int) ($files['error'][$index] ?? \UPLOAD_ERR_NO_FILE),
                'size' => (int) ($files['size'][$index] ?? 0),
                'type' => (string) ($files['type'][$index] ?? ''),
            ];
        }

        return $normalized;
    }

    public function extractNestedFilesInput(array $files, int $rowIndex, int $columnIndex): array
    {
        $name = $files['name'][$rowIndex][$columnIndex] ?? null;
        if (null === $name || '' === $name) {
            return [];
        }

        $normalized = [];
        if (\is_array($name)) {
            foreach ($name as $index => $entryName) {
                $normalized[] = [
                    'name' => (string) $entryName,
                    'tmp_name' => (string) ($files['tmp_name'][$rowIndex][$columnIndex][$index] ?? ''),
                    'error' => (int) ($files['error'][$rowIndex][$columnIndex][$index] ?? \UPLOAD_ERR_NO_FILE),
                    'size' => (int) ($files['size'][$rowIndex][$columnIndex][$index] ?? 0),
                    'type' => (string) ($files['type'][$rowIndex][$columnIndex][$index] ?? ''),
                ];
            }
        } else {
            $normalized[] = [
                'name' => (string) $name,
                'tmp_name' => (string) ($files['tmp_name'][$rowIndex][$columnIndex] ?? ''),
                'error' => (int) ($files['error'][$rowIndex][$columnIndex] ?? \UPLOAD_ERR_NO_FILE),
                'size' => (int) ($files['size'][$rowIndex][$columnIndex] ?? 0),
                'type' => (string) ($files['type'][$rowIndex][$columnIndex] ?? ''),
            ];
        }

        return $normalized;
    }

    public function getValidExtensionsForKinds(array $selectedKinds): array
    {
        $allFileKinds = $this->filesService->getFileKinds();
        $allowedExtensions = [];

        if ($selectedKinds) {
            foreach ($selectedKinds as $kind) {
                if (isset($allFileKinds[$kind])) {
                    $allowedExtensions = array_merge($allowedExtensions, $allFileKinds[$kind]);
                }
            }
        } else {
            $allowedExtensions = \Craft::$app->getConfig()->getGeneral()->allowedFileExtensions;
        }

        $allowedExtensions = array_map('strtolower', $allowedExtensions);

        return array_values(array_unique($allowedExtensions));
    }

    public function validateFileEntry(
        array $file,
        array $validExtensions,
        int $maxFileSizeKB,
        callable $addError
    ): bool {
        $tmpName = $file['tmp_name'] ?? '';
        $errorCode = (int) ($file['error'] ?? \UPLOAD_ERR_NO_FILE);
        $name = (string) ($file['name'] ?? '');

        if (empty($tmpName) && \UPLOAD_ERR_NO_FILE === $errorCode) {
            return false;
        }

        if (empty($tmpName)) {
            switch ($errorCode) {
                case \UPLOAD_ERR_INI_SIZE:
                case \UPLOAD_ERR_FORM_SIZE:
                    $addError(Freeform::t('File size too large'));

                    break;

                case \UPLOAD_ERR_PARTIAL:
                    $addError(Freeform::t('The file was only partially uploaded'));

                    break;
            }

            $addError(Freeform::t('Could not upload file'));
        }

        if ('' !== $name) {
            $extension = strtolower((string) pathinfo($name, \PATHINFO_EXTENSION));
            if ($extension && !\in_array($extension, $validExtensions, true)) {
                $addError(
                    Freeform::t(
                        "'{extension}' is not an allowed file extension",
                        ['extension' => $extension]
                    )
                );
            }
        }

        $size = (int) ($file['size'] ?? 0);
        $fileSizeKB = (int) ceil($size / 1024);
        if ($fileSizeKB > $maxFileSizeKB) {
            $addError(
                Freeform::t(
                    'You tried uploading {fileSize}KB, but the maximum file upload size is {maxFileSize}KB',
                    ['fileSize' => $fileSizeKB, 'maxFileSize' => $maxFileSizeKB]
                )
            );
        }

        return true;
    }
}

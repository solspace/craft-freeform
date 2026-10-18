<?php

namespace Solspace\Freeform\Services;

use Solspace\Freeform\Fields\Implementations\FileUploadField;
use Solspace\Freeform\Fields\Implementations\Pro\FileDragAndDropField;
use Solspace\Freeform\Freeform;

class SampleFileService
{
    public const POST_KEY = '__freeform_sample_files';

    private static ?array $catalog = null;

    public function __construct(private ?FilesService $filesService = null) {}

    public function getCatalog(): array
    {
        return self::$catalog ??= json_decode(file_get_contents(__DIR__.'/../Resources/sample-files/catalog.json'), true, 512, \JSON_THROW_ON_ERROR);
    }

    public function getForField(FileUploadField $field): ?array
    {
        return $this->availableForField($field)[0] ?? null;
    }

    public function select(array $extensions, int $maxBytes): ?array
    {
        $extensions = array_map('strtolower', $extensions);
        foreach ($this->getCatalog() as $file) {
            if ($file['size'] <= $maxBytes && \in_array(pathinfo($file['name'], \PATHINFO_EXTENSION), $extensions, true)) {
                return $file;
            }
        }

        return null;
    }

    public function createDescriptor(FileUploadField $field): ?array
    {
        if (!$field->isSampleDataEnabled() || $field->getValue()) {
            return null;
        }
        $available = $this->availableForField($field);
        if (!$available || !$field->getUid()) {
            return null;
        }
        $kind = $available[0]['kind'];
        $pool = array_values(array_filter($available, static fn (array $file) => $file['kind'] === $kind));
        shuffle($pool);
        $count = $field instanceof FileDragAndDropField ? random_int(1, max(1, min(3, $field->getFileCount()))) : 1;
        $samples = [];
        for ($index = 0; $index < $count; ++$index) {
            $sample = $pool[$index % \count($pool)];
            if ($index >= \count($pool)) {
                $sample['name'] = preg_replace('/(\.[^.]+)$/', '-'.($index + 1).'$1', $sample['name']);
            }
            $samples[] = $sample;
        }
        $file = $samples[0];

        return array_merge($file, [
            'key' => $field->getUid(),
            'token' => $this->sign($this->payload($field, $file)),
            'count' => $count,
            'additionalFiles' => \array_slice($samples, 1),
            'label' => Freeform::t('Sample file'),
            'removeLabel' => Freeform::t('Remove sample file'),
        ]);
    }

    public function hasSubmittedSample(FileUploadField $field, ?array $submitted = null): bool
    {
        $submitted ??= \is_array($_POST[self::POST_KEY] ?? null) ? $_POST[self::POST_KEY] : [];
        $token = $submitted[$field->getUid() ?? ''] ?? null;
        if (!\is_string($token) || !$field->isSampleDataEnabled()) {
            return false;
        }
        if ($field->getForm()->isGraphQLPosted() || $field->getForm()->isHeadlessPosted()) {
            return false;
        }
        $payload = $this->verify($token);
        if (\is_string($payload)) {
            foreach ($this->availableForField($field) as $file) {
                if (hash_equals($this->payload($field, $file), $payload)) {
                    return true;
                }
            }
        }

        return false;
    }

    public function isSampleUpload(FileUploadField $field, array $upload): bool
    {
        if (!$field->isSampleDataEnabled() || \UPLOAD_ERR_OK !== ($upload['error'] ?? \UPLOAD_ERR_NO_FILE)) {
            return false;
        }
        $path = $upload['tmp_name'] ?? '';
        if (!is_file($path)) {
            return false;
        }
        foreach ($this->availableForField($field) as $file) {
            $names = [$file['name']];
            if ($field instanceof FileDragAndDropField) {
                for ($index = 2; $index <= min(3, $field->getFileCount()); ++$index) {
                    $names[] = preg_replace('/(\.[^.]+)$/', '-'.$index.'$1', $file['name']);
                }
            }
            if (\in_array($upload['name'] ?? '', $names, true)) {
                return filesize($path) === $file['size'] && hash_equals(hash('sha256', base64_decode($file['data'])), hash_file('sha256', $path));
            }
        }

        return false;
    }

    protected function sign(string $value): string
    {
        return \Craft::$app->security->hashData($value);
    }

    protected function verify(string $value): false|string
    {
        return \Craft::$app->security->validateData($value);
    }

    private function availableForField(FileUploadField $field): array
    {
        if (!$field->isSampleDataEnabled()) {
            return [];
        }
        $extensions = array_map('strtolower', ($this->filesService ?? Freeform::getInstance()->files)->getValidExtensions($field));

        return array_values(array_filter($this->getCatalog(), static fn (array $file) => $file['size'] <= $field->getMaxFileSizeBytes() && \in_array(pathinfo($file['name'], \PATHINFO_EXTENSION), $extensions, true)));
    }

    private function payload(FileUploadField $field, array $file): string
    {
        return 'FreeformSampleFile:'.json_encode([
            $field->getForm()->getId(), $field->getUid(), $file['name'], hash('sha256', $file['data']),
        ], \JSON_THROW_ON_ERROR);
    }
}

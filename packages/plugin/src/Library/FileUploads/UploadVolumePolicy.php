<?php

namespace Solspace\Freeform\Library\FileUploads;

use Solspace\Freeform\Fields\Implementations\Pro\TableField;
use Solspace\Freeform\Fields\Interfaces\FileUploadInterface;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Services\SettingsService;

/** Limits builder destinations without changing the destinations of live forms. */
class UploadVolumePolicy
{
    public function __construct(private SettingsService $settingsService) {}

    public function isRestricted(): bool
    {
        return '*' !== $this->settingsService->getSettingsModel()->allowedUploadVolumes;
    }

    public function getViewableVolumes(): array
    {
        return array_values(array_filter(
            \Craft::$app->getVolumes()->getViewableVolumes(),
            fn ($volume) => $this->allowsVolume($volume),
        ));
    }

    public function allowsSource(mixed $source): bool
    {
        if (!$this->isRestricted() || null === $source || '' === $source) {
            return true;
        }
        if (false === filter_var($source, \FILTER_VALIDATE_INT) || $source < 1) {
            return false;
        }
        $volume = \Craft::$app->getVolumes()->getVolumeById((int) $source);

        return $volume && $this->allowsVolume($volume);
    }

    public function defaultSource(mixed $source): mixed
    {
        if (!$this->isRestricted()) {
            return $source;
        }
        $volumes = $this->getViewableVolumes();
        foreach ($volumes as $volume) {
            if ((string) $volume->id === (string) $source) {
                return $volume->id;
            }
        }

        return $volumes[0]->id ?? null;
    }

    /** Validate base and translated destinations before any form records are written. */
    public function validatePayload(object $payload): array
    {
        if (!$this->isRestricted()) {
            return [];
        }
        $errors = [];
        foreach ($payload->layout->fields ?? [] as $field) {
            $type = $field->typeClass ?? '';
            $upload = is_a($type, FileUploadInterface::class, true);
            $table = is_a($type, TableField::class, true);
            if (!$upload && !$table) {
                continue;
            }
            $variants = [$field->properties ?? new \stdClass()];
            foreach ($payload->translations ?? [] as $translation) {
                $variants[] = $translation->fields->{$field->uid} ?? new \stdClass();
            }
            foreach ($variants as $properties) {
                if ($upload && !$this->allowsSource($properties->assetSourceId ?? null)) {
                    $errors[$field->uid]['assetSourceId'] = [Freeform::t('Choose an allowed upload volume. Check translated settings as well.')];
                }
                if ($table) {
                    foreach ($properties->tableLayout ?? [] as $column) {
                        if (TableField::COLUMN_TYPE_FILE === ($column->type ?? null) && !$this->allowsSource($column->metadata->assetSourceId ?? null)) {
                            $errors[$field->uid]['tableLayout'] = [Freeform::t('Choose an allowed upload volume for each File Upload column. Check translated settings as well.')];
                        }
                    }
                }
            }
        }

        return $errors;
    }

    private function allowsVolume(object $volume): bool
    {
        $allowed = $this->settingsService->getSettingsModel()->allowedUploadVolumes;

        return '*' === $allowed || (\is_array($allowed) && \in_array($volume->handle, $allowed, true));
    }
}

<?php

namespace Solspace\Freeform\Bundles\Backup\Import\FormieV3\Fields\Processors;

use craft\elements\Asset;
use craft\elements\db\AssetQuery;
use Solspace\Freeform\Fields\Implementations\FileUploadField;

class FileUploadProcessor extends AbstractFieldProcessor
{
    public function canProcess($formField): bool
    {
        return 'verbb\formie\fields\FileUpload' === $formField::class;
    }

    public function getFreeformFieldClass(): string
    {
        return FileUploadField::class;
    }

    public function getFieldMetadata($formField): array
    {
        $metadata = $this->getBaseMetadata($formField);

        $metadata['maxFileSizeKB'] = $formField->maxFileSize ?? 0;
        $metadata['fileKinds'] = $formField->allowedKinds ?? ['image'];
        $metadata['fileCount'] = $formField->maxFiles ?? 1;

        $settings = $this->getFieldSettings($formField);

        $assetSourceId = null;
        $uploadLocation = null;

        // Try to get from direct properties first
        if (isset($formField->uploadLocationSource) && !empty($formField->uploadLocationSource)) {
            // Extract volume ID from "volume:uuid" format
            if (str_starts_with($formField->uploadLocationSource, 'volume:')) {
                $volumeUuid = substr($formField->uploadLocationSource, 7); // Remove "volume:" prefix
                // Convert UUID to volume ID
                $volume = \Craft::$app->getVolumes()->getVolumeByUid($volumeUuid);
                if ($volume) {
                    $assetSourceId = $volume->id;
                }
            }
        }

        if (isset($formField->uploadLocationSubpath) && !empty($formField->uploadLocationSubpath)) {
            $uploadLocation = $formField->uploadLocationSubpath;
        }

        // If not found directly, try to get from settings
        if (null === $assetSourceId || null === $uploadLocation) {
            $settings = $this->getFieldSettings($formField);

            if (null === $assetSourceId && isset($settings['uploadLocationSource']) && !empty($settings['uploadLocationSource'])) {
                if (str_starts_with($settings['uploadLocationSource'], 'volume:')) {
                    $volumeUuid = substr($settings['uploadLocationSource'], 7);
                    $volume = \Craft::$app->getVolumes()->getVolumeByUid($volumeUuid);
                    if ($volume) {
                        $assetSourceId = $volume->id;
                    }
                }
            }

            if (null === $uploadLocation && isset($settings['uploadLocationSubpath']) && !empty($settings['uploadLocationSubpath'])) {
                $uploadLocation = $settings['uploadLocationSubpath'];
            }
        }

        // Map to Freeform properties
        if (null !== $assetSourceId) {
            $metadata['assetSourceId'] = $assetSourceId;
        }
        if (null !== $uploadLocation) {
            $metadata['defaultUploadLocation'] = $uploadLocation;
        }

        return $metadata;
    }

    public function convertSubmissionValue($value): array
    {
        // Handle AssetQuery objects (most common case)
        if ($value instanceof AssetQuery) {
            $assets = $value->all();
            $assetIds = [];
            foreach ($assets as $asset) {
                $assetIds[] = $asset->id;
            }

            return $assetIds;
        }

        // Handle Asset elements
        if ($value instanceof Asset) {
            return [$value->id];
        }

        // Handle arrays of Asset elements
        if (\is_array($value) && !empty($value) && $value[0] instanceof Asset) {
            $assetIds = [];
            foreach ($value as $asset) {
                if ($asset instanceof Asset) {
                    $assetIds[] = $asset->id;
                }
            }

            return $assetIds;
        }

        // Handle arrays of asset IDs or objects with id/assetId
        if (\is_array($value)) {
            $assetIds = [];
            foreach ($value as $item) {
                if (is_numeric($item)) {
                    $assetIds[] = (int) $item;
                } elseif (\is_array($item)) {
                    if (isset($item['id']) && is_numeric($item['id'])) {
                        $assetIds[] = (int) $item['id'];
                    } elseif (isset($item['assetId']) && is_numeric($item['assetId'])) {
                        $assetIds[] = (int) $item['assetId'];
                    }
                }
            }

            return array_values(array_unique($assetIds));
        }

        // Handle JSON strings
        if (\is_string($value)) {
            $decoded = json_decode($value, true);
            if (\JSON_ERROR_NONE === json_last_error() && \is_array($decoded)) {
                return $this->convertSubmissionValue($decoded);
            }
        }

        return [];
    }
}

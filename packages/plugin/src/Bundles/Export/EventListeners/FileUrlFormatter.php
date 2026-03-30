<?php

namespace Solspace\Freeform\Bundles\Export\EventListeners;

use Solspace\Freeform\Bundles\Export\Events\PrepareExportValueEvent;
use Solspace\Freeform\Bundles\Export\SubmissionExportInterface;
use Solspace\Freeform\Fields\Implementations\FileUploadField;
use Solspace\Freeform\Fields\Implementations\Pro\TableField;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class FileUrlFormatter extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            SubmissionExportInterface::class,
            SubmissionExportInterface::EVENT_PREPARE_EXPORT_VALUE,
            [$this, 'formatFileUrl'],
        );
    }

    public static function getPriority(): int
    {
        return 400;
    }

    public function formatFileUrl(PrepareExportValueEvent $event): void
    {
        $field = $event->getField();
        if ($field instanceof FileUploadField) {
            $assets = $field->getAssets()->all();

            $urls = [];
            foreach ($assets as $asset) {
                $urls[] = $asset->getUrl() ?: $asset->getFilename() ?: $asset->id;
            }

            $event->setValue($urls);

            return;
        }

        if (!$field instanceof TableField) {
            return;
        }

        $value = $event->getValue();
        if (!\is_array($value)) {
            return;
        }

        $layout = $field->getTableLayout();
        foreach ($value as $rowIndex => $tableRow) {
            if (!\is_array($tableRow)) {
                continue;
            }

            foreach ($layout as $columnIndex => $column) {
                if (TableField::COLUMN_TYPE_FILE !== ($column->type ?? null)) {
                    continue;
                }

                $value[$rowIndex][$columnIndex] = $this->normalizeAssetUrls($tableRow[$columnIndex] ?? []);
            }
        }

        $event->setValue($value);
    }

    private function normalizeAssetUrls(mixed $value): array
    {
        if (!\is_array($value)) {
            if (null === $value || '' === $value) {
                return [];
            }

            $value = [$value];
        }

        $urls = [];
        foreach ($value as $assetId) {
            if (!\is_scalar($assetId) || !is_numeric((string) $assetId)) {
                continue;
            }

            $asset = \Craft::$app->assets->getAssetById((int) $assetId);
            if ($asset) {
                $urls[] = $asset->getUrl() ?: $asset->getFilename() ?: $asset->id;
            }
        }

        return $urls;
    }
}

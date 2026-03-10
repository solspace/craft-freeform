<?php

namespace Solspace\Freeform\Bundles\Fields\Implementations\TableField;

use craft\elements\Asset;
use craft\helpers\Html;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Submissions\RenderTableValueEvent;
use Solspace\Freeform\Fields\Implementations\Pro\TableField;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class TableFieldBundle extends FeatureBundle
{
    public function __construct()
    {
        Event::on(Submission::class, Submission::EVENT_RENDER_TABLE_VALUE, [$this, 'renderTableValue']);
    }

    public static function getPriority(): int
    {
        return 10;
    }

    public function renderTableValue(RenderTableValueEvent $event): void
    {
        $field = $event->getField();
        if (!$field instanceof TableField) {
            return;
        }

        $layout = $field->getTableLayout();
        $rows = $field->getValue();
        $value = '<table>';
        foreach ($rows as $row) {
            $value .= '<tr>';
            foreach ($layout as $index => $column) {
                $type = $column->type ?? TableField::COLUMN_TYPE_STRING;
                $cellValue = $row[$index] ?? null;

                if (TableField::COLUMN_TYPE_FILE === $type) {
                    $value .= '<td>'.$this->renderFileCellValue($cellValue).'</td>';
                } else {
                    $value .= '<td>'.Html::encode((string) $cellValue).'</td>';
                }
            }
            $value .= '</tr>';
        }
        $value .= '</table>';

        $event->setOutput(Html::decode($value));
    }

    private function renderFileCellValue(mixed $value): string
    {
        $assetIds = [];
        if (\is_array($value)) {
            foreach ($value as $item) {
                if (\is_scalar($item) && is_numeric((string) $item)) {
                    $assetId = (int) $item;
                    if ($assetId > 0) {
                        $assetIds[] = $assetId;
                    }
                }
            }
        } elseif (\is_scalar($value) && is_numeric((string) $value)) {
            $assetId = (int) $value;
            if ($assetId > 0) {
                $assetIds[] = $assetId;
            }
        }

        $assetIds = array_values(array_unique($assetIds));
        if (empty($assetIds)) {
            return '';
        }

        $output = '<div class="inline-chips">';
        foreach ($assetIds as $assetId) {
            /** @var null|Asset $asset */
            $asset = \Craft::$app->assets->getAssetById($assetId);
            if ($asset) {
                $output .= \Craft::$app->view->renderTemplate(
                    'freeform/_components/fields/file.html',
                    ['asset' => $asset]
                );

                continue;
            }

            $output .= Html::tag(
                'span',
                Freeform::t('Missing asset #{id}', ['id' => $assetId]),
                ['class' => 'chip']
            );
        }
        $output .= '</div>';

        return $output;
    }
}

<?php

namespace Solspace\Freeform\Bundles\Fields\Implementations\TableField;

use craft\helpers\Html;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Submissions\RenderTableValueEvent;
use Solspace\Freeform\Fields\Implementations\Pro\TableField;
use yii\base\Event;

class TableFieldBundle
{
    public function __construct()
    {
        Event::on(Submission::class, Submission::EVENT_RENDER_TABLE_VALUE, [$this, 'renderTableValue']);
    }

    public function renderTableValue(RenderTableValueEvent $event): void
    {
        $field = $event->getField();
        if (!$field instanceof TableField) {
            return;
        }

        $rows = $field->getValue();
        $value = '<table>';
        foreach ($rows as $row) {
            $value .= '<tr>';
            foreach ($row as $val) {
                $value .= '<td>'.$val.'</td>';
            }
            $value .= '</tr>';
        }
        $value .= '</table>';

        $event->setOutput(Html::decode($value));
    }
}

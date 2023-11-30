<?php

namespace Solspace\Freeform\Bundles\Fields\Implementations\RatingField;

use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Submissions\RenderTableValueEvent;
use Solspace\Freeform\Fields\Implementations\Pro\RatingField;
use yii\base\Event;

class RatingFieldBundle
{
    public function __construct()
    {
        Event::on(Submission::class, Submission::EVENT_RENDER_TABLE_VALUE, [$this, 'renderTableValue']);
    }

    public function renderTableValue(RenderTableValueEvent $event): void
    {
        $field = $event->getField();
        if (!$field instanceof RatingField) {
            return;
        }

        $event->setOutput(((int) $field->getValue()).'/'.$field->getMaxValue());
    }
}

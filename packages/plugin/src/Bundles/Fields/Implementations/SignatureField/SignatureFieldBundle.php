<?php

namespace Solspace\Freeform\Bundles\Fields\Implementations\SignatureField;

use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Submissions\RenderTableValueEvent;
use Solspace\Freeform\Fields\Implementations\Pro\SignatureField;
use yii\base\Event;

class SignatureFieldBundle
{
    public function __construct()
    {
        Event::on(Submission::class, Submission::EVENT_RENDER_TABLE_VALUE, [$this, 'renderTableValue']);
    }

    public function renderTableValue(RenderTableValueEvent $event): void
    {
        $field = $event->getField();
        if (!$field instanceof SignatureField) {
            return;
        }

        $value = $field->getValue();

        if (!$value) {
            $event->setOutput('');

            return;
        }

        $width = $field->getWidth();
        $height = $field->getHeight();

        $ratio = $width / $height;
        $newWidth = 50 * $ratio;

        $event->setOutput("<img height='50' width='{$newWidth}' src=\"{$value}\" alt=\"signature\" />");
    }
}

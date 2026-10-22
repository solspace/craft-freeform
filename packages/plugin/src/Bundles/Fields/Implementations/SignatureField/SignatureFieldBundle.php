<?php

namespace Solspace\Freeform\Bundles\Fields\Implementations\SignatureField;

use craft\helpers\Html;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Submissions\RenderTableValueEvent;
use Solspace\Freeform\Fields\Implementations\Pro\SignatureField;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Helpers\SignatureHelper;
use yii\base\Event;

class SignatureFieldBundle extends FeatureBundle
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

        $image = SignatureHelper::decodeImage($value);
        if (null === $image) {
            $event->setOutput('');

            return;
        }

        $scale = min(1, 160 / $image['width'], 40 / $image['height']);

        $event->setOutput(Html::img(trim($value), [
            'height' => max(1, (int) round($image['height'] * $scale)),
            'width' => max(1, (int) round($image['width'] * $scale)),
            'alt' => 'signature',
            'data-freeform-signature-preview' => 'thumbnail',
            'loading' => 'lazy',
            'decoding' => 'async',
            'style' => 'display: block; max-width: 160px; max-height: 40px; object-fit: contain; object-position: left center; border: 0; border-radius: 5px; background: transparent;',
        ]));
    }
}

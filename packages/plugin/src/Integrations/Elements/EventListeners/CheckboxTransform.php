<?php

namespace Solspace\Freeform\Integrations\Elements\EventListeners;

use craft\fields\Checkboxes;
use Solspace\Freeform\Events\Integrations\ElementIntegrations\ProcessValueEvent;
use Solspace\Freeform\Fields\Implementations\CheckboxField;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Integrations\Types\Elements\ElementIntegrationInterface;
use yii\base\Event;

class CheckboxTransform extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            ElementIntegrationInterface::class,
            ElementIntegrationInterface::EVENT_PROCESS_VALUE,
            [$this, 'processCheckbox']
        );
    }

    public function processCheckbox(ProcessValueEvent $event): void
    {
        $craftField = $event->getCraftField();
        if (!$craftField instanceof Checkboxes) {
            return;
        }

        $freeformField = $event->getFreeformField();
        if (!$freeformField instanceof CheckboxField) {
            return;
        }

        $isChecked = $freeformField->isChecked();
        $value = $freeformField->getValue();

        $option = reset($craftField->options);
        foreach ($craftField->options as $opt) {
            if ($opt['value'] === $value) {
                $option = $opt;

                break;
            }
        }

        if ($isChecked && $option) {
            $event->setValue([$option['value']]);
        } else {
            $event->setValue([]);
        }
    }
}

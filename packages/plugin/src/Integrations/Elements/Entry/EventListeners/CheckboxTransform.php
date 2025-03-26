<?php

namespace Solspace\Freeform\Integrations\Elements\Entry\EventListeners;

use craft\fields\Checkboxes;
use Solspace\Freeform\Events\Integrations\ElementIntegrations\ProcessValueEvent;
use Solspace\Freeform\Fields\Implementations\CheckboxField;
use Solspace\Freeform\Integrations\Elements\Entry\Entry;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class CheckboxTransform extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            Entry::class,
            Entry::EVENT_PROCESS_VALUE,
            [$this, 'processCheckbox']
        );
    }

    public function processCheckbox(ProcessValueEvent $event): void
    {
        if (!$event->getIntegration() instanceof Entry) {
            return;
        }

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

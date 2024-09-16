<?php

namespace Solspace\Freeform\Bundles\Form\SuccessBehavior;

use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionsGeneratorInterface;
use Solspace\Freeform\Attributes\Property\Property;
use Solspace\Freeform\Form\Settings\Implementations\BehaviorSettings;
use Solspace\Freeform\Freeform;

class SuccessBehaviorOptionsGenerator implements OptionsGeneratorInterface
{
    public function fetchOptions(?Property $property): OptionCollection
    {
        $collection = new OptionCollection();

        $collection->add(
            BehaviorSettings::SUCCESS_BEHAVIOR_RELOAD,
            \Craft::t('freeform', 'Reload form with a Success banner above')
        );

        $this->addSuccessTemplateOption($collection);

        $collection->add(
            BehaviorSettings::SUCCESS_BEHAVIOR_REDIRECT_RETURN_URL,
            \Craft::t('freeform', 'Return the Submitter to the following URL')
        );

        return $collection;
    }

    private function addSuccessTemplateOption(OptionCollection $optionCollection): void
    {
        $successTemplates = Freeform::getInstance()->settings->getSuccessTemplates();
        if (empty($successTemplates)) {
            return;
        }

        $optionCollection->add(
            BehaviorSettings::SUCCESS_BEHAVIOR_LOAD_SUCCESS_TEMPLATE,
            \Craft::t('freeform', 'Replace form with a Success message')
        );
    }
}

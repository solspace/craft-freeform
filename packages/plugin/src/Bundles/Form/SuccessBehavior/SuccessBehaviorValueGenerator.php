<?php

namespace Solspace\Freeform\Bundles\Form\SuccessBehavior;

use Solspace\Freeform\Attributes\Property\ValueGeneratorInterface;
use Solspace\Freeform\Form\Settings\Implementations\BehaviorSettings;
use Solspace\Freeform\Freeform;

class SuccessBehaviorValueGenerator implements ValueGeneratorInterface
{
    public function generateValue(?object $referenceObject): string
    {
        $successTemplates = Freeform::getInstance()->settings->getSuccessTemplates();
        if (empty($successTemplates)) {
            return BehaviorSettings::SUCCESS_BEHAVIOR_RELOAD;
        }

        return BehaviorSettings::SUCCESS_BEHAVIOR_LOAD_SUCCESS_TEMPLATE;
    }
}

<?php

namespace Solspace\Freeform\Bundles\Rules;

use Solspace\Freeform\Events\Forms\AttachFormAttributesEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class RulesBundle extends FeatureBundle
{
    public function __construct(private RuleProvider $ruleProvider)
    {
        Event::on(
            Form::class,
            Form::EVENT_ATTACH_TAG_ATTRIBUTES,
            [$this, 'attachFormAttributes']
        );
    }

    public function attachFormAttributes(AttachFormAttributesEvent $event): void
    {
        $form = $event->getForm();
        $rules = $this->ruleProvider->getFieldRules($form);

        if (empty($rules)) {
            return;
        }

        // IF HAS ACTIVE RULE
        $event->attachAttribute('data-has-rules', true);
    }
}

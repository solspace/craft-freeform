<?php

namespace Solspace\Freeform\Bundles\Rules;

use Solspace\Freeform\Events\Fields\FieldRenderEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class RulesInitialState extends FeatureBundle
{
    public function __construct(
        private RuleValidator $ruleValidator,
    ) {
        Event::on(
            FieldInterface::class,
            FieldInterface::EVENT_RENDER_CONTAINER,
            [$this, 'setInitialState']
        );
    }

    public static function getPriority(): int
    {
        return 1050;
    }

    public function setInitialState(FieldRenderEvent $event): void
    {
        $field = $event->getField();
        $form = $field->getForm();

        $isHidden = $this->ruleValidator->isFieldHidden($form, $field);
        if (!$isHidden) {
            return;
        }

        $field
            ->getAttributes()
            ->getContainer()
            ->set('data-hidden', '')
            ->append('style', 'display: none;')
        ;
    }
}

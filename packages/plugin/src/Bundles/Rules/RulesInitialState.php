<?php

namespace Solspace\Freeform\Bundles\Rules;

use Solspace\Freeform\Events\Fields\CompileButtonAttributesEvent;
use Solspace\Freeform\Events\Fields\CompileFieldAttributesEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Form\Layout\Page\Buttons\PageButtons;
use Solspace\Freeform\Library\Attributes\Attributes;
use Solspace\Freeform\Library\Attributes\FieldAttributesCollection;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class RulesInitialState extends FeatureBundle
{
    public function __construct(
        private RuleValidator $ruleValidator,
    ) {
        Event::on(
            FieldInterface::class,
            FieldInterface::EVENT_COMPILE_ATTRIBUTES,
            [$this, 'setInitialState']
        );

        Event::on(
            PageButtons::class,
            PageButtons::EVENT_COMPILE_ATTRIBUTES,
            [$this, 'setInitialButtonsState']
        );
    }

    public static function getPriority(): int
    {
        return 1050;
    }

    public function setInitialState(CompileFieldAttributesEvent $event): void
    {
        if (FieldAttributesCollection::class !== $event->getClass()) {
            return;
        }

        $field = $event->getField();
        $form = $field->getForm();

        $isHidden = $this->ruleValidator->isFieldHidden($form, $field);
        if (!$isHidden) {
            return;
        }

        $this->setHidden($event->getAttributes()->getContainer());
    }

    public function setInitialButtonsState(CompileButtonAttributesEvent $event): void
    {
        $form = $event->getButtons()->getPage()->getForm();

        $isSubmitHidden = $this->ruleValidator->isButtonHidden($form, 'submit');
        if ($isSubmitHidden) {
            $this->setHidden($event->getAttributes()->getSubmit());
        }

        $isBackHidden = $this->ruleValidator->isButtonHidden($form, 'back');
        if ($isBackHidden) {
            $this->setHidden($event->getAttributes()->getBack());
        }

        $isSaveHidden = $this->ruleValidator->isButtonHidden($form, 'save');
        if ($isSaveHidden) {
            $this->setHidden($event->getAttributes()->getSave());
        }
    }

    private function setHidden(Attributes $attributes): void
    {
        $attributes
            ->set('data-hidden', true)
            ->append('style', 'display: none;')
        ;
    }
}

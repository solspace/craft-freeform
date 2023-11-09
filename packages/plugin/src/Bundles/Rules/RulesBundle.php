<?php

namespace Solspace\Freeform\Bundles\Rules;

use Solspace\Freeform\Events\Fields\ValidateEvent;
use Solspace\Freeform\Events\Forms\AttachFormAttributesEvent;
use Solspace\Freeform\Events\Forms\RenderTagEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Serialization\FreeformSerializer;
use yii\base\Event;

class RulesBundle extends FeatureBundle
{
    public function __construct(
        private RuleProvider $ruleProvider,
        private RuleValidator $ruleValidator,
        private FreeformSerializer $serializer,
    ) {
        Event::on(
            Form::class,
            Form::EVENT_ATTACH_TAG_ATTRIBUTES,
            [$this, 'attachFormAttributes']
        );

        Event::on(
            Form::class,
            Form::EVENT_RENDER_BEFORE_CLOSING_TAG,
            [$this, 'attachRulesJSON']
        );

        Event::on(
            FieldInterface::class,
            FieldInterface::EVENT_VALIDATE,
            [$this, 'validateField']
        );
    }

    public static function getPriority(): int
    {
        return 50;
    }

    public function attachFormAttributes(AttachFormAttributesEvent $event): void
    {
        $form = $event->getForm();
        $rules = $this->ruleProvider->getFieldRules($form);

        if (empty($rules)) {
            return;
        }

        $form->getAttributes()->set('data-has-rules');
    }

    public function attachRulesJSON(RenderTagEvent $event): void
    {
        $rules = $this->ruleProvider->getFieldRules($event->getForm());
        $serialized = $this->serializer->serialize($rules, 'json', [
            'groups' => 'front-end',
        ]);

        $event->addChunk(
            '<script type="application/json" data-rules-json>'
            .$serialized
            .'</script>'
        );
    }

    public function validateField(ValidateEvent $event): void
    {
        $form = $event->getForm();
        $field = $event->getField();

        $isHidden = $this->ruleValidator->isFieldHidden($form, $field);
        if (true === $isHidden) {
            $event->isValid = false;
        }
    }
}

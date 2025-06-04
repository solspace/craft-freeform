<?php

namespace Solspace\Freeform\Bundles\Notifications\TwigVariables;

use Solspace\Freeform\Bundles\Rules\RuleValidator;
use Solspace\Freeform\Events\Mailer\RenderEmailEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Collections\FieldCollection;
use Solspace\Freeform\Services\MailerService;
use Twig\Markup;
use yii\base\Event;

class NotificationLoopVariables extends FeatureBundle
{
    public function __construct(
        private RuleValidator $validator,
    ) {
        Event::on(MailerService::class, MailerService::EVENT_BEFORE_RENDER, [$this, 'attachFieldValues']);
        Event::on(MailerService::class, MailerService::EVENT_BEFORE_RENDER, [$this, 'attachOnlyFilledFieldValues']);
        Event::on(MailerService::class, MailerService::EVENT_BEFORE_RENDER, [$this, 'attachVisible']);
    }

    public function attachFieldValues(RenderEmailEvent $event): void
    {
        $fields = $event->getForm()->getLayout()->getFields();
        if (!\count($fields)) {
            return;
        }

        $this->renderMarkup($fields, $event, 'labels');
    }

    public function attachOnlyFilledFieldValues(RenderEmailEvent $event): void
    {
        $fields = $event
            ->getForm()
            ->getLayout()
            ->getFields()
            ->getFiltered(fn (FieldInterface $field) => !empty($field->getValue()))
        ;

        $this->renderMarkup($fields, $event, 'labelsWithValues');
    }

    public function attachVisible(RenderEmailEvent $event): void
    {
        $form = $event->getForm();
        $fields = $form
            ->getLayout()
            ->getFields()
            ->getFiltered(
                fn (FieldInterface $field) => !$this->validator->isFieldHidden($form, $field)
            )
        ;

        $this->renderMarkup($fields, $event, 'visible');
    }

    private function renderMarkup(
        FieldCollection $fields,
        RenderEmailEvent $event,
        string $variableName,
    ): void {
        if (!\count($fields)) {
            return;
        }

        $markup = '<ul>';
        foreach ($fields as $field) {
            $markup .= '<li>';
            $markup .= $field->getLabel().': ';
            $markup .= $field->getValueAsString();
            $markup .= '</li>';
        }
        $markup .= '</ul>';

        $loop = $event->getTwigVariable('loop');
        $loop['field'][$variableName] = new Markup($markup, 'UTF-8');

        $event->setTwigVariable('loop', $loop);
    }
}

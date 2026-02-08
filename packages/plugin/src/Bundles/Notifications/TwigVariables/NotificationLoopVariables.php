<?php

namespace Solspace\Freeform\Bundles\Notifications\TwigVariables;

use Solspace\Freeform\Bundles\Rules\RuleValidator;
use Solspace\Freeform\Events\Mailer\RenderEmailEvent;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Interfaces\NoEmailPresenceInterface;
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
        Event::on(MailerService::class, MailerService::EVENT_BEFORE_RENDER, [$this, 'attachAll']);
        Event::on(MailerService::class, MailerService::EVENT_BEFORE_RENDER, [$this, 'attachWithHtml']);
        Event::on(MailerService::class, MailerService::EVENT_BEFORE_RENDER, [$this, 'attachNonEmpty']);
        Event::on(MailerService::class, MailerService::EVENT_BEFORE_RENDER, [$this, 'attachWithRules']);
    }

    public function attachAll(RenderEmailEvent $event): void
    {
        $fields = $event
            ->getForm()
            ->getLayout()
            ->getFields()
            ->getFiltered(
                static fn (FieldInterface $field) => !$field instanceof NoEmailPresenceInterface
            )
            ->getFiltered(
                fn (FieldInterface $field) => !$this->validator->isFieldHidden($event->getForm(), $field)
            )
        ;

        if (!\count($fields)) {
            return;
        }

        $this->renderMarkup($fields, $event, 'all');
    }

    public function attachWithHtml(RenderEmailEvent $event): void
    {
        $fields = $event->getForm()->getLayout()->getFields();
        if (!\count($fields)) {
            return;
        }

        $this->renderMarkup($fields, $event, 'withHtml');
    }

    public function attachNonEmpty(RenderEmailEvent $event): void
    {
        $fields = $event
            ->getForm()
            ->getLayout()
            ->getFields()
            ->getFiltered(
                static fn (FieldInterface $field) => !$field instanceof NoEmailPresenceInterface
            )
            ->getFiltered(
                static fn (FieldInterface $field) => !empty($field->getValue())
            )
        ;

        $this->renderMarkup($fields, $event, 'nonEmpty');
    }

    public function attachWithRules(RenderEmailEvent $event): void
    {
        $form = $event->getForm();
        $fields = $form
            ->getLayout()
            ->getFields()
            ->getFiltered(
                static fn (FieldInterface $field) => !$field instanceof NoEmailPresenceInterface
            )
            ->getFiltered(
                fn (FieldInterface $field) => !$this->validator->isFieldHidden($form, $field)
            )
        ;

        $this->renderMarkup($fields, $event, 'withRules');
    }

    private function renderMarkup(
        FieldCollection $fields,
        RenderEmailEvent $event,
        string $variableName,
    ): void {
        $markup = '';

        if (\count($fields)) {
            $markup .= '<ul>';
            foreach ($fields as $field) {
                $markup .= '<li>';
                $markup .= $field->getLabel().': ';

                $value = $field->getReadableOutputValue();
                if ($value instanceof Markup) {
                    $markup .= $value;
                } else {
                    $markup .= htmlspecialchars((string) $value, \ENT_QUOTES | \ENT_SUBSTITUTE, 'UTF-8');
                }
                $markup .= '</li>';
            }
            $markup .= '</ul>';
        }

        $loops = $event->getTwigVariable('loops') ?? [];
        $loops['fields'][$variableName] = new Markup($markup, 'UTF-8');

        $event->setTwigVariable('loops', $loops);
    }
}

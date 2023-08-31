<?php

namespace Solspace\Freeform\Bundles\Form\SubmitButtons;

use Solspace\Freeform\Events\Forms\RenderTagEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class SubmitButtons extends FeatureBundle
{
    public function __construct()
    {
        Event::on(
            Form::class,
            Form::EVENT_RENDER_BEFORE_CLOSING_TAG,
            [$this, 'add']
        );
    }

    public function add(RenderTagEvent $event): void
    {
        $form = $event->getForm();
        $page = $form->getCurrentPage();

        $buttons = $page->getButtons();
        $layout = $buttons->getParsedLayout();

        $attributes = $buttons->getAttributes()->clone();

        $nestedButtonAttributes = $form->getAttributes()->getNested('buttons');
        if ($nestedButtonAttributes) {
            $attributes->merge($nestedButtonAttributes);
        }

        $event->addChunk('<div'.$attributes->getContainer().'>');
        foreach ($layout as $group) {
            $event->addChunk('<div'.$attributes->getColumn().'>');

            foreach ($group as $key => $button) {
                if (!\in_array($key, ['save', 'submit', 'back'], true)) {
                    continue;
                }

                if (0 === $page->getIndex() && 'back' === $key) {
                    continue;
                }

                $buttonAttributes = match ($key) {
                    'save' => $attributes->getSave(),
                    'submit' => $attributes->getSubmit(),
                    'back' => $attributes->getBack(),
                };

                $event->addChunk($button->render($buttonAttributes));
            }

            $event->addChunk('</div>');
        }
        $event->addChunk('</div>');
    }
}

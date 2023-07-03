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

        $event->addChunk('<div'.$buttons->getAttributes()->getContainer().'>');
        foreach ($layout as $group) {
            $event->addChunk('<div'.$buttons->getAttributes()->getColumn().'>');

            foreach ($group as $key => $button) {
                if (!\in_array($key, ['save', 'submit', 'back'], true)) {
                    continue;
                }

                if (0 === $page->getIndex() && 'back' === $key) {
                    continue;
                }

                $attributes = match ($key) {
                    'save' => $buttons->getAttributes()->getSave(),
                    'submit' => $buttons->getAttributes()->getSubmit(),
                    'back' => $buttons->getAttributes()->getBack(),
                };

                $event->addChunk($button->render($attributes));
            }

            $event->addChunk('</div>');
        }
        $event->addChunk('</div>');
    }
}

<?php

namespace Solspace\Freeform\Bundles\Form\SubmitButtons;

use craft\helpers\ArrayHelper;
use Solspace\Freeform\Events\Forms\RenderTagEvent;
use Solspace\Freeform\Events\Forms\SetPropertiesEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Form\Layout\Page\Buttons\ButtonAttributesCollection;
use Solspace\Freeform\Form\Layout\Page\Buttons\PageButtons;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Processors\PageButtonRenderOptionProcessor;
use yii\base\Event;

class SubmitButtons extends FeatureBundle
{
    public function __construct(private PageButtonRenderOptionProcessor $processor)
    {
        Event::on(
            Form::class,
            Form::EVENT_SET_PROPERTIES,
            [$this, 'processOptions']
        );

        Event::on(
            Form::class,
            Form::EVENT_RENDER_BEFORE_CLOSING_TAG,
            [$this, 'renderButtons']
        );
    }

    public function processOptions(SetPropertiesEvent $event): void
    {
        $form = $event->getForm();
        $properties = $event->getProperties();

        $buttonProperties = $form->getProperties()->get('buttons', []);

        if (!isset($properties['buttons'])) {
            return;
        }

        $buttonProperties = ArrayHelper::merge($buttonProperties, $properties['buttons']);
        $form->getProperties()->merge(['buttons' => $buttonProperties]);

        unset($properties['buttons']);
        $event->setProperties($properties);
    }

    public function renderButtons(RenderTagEvent $event): void
    {
        $form = $event->getForm();
        $page = $form->getCurrentPage();

        $buttons = $page->getButtons();

        $renderOptions = $form->getProperties()->get('buttons', []);
        $this->processor->process($renderOptions, $buttons);

        $attributes = $buttons->getAttributes()->clone();
        $layout = $buttons->getParsedLayout();

        $containerAttributes = $attributes
            ->getContainer()
            ->clone()
            ->replace('data-freeform-controls', true)
        ;

        $event->addChunk('<div'.$containerAttributes.'>');
        foreach ($layout as $group) {
            $event->addChunk('<div'.$attributes->getColumn().'>');

            foreach ($group as $button) {
                if (!\in_array($button, ['save', 'submit', 'back'], true)) {
                    continue;
                }

                if (0 === $page->getIndex() && 'back' === $button) {
                    continue;
                }

                $event->addChunk('<div'.$attributes->getButtonWrapper().'>');

                match ($button) {
                    'submit' => $this->renderSubmitButton($event, $buttons, $attributes),
                    'back' => $this->renderBackButton($event, $buttons, $attributes),
                    'save' => $this->renderSaveButton($event, $buttons, $attributes),
                };

                $event->addChunk('</div>');
            }

            $event->addChunk('</div>');
        }
        $event->addChunk('</div>');
    }

    private function renderSubmitButton(
        RenderTagEvent $event,
        PageButtons $buttons,
        ButtonAttributesCollection $attributes
    ): void {
        $attrs = $attributes
            ->getSubmit()
            ->clone()
            ->replace('data-freeform-action', 'submit')
            ->replace('name', PageButtons::INPUT_NAME_SUBMIT)
            ->replace('type', 'submit')
        ;

        $event->addChunk(
            '<button '.$attrs.'>'.htmlspecialchars($buttons->getSubmitLabel()).'</button>'
        );
    }

    private function renderBackButton(
        RenderTagEvent $event,
        PageButtons $buttons,
        ButtonAttributesCollection $attributes
    ): void {
        if (!$buttons->isBack()) {
            return;
        }

        $attrs = $attributes
            ->getBack()
            ->replace('data-freeform-action', 'back')
            ->replace('name', PageButtons::INPUT_NAME_PREVIOUS_PAGE)
            ->replace('type', 'submit')
        ;

        $event->addChunk(
            '<button '.$attrs.'>'.htmlspecialchars($buttons->getBackLabel()).'</button>'
        );
    }

    private function renderSaveButton(
        RenderTagEvent $event,
        PageButtons $buttons,
        ButtonAttributesCollection $attributes
    ): void {
        if (!$buttons->isSave()) {
            return;
        }

        $attrs = $attributes
            ->getSave()
            ->clone()
            ->replace('data-freeform-action', 'save')
            ->replace('type', 'submit')
        ;

        $event->addChunk(
            '<button '.$attrs.'>'.htmlspecialchars($buttons->getSaveLabel()).'</button>'
        );
    }
}

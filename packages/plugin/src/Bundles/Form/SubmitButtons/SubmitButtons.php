<?php

namespace Solspace\Freeform\Bundles\Form\SubmitButtons;

use craft\helpers\ArrayHelper;
use Solspace\Freeform\Events\Forms\RenderTagEvent;
use Solspace\Freeform\Events\Forms\SetPropertiesEvent;
use Solspace\Freeform\Form\Form;
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
        if (!$event->isGenerateTag()) {
            return;
        }

        $form = $event->getForm();
        if ($form->isDisabled()->submitButtons) {
            return;
        }

        $page = $form->getCurrentPage();

        $buttons = $page->getButtons();
        $attributes = $buttons->getAttributes()->clone();

        $renderOptions = $form->getProperties()->get('buttons', []);
        $this->processor->process($renderOptions, $buttons, $attributes);

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

                if ('back' === $button && !$buttons->isBack()) {
                    continue;
                }

                if ('save' === $button && !$buttons->isSave()) {
                    continue;
                }

                $event->addChunk('<div'.$attributes->getButtonWrapper().'>');

                match ($button) {
                    'submit' => $event->addChunk($buttons->renderSubmit()),
                    'back' => $event->addChunk($buttons->renderBack()),
                    'save' => $event->addChunk($buttons->renderSave()),
                };

                $event->addChunk('</div>');
            }

            $event->addChunk('</div>');
        }
        $event->addChunk('</div>');
    }
}

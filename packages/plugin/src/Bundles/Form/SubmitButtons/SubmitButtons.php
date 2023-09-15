<?php

namespace Solspace\Freeform\Bundles\Form\SubmitButtons;

use craft\helpers\ArrayHelper;
use Solspace\Freeform\Events\Forms\RenderTagEvent;
use Solspace\Freeform\Events\Forms\SetPropertiesEvent;
use Solspace\Freeform\Form\Form;
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

            foreach ($group as $key => $button) {
                if (!\in_array($key, ['save', 'submit', 'back'], true)) {
                    continue;
                }

                if (0 === $page->getIndex() && 'back' === $key) {
                    continue;
                }

                $buttonAttributes = match ($key) {
                    'save' => $attributes
                        ->getSave()
                        ->clone()
                        ->replace('data-freeform-action', 'save')
                        ->replace('type', 'submit')
                    ,
                    'submit' => $attributes
                        ->getSubmit()
                        ->clone()
                        ->replace('data-freeform-action', 'submit')
                        ->replace('name', PageButtons::INPUT_NAME_SUBMIT)
                        ->replace('type', 'submit')
                    ,
                    'back' => $attributes
                        ->getBack()
                        ->replace('data-freeform-action', 'back')
                        ->replace('name', PageButtons::INPUT_NAME_PREVIOUS_PAGE)
                        ->replace('type', 'submit')
                    ,
                };

                $event->addChunk('<div'.$attributes->getButtonWrapper().'>');

                $event->addChunk($button->render($buttonAttributes));

                $event->addChunk('</div>');
            }

            $event->addChunk('</div>');
        }
        $event->addChunk('</div>');
    }
}

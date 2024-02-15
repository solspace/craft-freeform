<?php

namespace Solspace\Freeform\Bundles\Form\SubmitButtons;

use Solspace\Freeform\Events\Fields\CompileButtonAttributesEvent;
use Solspace\Freeform\Events\Forms\RenderTagEvent;
use Solspace\Freeform\Events\Forms\SetPropertiesEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Form\Layout\Page\Buttons\PageButtons;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Processors\PageButtonRenderOptionProcessor;
use yii\base\Event;

class SubmitButtons extends FeatureBundle
{
    public const KEY_FORM_BUTTON_PROPERTIES = 'buttons';
    public const KEY_FORM_BUTTON_PROPERTY_STACK = 'buttonPropertyStack';

    public function __construct(private PageButtonRenderOptionProcessor $processor)
    {
        Event::on(
            Form::class,
            Form::EVENT_SET_PROPERTIES,
            [$this, 'processOptions']
        );

        Event::on(
            PageButtons::class,
            PageButtons::EVENT_COMPILE_ATTRIBUTES,
            [$this, 'compileAttributes']
        );

        Event::on(
            Form::class,
            Form::EVENT_RENDER_BEFORE_CLOSING_TAG,
            [$this, 'renderButtons']
        );
    }

    public function processOptions(SetPropertiesEvent $event): void
    {
        $properties = $event->getProperties();
        if (!isset($properties[self::KEY_FORM_BUTTON_PROPERTIES])) {
            return;
        }

        $props = $properties[self::KEY_FORM_BUTTON_PROPERTIES];

        // Get the current property stack and add to the stack
        $form = $event->getForm();
        $stack = $form->getProperties()->get(self::KEY_FORM_BUTTON_PROPERTY_STACK, []);
        foreach ($stack as $stackItem) {
            if ($stackItem === $props) {
                return;
            }
        }

        $stack[] = $props;
        $form->getProperties()->set(self::KEY_FORM_BUTTON_PROPERTY_STACK, $stack);

        // Remove from current properties
        unset($properties[self::KEY_FORM_BUTTON_PROPERTIES]);
        $event->setProperties($properties);
    }

    public function compileAttributes(CompileButtonAttributesEvent $event): void
    {
        $buttons = $event->sender;
        if (!$buttons instanceof PageButtons) {
            return;
        }

        $form = $buttons->getPage()->getForm();

        $bag = $form->getProperties();
        $stack = $bag->get(self::KEY_FORM_BUTTON_PROPERTY_STACK) ?? [];
        if (!$stack) {
            return;
        }

        $attributes = $event->getAttributes();
        $processor = new PageButtonRenderOptionProcessor();

        $stack = array_reverse($stack);
        foreach ($stack as $item) {
            $processor->process($item, $buttons, $attributes);
        }

        $event->setAttributes($attributes);
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

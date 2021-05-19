<?php

namespace Solspace\Freeform\Bundles\Form\Context\Pages;

use Solspace\Freeform\Events\Forms\HandleRequestEvent;
use Solspace\Freeform\Events\Forms\ResetEvent;
use Solspace\Freeform\Events\Forms\ValidationEvent;
use Solspace\Freeform\Fields\SubmitField;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\Form;
use yii\base\Event;

class PageContext
{
    public function __construct()
    {
        Event::on(Form::class, Form::EVENT_BEFORE_VALIDATE, [$this, 'onValidate']);
        Event::on(Form::class, Form::EVENT_BEFORE_HANDLE_REQUEST, [$this, 'handleNavigateBack']);
        Event::on(Form::class, Form::EVENT_AFTER_HANDLE_REQUEST, [$this, 'handleNavigateForward']);
        Event::on(Form::class, Form::EVENT_BEFORE_RESET, [$this, 'handleReset']);
    }

    public function onValidate(ValidationEvent $event)
    {
        $form = $event->getForm();
        if (!$form->isPagePosted()) {
            $event->isValid = false;
        }
    }

    public function handleNavigateBack(HandleRequestEvent $event)
    {
        $form = $event->getForm();
        $bag = $form->getPropertyBag();

        if (!$form->isPagePosted()) {
            return;
        }

        $shouldWalkBack = null !== \Craft::$app->request->post(SubmitField::PREVIOUS_PAGE_INPUT_NAME);
        if ($shouldWalkBack) {
            $pageHistory = $bag->get(Form::PROPERTY_PAGE_HISTORY, []);
            $index = array_pop($pageHistory) ?? 0;

            $bag->set(Form::PROPERTY_PAGE_INDEX, $index);
            $bag->set(Form::PROPERTY_PAGE_HISTORY, $pageHistory);
            $form->setPagePosted(false);
        }
    }

    public function handleNavigateForward(HandleRequestEvent $event)
    {
        $form = $event->getForm();
        $bag = $form->getPropertyBag();

        $pageIndex = $bag->get(Form::PROPERTY_PAGE_INDEX, 0);
        $pageHistory = $bag->get(Form::PROPERTY_PAGE_HISTORY, []);

        if (!$form->isPagePosted() || !$form->isValid()) {
            return;
        }

        $pageJumpIndex = Freeform::getInstance()->forms->onBeforePageJump($form);
        if (null !== $pageJumpIndex) {
            $pageHistory[] = $pageIndex;
            $pageIndex = $pageJumpIndex;

            $bag->set(Form::PROPERTY_PAGE_INDEX, $pageIndex);
            $bag->set(Form::PROPERTY_PAGE_HISTORY, $pageHistory);

            return;
        }

        $totalPages = \count($form->getPages());
        if ($pageIndex < $totalPages - 1) {
            $pageHistory[] = $pageIndex++;

            $bag->set(Form::PROPERTY_PAGE_INDEX, $pageIndex);
            $bag->set(Form::PROPERTY_PAGE_HISTORY, $pageHistory);

            return;
        }

        if ($pageIndex === $totalPages - 1) {
            $form->setFinished(true);

            return;
        }
    }

    public function handleReset(ResetEvent $event)
    {
        $form = $event->getForm();
        $bag = $form->getPropertyBag();

        $bag->set(Form::PROPERTY_PAGE_INDEX, 0);
        $bag->set(Form::PROPERTY_PAGE_HISTORY, []);
    }
}

<?php

namespace Solspace\Freeform\Bundles\Form\Context\Pages;

use Solspace\Freeform\Events\Forms\HandleRequestEvent;
use Solspace\Freeform\Events\Forms\PageJumpEvent;
use Solspace\Freeform\Events\Forms\ResetEvent;
use Solspace\Freeform\Events\Forms\ValidationEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Form\Layout\Page\Buttons\PageButtons;
use Solspace\Freeform\Library\Helpers\RequestHelper;
use yii\base\Event;

class PageContext
{
    public const EVENT_PAGE_JUMP = 'onPageJump';

    public function __construct()
    {
        Event::on(Form::class, Form::EVENT_BEFORE_VALIDATE, [$this, 'onValidate']);
        Event::on(Form::class, Form::EVENT_BEFORE_HANDLE_REQUEST, [$this, 'handleNavigateBack']);
        Event::on(Form::class, Form::EVENT_AFTER_HANDLE_REQUEST, [$this, 'handleNavigateForward']);
        Event::on(Form::class, Form::EVENT_BEFORE_RESET, [$this, 'handleReset']);
    }

    public function onValidate(ValidationEvent $event): void
    {
        $form = $event->getForm();
        if (!$form->isPagePosted()) {
            $event->isValid = false;
        }
    }

    public function handleNavigateBack(HandleRequestEvent $event): void
    {
        $form = $event->getForm();
        $bag = $form->getProperties();

        if ($form->isGraphQLPosted()) {
            return;
        }

        if (!$form->isPagePosted()) {
            return;
        }

        $shouldWalkBack = null !== RequestHelper::post(PageButtons::INPUT_NAME_PREVIOUS_PAGE);
        if ($shouldWalkBack) {
            $pageHistory = $bag->get(Form::PROPERTY_PAGE_HISTORY, []);
            $index = array_pop($pageHistory) ?? 0;

            $bag->set(Form::PROPERTY_PAGE_INDEX, $index);
            $bag->set(Form::PROPERTY_PAGE_HISTORY, $pageHistory);
            $form->setPagePosted(false);
            $form->setNavigatingBack(true);
        }
    }

    public function handleNavigateForward(HandleRequestEvent $event): void
    {
        $form = $event->getForm();
        $bag = $form->getProperties();

        $pageIndex = $bag->get(Form::PROPERTY_PAGE_INDEX, 0);
        $pageHistory = $bag->get(Form::PROPERTY_PAGE_HISTORY, []);

        if (!$form->isPagePosted() || !$form->isValid()) {
            return;
        }

        $event = new PageJumpEvent($form);
        Event::trigger($this, self::EVENT_PAGE_JUMP, $event);
        $pageJumpIndex = $event->getJumpToIndex();
        if (-999 === $pageJumpIndex) {
            $form->setFinished(true);

            return;
        }

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

    public function handleReset(ResetEvent $event): void
    {
        $form = $event->getForm();
        $bag = $form->getProperties();

        $bag->set(Form::PROPERTY_PAGE_INDEX, 0);
        $bag->set(Form::PROPERTY_PAGE_HISTORY, []);
    }
}

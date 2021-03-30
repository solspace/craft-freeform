<?php

namespace Solspace\Freeform\Bundles\Form\Context\Pages;

use Solspace\Freeform\Bundles\Form\Context\Session\SessionContext;
use Solspace\Freeform\Events\Forms\SubmitEvent;
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
        Event::on(Form::class, Form::EVENT_SUBMIT, [$this, 'pageNavigation']);
    }

    public function onValidate(ValidationEvent $event)
    {
        $form = $event->getForm();

        $isPagePosted = SessionContext::isPagePosted($form, $form->getCurrentPage());
        if (!$isPagePosted) {
            $event->isValid = false;

            return;
        }

        $shouldWalkBack = null !== \Craft::$app->request->post(SubmitField::PREVIOUS_PAGE_INPUT_NAME);
        if ($shouldWalkBack) {
            $event->setValidationOverride(true);

            return;
        }
    }

    public function pageNavigation(SubmitEvent $event)
    {
        $form = $event->getForm();
        $bag = $form->getPropertyBag();

        $pageIndex = $bag->get(Form::PROPERTY_PAGE_INDEX, 0);
        $pageHistory = $bag->get(Form::PROPERTY_PAGE_HISTORY, []);

        $isPagePosted = SessionContext::isPagePosted($form, $form->getCurrentPage());
        if (!$isPagePosted) {
            $event->isValid = false;

            return;
        }

        $shouldWalkBack = null !== \Craft::$app->request->post(SubmitField::PREVIOUS_PAGE_INPUT_NAME);
        if ($shouldWalkBack) {
            $index = array_pop($pageHistory) ?? 0;

            $bag->set(Form::PROPERTY_PAGE_INDEX, $index);
            $bag->set(Form::PROPERTY_PAGE_HISTORY, $pageHistory);

            $event->isValid = false;

            return;
        }

        $pageJumpIndex = Freeform::getInstance()->forms->onBeforePageJump($form);
        if (null !== $pageJumpIndex) {
            $pageHistory[] = $pageIndex;
            $pageIndex = $pageJumpIndex;

            $bag->set(Form::PROPERTY_PAGE_INDEX, $pageIndex);
            $bag->set(Form::PROPERTY_PAGE_HISTORY, $pageHistory);

            $event->isValid = false;

            return;
        }

        $totalPages = \count($form->getPages());
        if ($pageIndex < $totalPages - 1) {
            $pageHistory[] = $pageIndex++;

            $bag->set(Form::PROPERTY_PAGE_INDEX, $pageIndex);
            $bag->set(Form::PROPERTY_PAGE_HISTORY, $pageHistory);

            $event->isValid = false;

            return;
        }
    }
}

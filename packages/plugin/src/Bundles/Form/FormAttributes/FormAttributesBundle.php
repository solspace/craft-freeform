<?php

namespace Solspace\Freeform\Bundles\Form\FormAttributes;

use Solspace\Freeform\Events\Forms\AttachFormAttributesEvent;
use Solspace\Freeform\Events\Forms\SetPropertiesEvent;
use Solspace\Freeform\Fields\Interfaces\FileUploadInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class FormAttributesBundle extends FeatureBundle
{
    public function __construct()
    {
        Event::on(Form::class, Form::EVENT_SET_PROPERTIES, [$this, 'separateAttributesFromProperties']);
        Event::on(Form::class, Form::EVENT_ATTACH_TAG_ATTRIBUTES, [$this, 'setConditionalAttributes']);
    }

    public function separateAttributesFromProperties(SetPropertiesEvent $event): void
    {
        $form = $event->getForm();
        $properties = $event->getProperties();

        if (!isset($properties['attributes'])) {
            return;
        }

        $attributes = $properties['attributes'];
        unset($properties['attributes']);

        $event->setProperties($properties);

        if (!\is_array($attributes)) {
            return;
        }

        $rowAttributes = $attributes['row'] ?? [];
        $errorAttributes = $attributes['error'] ?? [];
        unset($attributes['row'], $attributes['error']);

        foreach ($attributes as $key => $value) {
            $form->getAttributes()->replace($key, $value);
        }

        foreach ($rowAttributes as $key => $value) {
            $form->getAttributes()->getRow()->replace($key, $value);
        }

        foreach ($errorAttributes as $key => $value) {
            $form->getAttributes()->getErrors()->replace($key, $value);
        }

        if (null === $form->getAttributes()->get('method')) {
            $form->getAttributes()->set('method', 'post');
        }
    }

    public function setConditionalAttributes(AttachFormAttributesEvent $event): void
    {
        $formService = Freeform::getInstance()->forms;

        $form = $event->getForm();
        $attributes = $form->getAttributes();

        $behaviorSettings = $form->getSettings()->getBehavior();

        $attributes->set('data-freeform', true);
        $attributes->set('data-disable-reset', $form->isAjaxResetDisabled());
        $attributes->set('data-id', $form->getAnchor());
        $attributes->set('data-handle', $form->getHandle());
        $attributes->set('data-ajax', $form->isAjaxEnabled());
        $attributes->set('data-disable-submit', $formService->isFormSubmitDisable());
        $attributes->set('data-show-spinner', $behaviorSettings->showSpinner);

        if ($form->getLayout()->getFields()->hasFieldType(FileUploadInterface::class)) {
            $attributes->set('enctype', 'multipart/form-data');
        }

        $autoScroll = Freeform::getInstance()->settings->getSettingsModel()->autoScroll;
        if ($autoScroll) {
            $attributes->set('data-auto-scroll', $autoScroll);
        }

        if ($formService->shouldScrollToAnchor($form)) {
            $attributes->set('data-scroll-to-anchor', true);
        }

        if ($behaviorSettings->showLoadingText) {
            $attributes->set('data-show-loading-text', true);
            $attributes->set('data-loading-text', $behaviorSettings->loadingText);
        }

        if ($behaviorSettings->successMessage) {
            $attributes->set(
                'data-success-message',
                \Craft::t('app', $behaviorSettings->successMessage)
            );
        }

        if ($behaviorSettings->errorMessage) {
            $attributes->set(
                'data-error-message',
                \Craft::t('app', $behaviorSettings->errorMessage)
            );
        }
    }
}

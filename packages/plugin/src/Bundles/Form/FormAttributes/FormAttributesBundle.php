<?php

namespace Solspace\Freeform\Bundles\Form\FormAttributes;

use Solspace\Freeform\Events\Forms\AttachFormAttributesEvent;
use Solspace\Freeform\Events\Forms\SetPropertiesEvent;
use Solspace\Freeform\Fields\Interfaces\FileUploadInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bags\BagInterface;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use yii\base\Event;

class FormAttributesBundle extends FeatureBundle
{
    private static $attributeKeys = [
        'id',
        'name',
        'method',
        'class',
        'action',
    ];

    public function __construct()
    {
        Event::on(Form::class, Form::EVENT_SET_PROPERTIES, [$this, 'separateAttributesFromProperties']);
        Event::on(Form::class, Form::EVENT_SET_PROPERTIES, [$this, 'extractAttributesFromProperties']);
        Event::on(Form::class, Form::EVENT_ATTACH_TAG_ATTRIBUTES, [$this, 'setConditionalAttributes']);
    }

    public function separateAttributesFromProperties(SetPropertiesEvent $event)
    {
        $form = $event->getForm();
        $attributes = $event->getAttributes();

        $attributesForAttributeBag = [];
        foreach ($attributes as $key => $value) {
            if (\in_array($key, self::$attributeKeys, true)) {
                $attributesForAttributeBag[$key] = $value;
            }
        }

        $form->getAttributeBag()->merge($attributesForAttributeBag);

        if (null === $form->getAttributeBag()->get('method')) {
            $form->getAttributeBag()->set('method', 'post');
        }
    }

    public function extractAttributesFromProperties(SetPropertiesEvent $event)
    {
        $form = $event->getForm();
        $bag = $form->getPropertyBag();
        $attributeBag = $form->getAttributeBag();

        $attributeBag->merge($bag->get('formAttributes', []));
        $attributeBag->merge($bag->get('attributes', []));

        $bag->remove('formAttributes');
        $bag->remove('attributes');
    }

    public function setConditionalAttributes(AttachFormAttributesEvent $event)
    {
        $formService = Freeform::getInstance()->forms;

        $form = $event->getForm();
        $bag = $form->getAttributeBag();

        $behaviorSettings = $form->getSettings()->getBehavior();

        $this->attachConditionally($event, $bag, 'id');
        $this->attachConditionally($event, $bag, 'name');
        $this->attachConditionally($event, $bag, 'method');
        $this->attachConditionally($event, $bag, 'class');
        $this->attachConditionally($event, $bag, 'action');

        $event->attachAttribute('data-freeform', true);
        $event->attachAttribute('data-disable-reset', $form->isAjaxResetDisabled());
        $event->attachAttribute('data-id', $form->getAnchor());
        $event->attachAttribute('data-handle', $form->getHandle());
        $event->attachAttribute('data-ajax', $form->isAjaxEnabled());
        $event->attachAttribute('data-disable-submit', $formService->isFormSubmitDisable());
        $event->attachAttribute('data-show-spinner', $behaviorSettings->showSpinner);

        if ($form->getLayout()->getFields()->hasFieldType(FileUploadInterface::class)) {
            $event->attachAttribute('enctype', 'multipart/form-data');
        }

        $autoScroll = Freeform::getInstance()->settings->getSettingsModel()->autoScroll;
        if ($autoScroll) {
            $event->attachAttribute('data-auto-scroll', $autoScroll);
        }

        if ($formService->shouldScrollToAnchor($form)) {
            $event->attachAttribute('data-scroll-to-anchor', $form->getAnchor());
        }

        if ($behaviorSettings->showLoadingText) {
            $event->attachAttribute('data-show-loading-text', true);
            $event->attachAttribute('data-loading-text', $behaviorSettings->loadingText);
        }

        if ($behaviorSettings->successMessage) {
            $event->attachAttribute(
                'data-success-message',
                \Craft::t('app', $behaviorSettings->successMessage)
            );
        }

        if ($behaviorSettings->errorMessage) {
            $event->attachAttribute(
                'data-error-message',
                \Craft::t('app', $behaviorSettings->errorMessage)
            );
        }
    }

    private function attachConditionally(AttachFormAttributesEvent $event, BagInterface $bag, string $key)
    {
        if ($bag->get($key)) {
            $event->attachAttribute($key, $bag->get($key));
        }
    }
}

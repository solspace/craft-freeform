<?php

namespace Solspace\Freeform\Bundles\Form\FormAttributes;

use Solspace\Freeform\Events\Forms\AttachFormAttributesEvent;
use Solspace\Freeform\Events\Forms\UpdateAttributesEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Bags\BagInterface;
use Solspace\Freeform\Library\Bundles\BundleInterface;
use Solspace\Freeform\Library\Composer\Components\Form;
use yii\base\Event;

class FormAttributesBundle implements BundleInterface
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
        Event::on(Form::class, Form::EVENT_UPDATE_ATTRIBUTES, [$this, 'prepareAttributes']);
        Event::on(Form::class, Form::EVENT_ATTACH_TAG_ATTRIBUTES, [$this, 'setConditionalAttributes']);
        Event::on(Form::class, Form::EVENT_UPDATE_ATTRIBUTES, [$this, 'separateAttributesFromProperties']);
    }

    public function separateAttributesFromProperties(UpdateAttributesEvent $event)
    {
        $form = $event->getForm();
        $attributes = $event->getAttributes();

        $attributesForAttributeBag = [];
        foreach ($attributes as $key => $value) {
            if (\in_array($key, self::$attributeKeys, true)) {
                $attributesForAttributeBag[$key] = $value;
                $event->removeAttribute($key);
            }
        }

        $form->getAttributeBag()->merge($attributesForAttributeBag);

        if (null === $form->getAttributeBag()->get('method')) {
            $form->getAttributeBag()->set('method', 'post');
        }
    }

    public function setConditionalAttributes(AttachFormAttributesEvent $event)
    {
        $formService = Freeform::getInstance()->forms;

        $form = $event->getForm();
        $bag = $form->getAttributeBag();

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
        $event->attachAttribute('data-show-spinner', $form->isShowSpinner());

        if (\count($form->getLayout()->getFileUploadFields())) {
            $event->attachAttribute('enctype', 'multipart/form-data');
        }

        $autoScroll = Freeform::getInstance()->settings->getSettingsModel()->autoScroll;
        if ($autoScroll) {
            $event->attachAttribute('data-auto-scroll', $autoScroll);
        }

        if ($formService->shouldScrollToAnchor($form)) {
            $event->attachAttribute('data-scroll-to-anchor', $form->getAnchor());
        }

        if ($form->isShowLoadingText()) {
            $event->attachAttribute('data-show-loading-text', true);
            $event->attachAttribute('data-loading-text', $form->getLoadingText());
        }

        if ($form->getSuccessMessage()) {
            $event->attachAttribute('data-success-message', \Craft::t('app', $form->getSuccessMessage()));
        }

        if ($form->getErrorMessage()) {
            $event->attachAttribute('data-error-message', \Craft::t('app', $form->getErrorMessage()));
        }
    }

    public function prepareAttributes(UpdateAttributesEvent $event)
    {
        $form = $event->getForm();
        $bag = $form->getPropertyBag();
        $attributeBag = $form->getAttributeBag();

        $attributeBag->merge($bag->get('formAttributes', []));
        $attributeBag->merge($bag->get('attributes', []));

        $bag->remove('formAttributes');
        $bag->remove('attributes');
    }

    private function attachConditionally(AttachFormAttributesEvent $event, BagInterface $bag, string $key)
    {
        if ($bag->get($key)) {
            $event->attachAttribute($key, $bag->get($key));
        }
    }
}

<?php

/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2026, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Widgets;

use craft\base\Widget;
use craft\helpers\UrlHelper;
use Solspace\Freeform\Form\Settings\Implementations\BehaviorSettings;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Resources\Bundles\Widgets\QuickForm\QuickFormBundle;

class QuickFormWidget extends Widget implements ExtraWidgetInterface
{
    public ?string $title = null;

    public ?int $formId = null;

    public ?string $successMessage = null;

    public static function displayName(): string
    {
        return Freeform::getInstance()->name.' '.Freeform::t('Quick Form');
    }

    public static function icon(): string
    {
        return '@freeform/icon-mask.svg';
    }

    public function init(): void
    {
        parent::init();

        if (null === $this->title) {
            $this->title = self::displayName();
        }
    }

    public function getTitle(): string
    {
        return $this->title ?: self::displayName();
    }

    public function rules(): array
    {
        return [
            [['formId'], 'required'],
        ];
    }

    public function getBodyHtml(): string
    {
        $freeform = Freeform::getInstance();
        if (!$freeform->isPro()) {
            return Freeform::t(
                "Requires <a href='{link}'>Pro</a> edition",
                ['link' => UrlHelper::cpUrl('plugin-store/freeform')]
            );
        }

        $form = $this->formId ? $freeform->forms->getFormById($this->formId, uniqueId: 'quick-form-widget-'.$this->id) : null;

        if ($form) {
            $form->getAttributes()->getForm()
                ->set('data-freeform-signature-responsive', true)
                ->set('data-freeform-signature-max-scale', 1)
            ;
            // Keep dashboard submissions and their success state inside the widget.
            $behavior = $form->getSettings()->getBehavior();
            $behavior->ajax = true;
            $behavior->successBehavior = BehaviorSettings::SUCCESS_BEHAVIOR_RELOAD;
            if ($this->successMessage) {
                $behavior->successMessage = Freeform::t($this->successMessage);
            }
        }

        \Craft::$app->view->registerAssetBundle(QuickFormBundle::class);

        return \Craft::$app->view->renderTemplate(
            'freeform/_widgets/quick-form/body',
            [
                'form' => $form,
                'widgetId' => $this->id,
            ]
        );
    }

    public function getSettingsHtml(): string
    {
        $freeform = Freeform::getInstance();

        return \Craft::$app->view->renderTemplate(
            'freeform/_widgets/quick-form/settings',
            [
                'settings' => $this,
                'formList' => $freeform->forms->getAllFormNames(orderByName: true),
            ]
        );
    }
}

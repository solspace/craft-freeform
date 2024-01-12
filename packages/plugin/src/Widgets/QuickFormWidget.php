<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2022, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Widgets;

use craft\base\Widget;
use craft\helpers\UrlHelper;
use Solspace\Freeform\Freeform;

class QuickFormWidget extends Widget implements ExtraWidgetInterface
{
    public ?string $title = null;

    public ?int $formId = null;

    public ?string $successMessage = null;

    public static function displayName(): string
    {
        return Freeform::getInstance()->name.' '.Freeform::t('Quick Form');
    }

    public static function iconPath(): string
    {
        return __DIR__.'/../icon-mask.svg';
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

        $form = $freeform->forms->getFormById($this->formId);
        $formCss = $freeform->forms->getFormattingTemplateCss('flexbox');

        $successMessage = 'Form submitted successfully';
        if ($this->successMessage) {
            $successMessage = $this->successMessage;
        }

        return \Craft::$app->view->renderTemplate(
            'freeform/_widgets/quick-form/body',
            [
                'form' => $form,
                'formCss' => $formCss,
                'successMessage' => Freeform::t($successMessage),
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
                'formList' => $freeform->forms->getAllFormNames(),
            ]
        );
    }
}

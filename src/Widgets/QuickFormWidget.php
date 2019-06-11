<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2019, Solspace, Inc.
 * @link          http://docs.solspace.com/craft/freeform
 * @license       https://solspace.com/software/license-agreement
 */

namespace Solspace\Freeform\Widgets;

use craft\base\Widget;
use Solspace\Freeform\Freeform;

class QuickFormWidget extends Widget
{
    /** @var string */
    public $title;

    /** @var int */
    public $formId;

    /** @var string */
    public $successMessage;

    /**
     * @return string
     */
    public static function displayName(): string
    {
        return Freeform::getInstance()->name . ' ' . Freeform::t('Quick Form');
    }

    /**
     * @return string
     */
    public static function iconPath(): string
    {
        return __DIR__ . '/../icon-mask.svg';
    }

    /**
     * @inheritDoc
     */
    public function init()
    {
        parent::init();

        if (null === $this->title) {
            $this->title = self::displayName();
        }
    }

    /**
     * @return string
     */
    public function getTitle(): string
    {
        return $this->title ?: self::displayName();
    }

    /**
     * @return array
     */
    public function rules(): array
    {
        return [
            [['formId'], 'required'],
        ];
    }

    /**
     * @return string
     */
    public function getBodyHtml(): string
    {
        $freeform  = Freeform::getInstance();
        $formModel = $freeform->forms->getFormById($this->formId);

        $form    = null;
        $formCss = null;
        if ($formModel) {
            $form    = $formModel->getForm();
            $formCss = $freeform->forms->getFormattingTemplateCss('flexbox');
        }

        $successMessage = 'Form submitted successfully';
        if ($this->successMessage) {
            $successMessage = $this->successMessage;
        }

        return \Craft::$app->view->renderTemplate('freeform/_widgets/quick-form/body',
            [
                'form'           => $form,
                'formCss'        => $formCss,
                'successMessage' => Freeform::t($successMessage),
            ]
        );
    }

    /**
     * @return string
     */
    public function getSettingsHtml(): string
    {
        $freeform = Freeform::getInstance();

        $forms    = $freeform->forms->getAllForms();
        $formList = [];
        foreach ($forms as $form) {
            if (!$form) {
                continue;
            }
            $formList[$form->id] = $form->name;
        }

        return \Craft::$app->view->renderTemplate(
            'freeform/_widgets/quick-form/settings',
            [
                'settings' => $this,
                'formList' => $formList,
            ]
        );
    }
}

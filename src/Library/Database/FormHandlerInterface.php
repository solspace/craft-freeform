<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2019, Solspace, Inc.
 * @link          https://docs.solspace.com/craft/freeform
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Library\Database;

use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Library\Composer\Components\Form;

interface FormHandlerInterface
{
    const EVENT_BEFORE_SUBMIT             = 'beforeSubmit';
    const EVENT_AFTER_SUBMIT              = 'afterSubmit';
    const EVENT_PAGE_JUMP                 = 'pageJump';
    const EVENT_BEFORE_SAVE               = 'beforeSave';
    const EVENT_AFTER_SAVE                = 'afterSave';
    const EVENT_BEFORE_DELETE             = 'beforeDelete';
    const EVENT_AFTER_DELETE              = 'afterDelete';
    const EVENT_RENDER_OPENING_TAG        = 'renderOpeningTag';
    const EVENT_RENDER_CLOSING_TAG        = 'renderClosingTag';
    const EVENT_FORM_VALIDATE             = 'validateForm';
    const EVENT_AFTER_FORM_VALIDATE       = 'afterValidateForm';
    const EVENT_ATTACH_FORM_ATTRIBUTES    = 'attachFormAttributes';
    const EVENT_AFTER_GENERATE_RETURN_URL = 'afterGenerateReturnUrl';

    /**
     * @param Form   $form
     * @param string $templateName
     *
     * @return \Twig_Markup
     */
    public function renderFormTemplate(Form $form, $templateName): \Twig_Markup;

    /**
     * Increments the spam block counter by 1
     *
     * @param Form $form
     *
     * @return int - new spam block count
     */
    public function incrementSpamBlockCount(Form $form): int;

    /**
     * @return bool
     */
    public function isSpamBehaviourSimulateSuccess(): bool;

    /**
     * @return bool
     */
    public function isSpamBehaviourReloadForm(): bool;

    /**
     * @return bool
     */
    public function isSpamFolderEnabled(): bool;

    /**
     * @return bool
     */
    public function isAjaxEnabledByDefault(): bool;

    /**
     * @param Form $form
     *
     * @return bool
     */
    public function shouldScrollToAnchor(Form $form): bool;

    /**
     * @return bool
     */
    public function isFormSubmitDisable(): bool;

    /**
     * @param Form $form
     *
     * @return bool
     */
    public function isReachedPostingLimit(Form $form): bool;

    /**
     * @return string
     */
    public function getDefaultFormattingTemplate(): string;

    /**
     * Do something before the form is saved
     * Return bool determines whether the form should be saved or not
     *
     * @param Form $form
     *
     * @return bool
     */
    public function onBeforeSubmit(Form $form): bool;

    /**
     * Do something after the form is saved
     *
     * @param Form            $form
     * @param Submission|null $submission
     */
    public function onAfterSubmit(Form $form, Submission $submission = null);

    /**
     * Allows 3rd party scripts to override the page that the form will jump to
     *
     * @param Form $form
     *
     * @return int|null $pageIndex
     */
    public function onBeforePageJump(Form $form);

    /**
     * Attach anything to the form after opening tag
     *
     * @param Form $form
     *
     * @return string
     */
    public function onRenderOpeningTag(Form $form): string;

    /**
     * Attach anything to the form before the closing tag
     *
     * @param Form $form
     *
     * @return string
     */
    public function onRenderClosingTag(Form $form): string;

    /**
     * Attach any custom form attributes to the form tag
     *
     * @param Form  $form
     * @param array $attributes
     *
     * @return null
     */
    public function onAttachFormAttributes(Form $form, array $attributes = []);

    /**
     * @param Form $form
     */
    public function onFormValidate(Form $form);

    /**
     * @param Form $form
     */
    public function onAfterFormValidate(Form $form);

    /**
     * @param Form       $form
     * @param Submission $submission
     * @param string     $returnUrl
     *
     * @return string|null
     */
    public function onAfterGenerateReturnUrl(Form $form, Submission $submission = null, string $returnUrl = null);
}

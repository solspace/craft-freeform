<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2016, Solspace, Inc.
 * @link          https://solspace.com/craft/freeform
 * @license       https://solspace.com/software/license-agreement
 */

namespace Solspace\freeform\Library\Database;

use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Library\Composer\Components\Form;

interface FormHandlerInterface
{
    /**
     * @param Form   $form
     * @param string $templateName
     *
     * @return \Twig_Markup
     */
    public function renderFormTemplate(Form $form, $templateName): \Twig_Markup;

    /**
     * @return bool
     */
    public function isSpamProtectionEnabled(): bool;

    /**
     * Increments the spam block counter by 1
     *
     * @param Form $form
     *
     * @return int - new spam block count
     */
    public function incrementSpamBlockCount(Form $form): int;

    /**
     * @param Form $form
     */
    public function addScriptsToPage(Form $form);

    /**
     * @param Form $form
     *
     * @return string
     */
    public function getScriptOutput(Form $form): string;

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
}

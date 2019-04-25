<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2019, Solspace, Inc.
 * @link          https://solspace.com/craft/freeform
 * @license       https://solspace.com/software/license-agreement
 */

namespace Solspace\Freeform\Library\Database;

use Craft\NotificationModel;
use Solspace\Freeform\Elements\SpamSubmission;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Library\Composer\Components\Form;

interface SubmissionHandlerInterface
{
    /**
     * Stores the submitted fields to database
     *
     * @param Form  $form
     *
     * @return NotificationModel|null
     */
    public function storeSubmission(Form $form);

    /**
     * Finalize all files uploaded in this form, so that they don' get deleted
     *
     * @param Form $form
     */
    public function finalizeFormFiles(Form $form);

    /**
     * Add a session flash variable that the form has been submitted
     *
     * @param Form $form
     */
    public function markFormAsSubmitted(Form $form);

    /**
     * Check for a session flash variable for form submissions
     *
     * @param Form $form
     *
     * @return bool
     */
    public function wasFormFlashSubmitted(Form $form): bool;

    /**
     * Creates non-stored Submission or SpamSubmission instance from form field values
     *
     * @param Form $form
     *
     * @return Submission|SpamSubmission
     */
    public function createSubmissionFromForm(Form $form);

    /**
     * Runs all integrations on submission
     *
     * @param Submission $submission
     * @param AbstractField[] $mailingListOptedInFields
     */
    public function postProcessSubmission(Submission $submission, array $mailingListOptedInFields);
}

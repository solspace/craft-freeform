<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2021, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Controllers;

use Solspace\Freeform\Bundles\Form\Context\Session\SessionContext;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Forms\StoreSubmissionEvent;
use Solspace\Freeform\Events\Forms\SubmitEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\Exceptions\FreeformException;
use yii\base\Event;
use yii\web\Response;

class SubmitController extends BaseController
{
    /** @var bool */
    protected $allowAnonymous = true;

    /**
     * @throws FreeformException
     *
     * @return null|Response
     */
    public function actionIndex()
    {
        $this->requirePostRequest();

        $request = \Craft::$app->request;

        $formId = SessionContext::getPostedFormId();
        $formModel = $this->getFormsService()->getFormById($formId);
        if (!$formModel) {
            throw new FreeformException(
                \Craft::t('freeform', 'Form with ID {id} not found', ['id' => $formId])
            );
        }

        $form = $formModel->getForm();
        $isAjaxRequest = $request->getIsAjax();

        $form->handleRequest($request);
        if ($form->isFormPosted() && $form->isValid() && !$form->getActions() && $form->isFinished()) {
            $submission = $this->getSubmissionsService()->createSubmissionFromForm($form);
            $this->handleSubmission($form, $submission);

            if (!$form->hasErrors()) {
                $returnUrl = $this->getReturnUrl($form, $submission);

                $form->reset();

                if ($isAjaxRequest) {
                    return $this->toAjaxResponse($form, $submission, $returnUrl);
                }

                return $this->redirect($returnUrl);
            }
        }

        if ($form->isMarkedAsSpam() && $this->getSettingsService()->isSpamBehaviourReloadForm()) {
            return $this->redirect($request->getUrl());
        }

        if ($isAjaxRequest) {
            return $this->toAjaxResponse($form);
        }
    }

    private function handleSubmission(Form $form, Submission $submission)
    {
        $event = new SubmitEvent($form);
        Event::trigger(Form::class, Form::EVENT_SUBMIT, $event);

        if (!$event->isValid || !empty($form->getActions()) || !$this->formHandler->onBeforeSubmit($this)) {
            return false;
        }

        $storeSubmissionEvent = new StoreSubmissionEvent($form, $submission);
        Event::trigger(Form::class, Form::EVENT_ON_STORE_SUBMISSION, $storeSubmissionEvent);

        if ($form->isStoreData() && $storeSubmissionEvent->isValid && $form->hasOptInPermission()) {
            $this->getSubmissionsService()->storeSubmission($form, $submission);
        }

        if ($submission->hasErrors()) {
            $form->addErrors(array_keys($submission->getErrors()));
        }

        $mailingListOptInFields = $form->getMailingListOptedInFields();
        if ($form->isMarkedAsSpam()) {
            if ($submission->getId()) {
                $this->getSpamSubmissionsService()->postProcessSubmission($submission, $mailingListOptInFields);
            }
        } else {
            $this->getSubmissionsService()->postProcessSubmission($submission, $mailingListOptInFields);
        }

        Event::trigger(self::class, self::EVENT_AFTER_SUBMIT, $event);
    }

    private function getReturnUrl(Form $form, Submission $submission): string
    {
        $request = \Craft::$app->request;

        $postedReturnUrl = $request->post(Form::RETURN_URI_KEY);
        if ($postedReturnUrl) {
            $returnUrl = \Craft::$app->security->validateData($postedReturnUrl);
            if (false === $returnUrl) {
                $returnUrl = $form->getReturnUrl();
            }
        } else {
            $returnUrl = $form->getReturnUrl();
        }

        $returnUrl = \Craft::$app->view->renderString(
            $returnUrl,
            [
                'form' => $form,
                'submission' => $submission,
            ]
        );

        $returnUrl = Freeform::getInstance()->forms->onAfterGenerateReturnUrl($form, $submission, $returnUrl);
        if (!$returnUrl) {
            $returnUrl = $request->getUrl();
        }

        return $returnUrl;
    }

    private function toAjaxResponse(Form $form, Submission $submission, string $returnUrl = null): Response
    {
        $honeypot = Freeform::getInstance()->honeypot->getHoneypot($form);
        $fieldErrors = [];
        foreach ($form->getLayout()->getFields() as $field) {
            if ($field->hasErrors()) {
                $fieldErrors[$field->getHandle()] = $field->getErrors();
            }
        }

        $success = !$form->hasErrors() && !$form->getActions();

        return $this->asJson(
            [
                'success' => $success,
                'multipage' => $form->isMultiPage(),
                'finished' => $form->isFinished(),
                'submissionId' => $submission->id ?? null,
                'submissionToken' => $submission->token ?? null,
                'actions' => $form->getActions(),
                'errors' => $fieldErrors,
                'formErrors' => $form->getErrors(),
                'returnUrl' => $returnUrl,
                'honeypot' => [
                    'name' => $honeypot->getName(),
                    'hash' => $honeypot->getHash(),
                ],
                'html' => $form->render(),
            ]
        );
    }
}

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
use Solspace\Freeform\Events\Forms\PrepareAjaxResponsePayloadEvent;
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
        $submission = $this->getSubmissionsService()->createSubmissionFromForm($form);
        if ($form->isFormPosted() && $form->isValid() && !$form->getActions() && $form->isFinished()) {
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

        if ($isAjaxRequest) {
            return $this->toAjaxResponse($form, $submission);
        }
    }

    private function handleSubmission(Form $form, Submission $submission)
    {
        $formHandler = Freeform::getInstance()->forms;

        $event = new SubmitEvent($form, $submission);
        Event::trigger(Form::class, Form::EVENT_SUBMIT, $event);

        if (!$event->isValid || !empty($form->getActions()) || !$formHandler->onBeforeSubmit($form)) {
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

        Event::trigger(Form::class, Form::EVENT_AFTER_SUBMIT, $event);
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
        $fieldErrors = [];
        foreach ($form->getLayout()->getFields() as $field) {
            if ($field->hasErrors()) {
                $fieldErrors[$field->getHandle()] = $field->getErrors();
            }
        }

        $success = !$form->hasErrors() && empty($fieldErrors) && !$form->getActions();

        $payload = [
            'success' => $success,
            'multipage' => $form->isMultiPage(),
            'finished' => $form->isFinished(),
            'submissionId' => $submission->id ?? null,
            'submissionToken' => $submission->token ?? null,
            'actions' => $form->getActions(),
            'errors' => $fieldErrors,
            'formErrors' => $form->getErrors(),
            'returnUrl' => $returnUrl,
            'html' => $form->render(),
        ];

        $event = new PrepareAjaxResponsePayloadEvent($form, $payload);
        Event::trigger(Form::class, Form::EVENT_PREPARE_AJAX_RESPONSE_PAYLOAD, $event);

        return $this->asJson($event->getPayload());
    }
}

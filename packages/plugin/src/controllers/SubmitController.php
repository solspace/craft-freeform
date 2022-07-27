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

namespace Solspace\Freeform\controllers;

use Solspace\Freeform\Bundles\Form\Context\Session\SessionContext;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Events\Controllers\ConfigureCORSEvent;
use Solspace\Freeform\Events\Forms\PrepareAjaxResponsePayloadEvent;
use Solspace\Freeform\Events\Forms\ReturnUrlEvent;
use Solspace\Freeform\Events\Forms\StoreSubmissionEvent;
use Solspace\Freeform\Events\Forms\SubmitEvent;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\Exceptions\FreeformException;
use yii\base\Event;
use yii\filters\Cors;
use yii\web\Response;

class SubmitController extends BaseController
{
    public const EVENT_CONFIGURE_CORS = 'configure-cors';

    protected array|bool|int $allowAnonymous = true;

    public function actionIndex(): ?Response
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

        $requestHandled = $form->handleRequest($request);
        $submission = $this->getSubmissionsService()->createSubmissionFromForm($form);
        if ($requestHandled && $form->isFormPosted() && $form->isValid() && !$form->getActions() && $form->isFinished()) {
            $this->handleSubmission($form, $submission);

            $returnUrl = $this->getReturnUrl($form, $submission);

            $form->reset();
            $form->persistState();

            if ($isAjaxRequest) {
                return $this->toAjaxResponse($form, $submission, $returnUrl);
            }

            if (Form::SUCCESS_BEHAVIOUR_LOAD_SUCCESS_TEMPLATE === $form->getSuccessBehaviour()) {
                if ($form->getSuccessTemplate()) {
                    return $this->redirect($request->getUrl());
                }
            }

            return $this->redirect($returnUrl);
        }

        $form->persistState();

        if ($isAjaxRequest) {
            return $this->toAjaxResponse($form, $submission);
        }

        return null;
    }

    public function behaviors(): array
    {
        $generalConfig = \Craft::$app->getConfig()->getGeneral();
        $origins = $generalConfig->allowedGraphqlOrigins;
        if ('*' === $origins) {
            $origins = ['*'];
        }

        $corsHeaders = [
            'Access-Control-Request-Method' => ['POST', 'OPTIONS'],
            'Access-Control-Request-Headers' => [
                'Authorization',
                'Cache-Control',
                'Content-Type',
                'X-Craft-Token',
                'X-Requested-With',
                'HTTP_X_REQUESTED_WITH',
            ],
            'Access-Control-Allow-Credentials' => !\is_array($origins) || !\in_array('*', $origins, true),
            'Access-Control-Max-Age' => 86400,
            'Origin' => $origins,
        ];

        $event = new ConfigureCORSEvent($corsHeaders);
        $this->trigger(self::EVENT_CONFIGURE_CORS, $event);

        return [
            'corsFilter' => [
                'class' => Cors::class,
                'cors' => $event->getHeaders(),
            ],
        ];
    }

    private function handleSubmission(Form $form, Submission $submission): void
    {
        $formHandler = Freeform::getInstance()->forms;

        $event = new SubmitEvent($form, $submission);
        Event::trigger(Form::class, Form::EVENT_SUBMIT, $event);

        if (!$event->isValid || !empty($form->getActions()) || !$formHandler->onBeforeSubmit($form)) {
            return;
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
                $this->getSpamSubmissionsService()->postProcessSubmission($form, $submission, $mailingListOptInFields);
            }
        } else {
            $this->getSubmissionsService()->postProcessSubmission($form, $submission, $mailingListOptInFields);
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

        /** @deprecated  */
        $returnUrl = Freeform::getInstance()->forms->onAfterGenerateReturnUrl($form, $submission, $returnUrl);

        $event = new ReturnUrlEvent($form, $submission, $returnUrl);
        Event::trigger(Form::class, Form::EVENT_GENERATE_RETURN_URL, $event);
        $returnUrl = $event->getReturnUrl();

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
            'onSuccess' => $form->getSuccessBehaviour(),
            'returnUrl' => $returnUrl,
            'html' => $form->render(),
        ];

        $event = new PrepareAjaxResponsePayloadEvent($form, $payload);
        Event::trigger(Form::class, Form::EVENT_PREPARE_AJAX_RESPONSE_PAYLOAD, $event);

        return $this->asJson($event->getPayload());
    }
}

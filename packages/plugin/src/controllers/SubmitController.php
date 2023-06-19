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
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Form\Settings\Implementations\BehaviorSettings;
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

        $request = \Craft::$app->getRequest();
        $isAjaxRequest = $request->getIsAjax();

        $formId = SessionContext::getPostedFormId();
        $form = $this->getFormsService()->getFormById($formId);
        if (!$form) {
            $message = \Craft::t('freeform', 'Form with ID {id} not found', ['id' => $formId]);

            if (!$isAjaxRequest) {
                throw new FreeformException($message);
            }

            return $this->asJson(['success' => false, 'message' => $message]);
        }

        $requestHandled = $form->handleRequest($request);
        $formsService = $this->getFormsService();
        $submissionsService = $this->getSubmissionsService();
        $submission = $submissionsService->createSubmissionFromForm($form);
        if ($requestHandled && $form->isFormPosted() && $form->isValid() && !$form->getActions() && $form->isFinished()) {
            $submissionsService->handleSubmission($form, $submission);

            $returnUrl = $formsService->getReturnUrl($form, $submission);

            $form->reset();
            $form->persistState();

            if ($isAjaxRequest) {
                return $this->toAjaxResponse($form, $submission, $returnUrl);
            }

            $behavior = $form->getSettings()->getBehavior();

            if (BehaviorSettings::SUCCESS_BEHAVIOUR_LOAD_SUCCESS_TEMPLATE === $behavior->successBehavior) {
                if ($behavior->successTemplate) {
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

    private function toAjaxResponse(Form $form, Submission $submission, string $returnUrl = null): Response
    {
        $fieldErrors = [];
        foreach ($form->getLayout()->getFields() as $field) {
            if ($field->hasErrors()) {
                $fieldErrors[$field->getHandle()] = $field->getErrors();
            }
        }

        $success = !$form->hasErrors() && empty($fieldErrors) && !$form->getActions();

        $postedValues = [];
        foreach ($submission as $field) {
            $postedValues[$field->getHandle()] = $field->getValue();
        }

        $payload = [
            'success' => $success,
            'multipage' => $form->isMultiPage(),
            'finished' => $form->isFinished(),
            'submissionId' => $submission->id ?? null,
            'submissionToken' => $submission->token ?? null,
            'actions' => $form->getActions(),
            'errors' => $fieldErrors,
            'formErrors' => $form->getErrors(),
            'onSuccess' => $form->getSettings()->getBehavior()->successBehavior,
            'returnUrl' => $returnUrl,
            'html' => $form->render(),
            'values' => $postedValues,
        ];

        $event = new PrepareAjaxResponsePayloadEvent($form, $payload);
        Event::trigger(Form::class, Form::EVENT_PREPARE_AJAX_RESPONSE_PAYLOAD, $event);

        return $this->asJson($event->getPayload());
    }
}

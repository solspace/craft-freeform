<?php

namespace Solspace\Freeform\Bundles\GraphQL\Resolvers\Mutations;

use craft\errors\GqlException;
use craft\gql\base\ElementMutationResolver;
use GraphQL\Error\UserError;
use GraphQL\Type\Definition\ResolveInfo;
use Solspace\Freeform\Bundles\GraphQL\GqlPermissions;
use Solspace\Freeform\Events\Forms\GraphQLRequestEvent;
use Solspace\Freeform\Events\Forms\PrepareAjaxResponsePayloadEvent;
use Solspace\Freeform\Fields\FileUploadField;
use Solspace\Freeform\Fields\RecaptchaField;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\Exceptions\FreeformException;
use yii\base\Event;

class SubmissionMutationResolver extends ElementMutationResolver
{
    protected array $immutableAttributes = ['id', 'uid'];

    /**
     * @throws UserError
     * @throws FreeformException
     * @throws GqlException
     */
    public function saveSubmission(mixed $source, array $arguments, mixed $context, ResolveInfo $resolveInfo): ?array
    {
        if (!GqlPermissions::canCreateAllSubmissions() && !GqlPermissions::canCreateSubmissions($context->uid)) {
            throw new UserError('Unable to create Freeform submissions.');
        }

        $formModel = $this->getResolutionData('formModel');
        if (!$formModel) {
            throw new UserError('Form with ID {id} not found', [
                'id' => $context->id,
            ]);
        }

        $form = $formModel->getForm();

        $form->setGraphQLPosted(true);
        $form->setGraphQLArguments($arguments);

        $freeform = Freeform::getInstance();

        $formsService = $freeform->forms;
        $submissionsService = $freeform->submissions;

        $request = \Craft::$app->getRequest();

        $graphqlEvent = new GraphQLRequestEvent($form, $request, $arguments);
        Event::trigger(Form::class, Form::EVENT_GRAPHQL_REQUEST, $graphqlEvent);

        $requestHandled = $form->handleRequest($request);

        $submission = $submissionsService->createSubmissionFromForm($form);

        if ($requestHandled && $form->isValid() && !$form->getActions()) {
            $submissionsService->handleSubmission($form, $submission);

            $form->reset();
            $form->persistState();
        }

        $returnUrl = $formsService->getReturnUrl($form, $submission);

        $userErrors = [];

        foreach ($form->getLayout()->getFields() as $field) {
            if ($field->hasErrors()) {
                $errors = [];
                $errors[$field->getHandle()] = $field->getErrors();

                $userErrors[] = $errors;
            }
        }

        if (\count($form->getErrors()) > 0) {
            $userErrors[] = $form->getErrors();
        }

        if (\count($form->getActions()) > 0) {
            $userErrors[] = $form->getActions();
        }

        if (!empty($userErrors)) {
            throw new UserError(json_encode($userErrors));
        }

        $form->registerContext();
        $form->setFinished(true);

        $success = !$form->hasErrors() && empty($fieldErrors) && !$form->getActions();

        $spamReasons = $submission->getSpamReasons();
        if (\count($spamReasons) > 0) {
            $spamReasons = json_encode($spamReasons);
        }

        $payload = [
            'success' => $success,
            'hash' => $form->getHash(),
            'multiPage' => $form->isMultiPage(),
            'finished' => $form->isFinished(),
            'submissionId' => $submission->id,
            'submissionToken' => $submission->token,
            'submissionLimitReached' => $form->isSubmissionLimitReached(),
            'onSuccess' => $form->getSuccessBehaviour(),
            'returnUrl' => $returnUrl,
            'html' => $form->render(),
            'id' => $submission->id,
            'dateCreated' => $submission->getSubmissionDate(),
            'dateUpdated' => $submission->dateUpdated,
            'isSpam' => $submission->isSpam,
            'spamReasons' => $spamReasons,
            'user' => $submission->getUser(),
        ];

        // Allows field definitions specified in the response to be resolved
        foreach ($arguments as $key => $value) {
            $payload[$key] = $value;
        }

        $payload['assets'] = null;
        $assetsFields = $form->getLayout()->getFields(FileUploadField::class);
        foreach ($assetsFields as $assetsField) {
            $assets = $submission->getAssets($assetsField->getHandle());
            foreach ($assets as $asset) {
                $payload['assets'][] = $asset;
            }
        }

        $payload['recaptchaHandle'] = null;
        $recaptchaFields = $form->getLayout()->getFields(RecaptchaField::class);
        $recaptchaField = reset($recaptchaFields);

        if ($recaptchaField) {
            $payload['recaptchaHandle'] = $recaptchaField->getHandle();
        }

        $event = new PrepareAjaxResponsePayloadEvent($form, $payload);
        Event::trigger(Form::class, Form::EVENT_PREPARE_AJAX_RESPONSE_PAYLOAD, $event);

        $eventPayload = $event->getPayload();

        if (!empty($eventPayload['freeform_payload'])) {
            $payload['freeformPayload'] = $eventPayload['freeform_payload'];
        }

        if (!empty($eventPayload['honeypot'])) {
            $payload['honeypot']['name'] = $eventPayload['honeypot']['name'];
            $payload['honeypot']['value'] = $eventPayload['honeypot']['hash'];
        }

        return $payload;
    }
}

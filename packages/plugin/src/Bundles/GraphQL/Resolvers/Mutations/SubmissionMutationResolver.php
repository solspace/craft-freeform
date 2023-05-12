<?php

namespace Solspace\Freeform\Bundles\GraphQL\Resolvers\Mutations;

use craft\errors\GqlException;
use craft\gql\base\ElementMutationResolver;
use GraphQL\Error\Error;
use GraphQL\Type\Definition\ResolveInfo;
use Solspace\Freeform\Bundles\GraphQL\GqlPermissions;
use Solspace\Freeform\Events\Forms\GraphQLRequestEvent;
use Solspace\Freeform\Events\Forms\PrepareAjaxResponsePayloadEvent;
use Solspace\Freeform\Fields\FileUploadField;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\Exceptions\FreeformException;
use yii\base\Event;

class SubmissionMutationResolver extends ElementMutationResolver
{
    protected array $immutableAttributes = ['id', 'uid'];

    /**
     * @throws Error
     * @throws FreeformException
     * @throws GqlException
     */
    public function saveSubmission(mixed $source, array $arguments, mixed $context, ResolveInfo $resolveInfo): ?array
    {
        if (!GqlPermissions::canCreateAllSubmissions() && !GqlPermissions::canCreateSubmissions($context->uid)) {
            throw new Error('Unable to create Freeform submissions.');
        }

        $formModel = $this->getResolutionData('formModel');
        if (!$formModel) {
            throw new Error('Form with ID {id} not found', [
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

        $hasFieldErrors = false;

        $fieldErrors = [];

        foreach ($form->getLayout()->getFields() as $field) {
            if ($field->hasErrors()) {
                $hasFieldErrors = true;

                $fieldErrors[$field->getHandle()] = $field->getErrors();
            }
        }

        $userErrors = [];

        if ($hasFieldErrors) {
            foreach ($fieldErrors as $fieldError) {
                foreach ($fieldError as $message) {
                    if (\is_array($message)) {
                        foreach ($message as $mess) {
                            $userErrors[] = $mess;
                        }
                    } else {
                        $userErrors[] = $message;
                    }
                }
            }
        }

        if ($form->hasErrors()) {
            foreach ($form->getErrors() as $formError) {
                foreach ($formError as $message) {
                    if (\is_array($message)) {
                        foreach ($message as $mess) {
                            $userErrors[] = $mess;
                        }
                    } else {
                        $userErrors[] = $message;
                    }
                }
            }
        }

        foreach ($form->getActions() as $formAction) {
            foreach ($formAction as $message) {
                if (\is_array($message)) {
                    foreach ($message as $mess) {
                        $userErrors[] = $mess;
                    }
                } else {
                    $userErrors[] = $message;
                }
            }
        }

        if (!empty($userErrors)) {
            throw new Error(implode('\n', $userErrors));
        }

        $form->registerContext();
        $form->setFinished(true);

        $success = !$form->hasErrors() && empty($fieldErrors) && !$form->getActions();

        $payload = [
            'success' => $success,
            'hash' => $form->getHash(),
            'multiPage' => $form->isMultiPage(),
            'finished' => $form->isFinished(),
            'submissionId' => $submission->id,
            'submissionToken' => $submission->token,
            'formActions' => $form->getActions(),
            'fieldErrors' => $fieldErrors,
            'formErrors' => $form->getErrors(),
            'submissionLimitReached' => $form->isSubmissionLimitReached(),
            'onSuccess' => $form->getSuccessBehaviour(),
            'returnUrl' => $returnUrl,
            'html' => $form->render(),
            'values' => $arguments,
            'id' => $submission->id,
            'dateCreated' => $submission->getSubmissionDate(),
            'dateUpdated' => $submission->dateUpdated,
            'isSpam' => $submission->isSpam,
            'spamReasons' => $submission->getSpamReasons(),
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

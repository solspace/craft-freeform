<?php

namespace Solspace\Freeform\Services\Headless;

use craft\web\Response;
use Solspace\Freeform\Bundles\Form\SaveForm\SaveFormsHelper;
use Solspace\Freeform\Fields\Interfaces\NoStorageInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Services\Headless\Profile\HeadlessProfile;

class HeadlessResponseHelper
{
    public function applyNoStore(Response $response): void
    {
        $response->headers->set('Cache-Control', 'no-store');
    }

    public function applyPublicManifestCache(Response $response, Form $form): void
    {
        $etag = $this->buildManifestEtag($form);
        $response->headers->set('Cache-Control', 'public, max-age=300');
        $response->headers->set('ETag', $etag);
        $response->headers->set('Vary', 'Origin');
    }

    public function applyProfileManifestCache(Response $response, HeadlessProfile $profile): void
    {
        $response->headers->set('Cache-Control', $profile->cache);
        $response->headers->set('Vary', 'Origin');
    }

    public function buildManifestEtag(Form $form): string
    {
        $updated = $form->getDateUpdated()->format('U');

        return \sprintf('"freeform-form-%s-%s"', $form->getUid(), $updated);
    }

    /**
     * @param null|array{token: string, key: string, resumeUrl: null|string} $draft
     *
     * @return array<string, mixed>
     */
    public function buildSubmitResponse(
        Form $form,
        string $intent,
        bool $notImplemented = false,
        ?array $draft = null,
    ): array {
        if ($notImplemented) {
            return [
                'success' => false,
                'status' => 'not_implemented',
                'complete' => false,
                'message' => 'This intent is not implemented yet.',
                'errors' => ['form' => ['This intent is not implemented yet.']],
            ];
        }

        $submission = $form->getSubmission();
        $fieldErrors = $this->collectFieldErrors($form);
        $formErrors = array_values($form->getErrors());
        $hasErrors = [] !== $fieldErrors || [] !== $formErrors || [] !== $form->getActions();
        $isComplete = $form->isFinished() && $form->isValid() && !$hasErrors && 'submit' === $intent;
        $draftSaved = 'saveDraft' === $intent && null !== $draft;

        $status = match (true) {
            $draftSaved => 'draft_saved',
            'saveDraft' === $intent => 'validation_failed',
            'validate' === $intent && $form->isValid() => 'validated',
            'validate' === $intent => 'validation_failed',
            $isComplete => 'submitted',
            $form->isValid() && !$form->isFinished() => 'page_valid',
            default => 'validation_failed',
        };

        $formsService = Freeform::getInstance()->forms;
        $returnUrl = $formsService->getReturnUrl($form);

        $includeState = $draftSaved || SaveFormsHelper::isLoaded($form);

        return [
            'success' => $draftSaved || ($form->isValid() && [] === $form->getActions()),
            'status' => $status,
            'complete' => $isComplete,
            'submission' => $isComplete && $submission?->id ? [
                'id' => $submission->id,
                'uid' => $submission->uid,
                'token' => $submission->token ?? null,
            ] : null,
            'message' => $isComplete ? $form->getSettings()->getBehavior()->successMessage : null,
            'redirect' => $isComplete && $returnUrl ? ['url' => $returnUrl, 'delay' => 0] : null,
            'actions' => array_values($form->getActions()),
            'page' => $form->isMultiPage() ? [
                'currentIndex' => $form->getCurrentPageIndex(),
            ] : null,
            'state' => $includeState ? [
                'values' => $this->collectFieldValues($form),
                'pageIndex' => $form->getCurrentPageIndex(),
            ] : null,
            'draft' => $draft,
            'errors' => [
                'fields' => $fieldErrors,
                'form' => $formErrors,
                'page' => [],
            ],
        ];
    }

    /**
     * @param array<string, mixed> $data
     */
    public function success(array $data, int $status = 200): array
    {
        return [
            'success' => true,
            'data' => $data,
            'meta' => [
                'pluginVersion' => Freeform::getInstance()->version,
            ],
        ];
    }

    /**
     * @param array<string, mixed> $errors
     */
    public function error(string $message, array $errors = [], int $status = 400): array
    {
        return [
            'success' => false,
            'message' => $message,
            'errors' => $errors,
            'meta' => [
                'pluginVersion' => Freeform::getInstance()->version,
            ],
        ];
    }

    /**
     * @return array<string, array<int, string>>
     */
    private function collectFieldErrors(Form $form): array
    {
        $errors = [];
        foreach ($form->getLayout()->getFields() as $field) {
            if ($field->hasErrors()) {
                $errors[$field->getHandle()] = $field->getErrors();
            }
        }

        return $errors;
    }

    /**
     * @return array<string, mixed>
     */
    private function collectFieldValues(Form $form): array
    {
        $values = [];

        $stored = $form->getProperties()->get(Form::PROPERTY_STORED_VALUES, []);
        if (\is_array($stored)) {
            foreach ($stored as $handle => $value) {
                if (\is_string($handle) && '' !== $handle) {
                    $values[$handle] = $value;
                }
            }
        }

        foreach ($form->getLayout()->getFields() as $field) {
            $handle = $field->getHandle();
            if (!$handle || $field instanceof NoStorageInterface) {
                continue;
            }

            $values[$handle] = $field->getValue();
        }

        return $values;
    }
}

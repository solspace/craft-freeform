<?php

namespace Solspace\Freeform\Services\Headless;

use craft\web\Request;
use Solspace\Freeform\Events\Forms\HeadlessRequestEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use yii\base\Event;
use yii\web\BadRequestHttpException;

class HeadlessSubmitService
{
    public function __construct(
        private MultipartRequestParser $multipartParser,
        private HeadlessResponseHelper $responseHelper,
        private HeadlessDraftService $draftService,
        private HeadlessStateService $stateService,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function submit(Form $form, Request $request): array
    {
        $payload = $this->parseRequestPayload($request);

        return $this->submitWithPayload($form, $request, $payload);
    }

    /**
     * Shared submit path for REST and the GraphQL headless adapter.
     *
     * @param array<string, mixed> $payload
     *
     * @return array<string, mixed>
     */
    public function submitWithPayload(
        Form $form,
        Request $request,
        array $payload,
        bool $validateCsrf = true,
        bool $persistSubmission = true,
    ): array {
        if ($validateCsrf) {
            $this->validateCsrf($request, $payload);
        }

        $intent = (string) ($payload['intent'] ?? 'submit');
        $values = \is_array($payload['values'] ?? null) ? $payload['values'] : [];
        $context = \is_array($payload['context'] ?? null) ? $payload['context'] : [];
        $context = $this->draftService->normalizeContext($context);

        $stateToken = $context['stateToken'] ?? null;
        $hasStateToken = \is_string($stateToken) && '' !== $stateToken;
        $stateIsValid = $this->stateService->restore(
            $form,
            $hasStateToken ? $stateToken : null,
        );
        if ($form->isMultiPage() && $hasStateToken && !$stateIsValid) {
            return $this->responseHelper->contextError(
                'context_invalid',
                'Your form session has expired. Please start again.',
            );
        }
        if ($form->isMultiPage() && !$hasStateToken && \in_array($intent, ['back', 'submit'], true)) {
            return $this->responseHelper->contextError(
                'context_required',
                'Your form session is missing. Please start again.',
            );
        }

        $form->registerContext($context);
        $form->getProperties()->set('headlessPayload', $payload);
        $form->getProperties()->set('headlessIntent', $intent);
        $form->setHeadlessPosted(true);
        $this->applyIntent($form, $intent);

        Event::trigger(
            Form::class,
            Form::EVENT_HEADLESS_REQUEST,
            new HeadlessRequestEvent($form, $request, $values, $intent)
        );

        $requestHandled = $form->handleRequest($request);
        // Multipage "Submit Form Early" rules finish the form during a `next`
        // intent (page jump -999). Persist only when finished — normal `next`
        // advances never set finished, so existing multipage flows are unchanged.
        $shouldSubmit = $requestHandled
            && $form->isFormPosted()
            && $form->isValid()
            && !$form->getActions()
            && $form->isFinished()
            && $this->isFinalizingIntent($intent);

        if ($shouldSubmit && $persistSubmission) {
            Freeform::getInstance()->submissions->handleSubmission($form);
            $form->reset();
        }

        $draft = null;
        if ('saveDraft' === $intent) {
            $draft = $this->draftService->save($form, $context);
        }

        $form->persistState();

        return $this->responseHelper->buildSubmitResponse($form, $intent, draft: $draft);
    }

    /**
     * Validate a final submission without persisting it. Payment checkpoints use
     * this to save the exact validated form state before Stripe confirmation.
     *
     * @return array<string, mixed>
     */
    public function validateForPayment(Form $form, Request $request): array
    {
        $payload = $this->parseRequestPayload($request);
        $payload['intent'] = 'submit';

        return $this->submitWithPayload(
            $form,
            $request,
            $payload,
            validateCsrf: true,
            persistSubmission: false,
        );
    }

    /**
     * @return array<string, mixed>
     */
    private function parseRequestPayload(Request $request): array
    {
        $contentType = (string) $request->getContentType();

        if (str_contains($contentType, 'multipart/form-data')) {
            $metadata = $this->multipartParser->parseMetadata($request);
            $this->multipartParser->remapFilesToFieldHandles($request);

            if (null === $metadata) {
                throw new BadRequestHttpException('Invalid or missing _freeform JSON metadata in multipart request.');
            }

            return $metadata;
        }

        $body = $request->getBodyParams();
        if ([] === $body && $request->getIsJson()) {
            $raw = json_decode($request->getRawBody(), true);
            $body = \is_array($raw) ? $raw : [];
        }

        return $body;
    }

    /**
     * @param array<string, mixed> $payload
     */
    private function validateCsrf(Request $request, array $payload): void
    {
        if (!\Craft::$app->getConfig()->getGeneral()->enableCsrfProtection) {
            return;
        }

        $submitted = $request->getHeaders()->get('X-CSRF-Token');
        if (!$submitted) {
            $tokenName = \Craft::$app->getConfig()->getGeneral()->csrfTokenName;
            $submitted = $request->getBodyParam($tokenName) ?? $request->post($tokenName);
        }

        if (!$submitted || !$request->validateCsrfToken($submitted)) {
            throw new BadRequestHttpException('Invalid or missing CSRF token.');
        }
    }

    private function applyIntent(Form $form, string $intent): void
    {
        switch ($intent) {
            case 'back':
                $form->setNavigatingBack(true);

                break;

            case 'next':
                break;

            case 'submit':
                if (!$form->isMultiPage()) {
                    $form->setFinished(true);
                }

                break;

            case 'validate':
            case 'saveDraft':
                break;

            default:
                throw new BadRequestHttpException(\sprintf('Unsupported submit intent "%s".', $intent));
        }
    }

    /**
     * Intents that may create a submission once the form is marked finished.
     * `next` is included so multipage "Submit Form Early" rules can finalize
     * after a page-jump finish; unfinished `next` requests never reach this path.
     */
    private function isFinalizingIntent(string $intent): bool
    {
        return \in_array($intent, ['submit', 'next'], true);
    }
}

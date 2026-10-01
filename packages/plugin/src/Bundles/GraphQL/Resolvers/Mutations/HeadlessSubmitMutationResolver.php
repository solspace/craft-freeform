<?php

namespace Solspace\Freeform\Bundles\GraphQL\Resolvers\Mutations;

use craft\gql\base\Resolver;
use GraphQL\Error\Error;
use GraphQL\Type\Definition\ResolveInfo;
use Solspace\Freeform\Bundles\GraphQL\GqlPermissions;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Services\Headless\HeadlessAccessService;
use Solspace\Freeform\Services\Headless\HeadlessSubmitService;
use yii\web\BadRequestHttpException;
use yii\web\ForbiddenHttpException;
use yii\web\NotFoundHttpException;

class HeadlessSubmitMutationResolver extends Resolver
{
    public static function resolve(mixed $source, array $arguments, mixed $context, ResolveInfo $resolveInfo): array
    {
        $handle = (string) ($arguments['handle'] ?? '');
        if ('' === $handle) {
            throw new Error('Form handle is required.');
        }

        $form = Freeform::getInstance()->forms->getFormByHandle($handle);
        if (!$form) {
            throw new Error(\sprintf('Form "%s" not found.', $handle));
        }

        if (!GqlPermissions::canCreateAllSubmissions() && !GqlPermissions::canCreateSubmissions($form->getUid())) {
            throw new Error('Unable to create Freeform submissions.');
        }

        try {
            \Craft::$container->get(HeadlessAccessService::class)->requireSubmitAccess($form);
        } catch (ForbiddenHttpException|NotFoundHttpException $e) {
            throw new Error($e->getMessage());
        }

        $values = $arguments['values'] ?? [];
        $meta = $arguments['meta'] ?? [];
        $contextPayload = $arguments['context'] ?? [];

        if (null === $values) {
            $values = [];
        }
        if (null === $meta) {
            $meta = [];
        }
        if (null === $contextPayload) {
            $contextPayload = [];
        }

        if (!\is_array($values)) {
            throw new Error('Argument "values" must be a JSON object.');
        }
        if (!\is_array($meta)) {
            throw new Error('Argument "meta" must be a JSON object.');
        }
        if (!\is_array($contextPayload)) {
            throw new Error('Argument "context" must be a JSON object.');
        }

        $payload = [
            'intent' => (string) ($arguments['intent'] ?? 'submit'),
            'values' => $values,
            'meta' => $meta,
            'context' => $contextPayload,
        ];

        $request = \Craft::$app->getRequest();
        $csrfToken = $arguments['csrfToken'] ?? null;
        if (\is_string($csrfToken) && '' !== $csrfToken) {
            $request->getHeaders()->set('X-CSRF-Token', $csrfToken);
        }

        // Craft GraphQL is typically authenticated via schema token; CSRF cookies are optional.
        // When a csrfToken is provided, enforce it; otherwise skip cookie CSRF for this adapter.
        $validateCsrf = \is_string($csrfToken) && '' !== $csrfToken;

        try {
            return \Craft::$container->get(HeadlessSubmitService::class)
                ->submitWithPayload($form, $request, $payload, $validateCsrf)
            ;
        } catch (BadRequestHttpException $e) {
            throw new Error($e->getMessage());
        }
    }
}

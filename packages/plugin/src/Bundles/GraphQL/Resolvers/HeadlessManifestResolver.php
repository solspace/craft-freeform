<?php

namespace Solspace\Freeform\Bundles\GraphQL\Resolvers;

use craft\gql\base\Resolver;
use GraphQL\Error\Error;
use GraphQL\Type\Definition\ResolveInfo;
use Solspace\Freeform\Bundles\GraphQL\GqlPermissions;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Services\Headless\HeadlessAccessService;
use Solspace\Freeform\Services\Headless\ManifestService;
use yii\web\ForbiddenHttpException;
use yii\web\NotFoundHttpException;

class HeadlessManifestResolver extends Resolver
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

        if (!GqlPermissions::canQueryAllForms() && !GqlPermissions::canQueryForm($form->getUid())) {
            throw new Error('Unable to query Freeform forms.');
        }

        try {
            \Craft::$container->get(HeadlessAccessService::class)->requireManifestAccess($form);
        } catch (ForbiddenHttpException|NotFoundHttpException $e) {
            throw new Error($e->getMessage());
        }

        return \Craft::$container->get(ManifestService::class)->buildPublicManifest($form);
    }
}

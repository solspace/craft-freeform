<?php

namespace Solspace\Freeform\Bundles\GraphQL\Resolvers;

use craft\elements\Entry;
use craft\gql\base\Resolver;
use GraphQL\Type\Definition\ResolveInfo;
use Solspace\Freeform\Bundles\GraphQL\GqlPermissions;
use Solspace\Freeform\Freeform;

class FormResolver extends Resolver
{
    public static function resolve($source, array $arguments, $context, ResolveInfo $resolveInfo)
    {
        $arguments = self::getArguments($arguments);

        return Freeform::getInstance()->forms->getResolvedForms($arguments);
    }

    public static function resolveOne($source, array $arguments, $context, ResolveInfo $resolveInfo)
    {
        $arguments = self::getArguments($arguments);
        $arguments['limit'] = 1;

        if ($source instanceof Entry) {
            return $source->getFieldValue($resolveInfo->fieldName);
        }

        $forms = Freeform::getInstance()->forms->getResolvedForms($arguments);
        $form = reset($forms);

        return $form ?: null;
    }

    private static function getArguments(array $arguments)
    {
        $formUids = GqlPermissions::allowedFormUids();
        if ($formUids) {
            $arguments['uid'] = $formUids;
        }

        return $arguments;
    }
}

<?php

namespace Solspace\Freeform\Bundles\GraphQL\Resolvers;

use craft\base\ElementInterface;
use craft\gql\base\Resolver;
use GraphQL\Type\Definition\ResolveInfo;
use Solspace\Freeform\Bundles\GraphQL\GqlPermissions;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;

class FormResolver extends Resolver
{
    public static function resolve($source, array $arguments, $context, ResolveInfo $resolveInfo): array
    {
        $arguments = self::applyFormPermissions($arguments);
        if (false === $arguments) {
            return []; // NONE allowed
        }

        return Freeform::getInstance()->forms->getResolvedForms($arguments);
    }

    public static function resolveOne($source, array $arguments, $context, ResolveInfo $resolveInfo): ?Form
    {
        $arguments = self::applyFormPermissions($arguments);
        if (false === $arguments) {
            return null; // NONE allowed
        }

        $arguments['limit'] = 1;

        if ($source instanceof ElementInterface) {
            return $source->getFieldValue($resolveInfo->fieldName);
        }

        $forms = Freeform::getInstance()->forms->getResolvedForms($arguments);
        $form = reset($forms);

        return $form ?: null;
    }

    /**
     * Returns filtered $arguments, or false if no forms are allowed.
     */
    private static function applyFormPermissions(array $arguments): array|false
    {
        $allowedFormUids = GqlPermissions::allowedFormUids();

        if ([] === $allowedFormUids) {
            // NONE: explicitly deny by returning no results
            return false;
        }

        if (\is_array($allowedFormUids)) {
            // SOME: constrain by UID list
            $arguments['uid'] = $allowedFormUids;
        }

        // ALL (null): leave $arguments untouched
        return $arguments;
    }
}

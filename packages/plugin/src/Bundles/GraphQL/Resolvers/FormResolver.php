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

        // Resolve via Entry field
        if ($source instanceof ElementInterface) {
            $storedForm = $source->getFieldValue($resolveInfo->fieldName);

            if (!$storedForm instanceof Form) {
                return null;
            }

            // Force resolution through the canonical pipeline
            $arguments['id'] = [$storedForm->getId()];
            $arguments['limit'] = 1;

            // Always call getResolvedForms to ensure site context
            $forms = Freeform::getInstance()->forms->getResolvedForms($arguments);

            return reset($forms) ?: null;
        }

        // Normal freeform { form } resolver
        $arguments['limit'] = 1;

        // Always call getResolvedForms to ensure site context
        $forms = Freeform::getInstance()->forms->getResolvedForms($arguments);

        return reset($forms) ?: null;
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

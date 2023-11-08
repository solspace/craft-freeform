<?php

namespace Solspace\Freeform\Bundles\GraphQL\Resolvers;

use craft\gql\base\Resolver;
use GraphQL\Type\Definition\ResolveInfo;
use Solspace\Freeform\Fields\MailingListField;

class MailingListNameResolver extends Resolver
{
    public static function resolve($source, array $arguments, $context, ResolveInfo $resolveInfo): array
    {
        $mailingLists = [];

        $mailingListFields = $source->getLayout()->getFields(MailingListField::class);

        if ($mailingListFields) {
            foreach ($mailingListFields as $mailingListField) {
                $mailingLists[] = $mailingListField->getContentGqlHandle();
            }
        }

        return $mailingLists;
    }
}

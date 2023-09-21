<?php

namespace Solspace\Freeform\Bundles\GraphQL\Resolvers;

use craft\gql\base\Resolver;
use GraphQL\Type\Definition\ResolveInfo;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Form\Layout\Row;

class FieldResolver extends Resolver
{
    public static function resolve($source, array $arguments, $context, ResolveInfo $resolveInfo): array
    {
        // @var FieldCollection $fields
        if ($source instanceof Form) {
            $fields = $source->getLayout()->getFields();
        } elseif ($source instanceof Row) {
            $fields = $source->getFields();
        } else {
            $fields = [];
        }

        $fields = iterator_to_array($fields);

        $ids = $arguments['id'] ?? [];
        $handles = $arguments['handle'] ?? [];
        foreach ($fields as $index => $field) {
            if ($ids && !\in_array($field->getId(), $ids)) {
                unset($fields[$index]);
            }
            if ($handles && !\in_array($field->getHandle(), $handles)) {
                unset($fields[$index]);
            }
        }

        return $fields;
    }
}

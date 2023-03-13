<?php

namespace Solspace\Freeform\Bundles\GraphQL\Resolvers;

use craft\gql\base\Resolver;
use GraphQL\Type\Definition\ResolveInfo;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Form\Layout\Row;

class FieldResolver extends Resolver
{
    public static function resolve($source, array $arguments, $context, ResolveInfo $resolveInfo): mixed
    {
        // @var AbstractField[] $fields
        if ($source instanceof Form) {
            $fields = $source->getLayout()->getFields();
        } elseif ($source instanceof Row) {
            $fields = $source->getFields();
        } else {
            $fields = [];
        }

        $ids = $arguments['id'] ?? [];
        $hashes = $arguments['hash'] ?? [];
        $handles = $arguments['handle'] ?? [];
        foreach ($fields as $index => $field) {
            if ($ids && !\in_array($field->getId(), $ids, false)) {
                unset($fields[$index]);
            }
            if ($handles && !\in_array($field->getHandle(), $handles, false)) {
                unset($fields[$index]);
            }
            if ($hashes && !\in_array($field->getHash(), $hashes, false)) {
                unset($fields[$index]);
            }
        }

        return array_values($fields);
    }
}

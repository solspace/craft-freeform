<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types\Generators;

use craft\gql\base\Generator;
use craft\gql\base\GeneratorInterface;
use craft\gql\base\SingleGeneratorInterface;
use craft\gql\GqlEntityRegistry;
use craft\helpers\Gql;
use Solspace\Freeform\Bundles\GraphQL\GqlPermissions;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\SubmissionInterface;
use Solspace\Freeform\Bundles\GraphQL\Types\SubmissionType;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;

class SubmissionGenerator extends Generator implements GeneratorInterface, SingleGeneratorInterface
{
    public static array $inputFields = [];

    public static array $resolverFields = [];

    public static function getName(): string
    {
        return 'FreeformSubmissionType';
    }

    public static function generateTypes(mixed $context = null): array
    {
        $types = [];

        $forms = Freeform::getInstance()->forms->getAllForms();

        foreach ($forms as $form) {
            $requiredContexts = Submission::gqlScopesByContext($form);

            if (!Gql::isSchemaAwareOf($requiredContexts) && !Gql::isSchemaAwareOf(GqlPermissions::CATEGORY_SUBMISSIONS.'.all')) {
                continue;
            }

            $type = self::generateType($form);

            $types[$type->name] = $type;
        }

        return $types;
    }

    public static function generateType(mixed $context): mixed
    {
        $typeName = Submission::gqlTypeNameByContext($context);

        if ($type = GqlEntityRegistry::getEntity($typeName)) {
            return $type;
        }

        self::setFields($context);

        $fields = array_merge(self::getResolverFields(), SubmissionInterface::getFieldDefinitions());
        $fields = \Craft::$app->getGql()->prepareFieldDefinitions($fields, $typeName);

        return GqlEntityRegistry::createEntity($typeName, new SubmissionType([
            'name' => $typeName,
            'fields' => function () use ($fields) {
                return $fields;
            },
        ]));
    }

    public static function setFields(Form $form): void
    {
        self::$inputFields = [];
        self::$resolverFields = [];

        foreach ($form->getLayout()->getFields() as $field) {
            if ($field->includeInGqlSchema()) {
                self::$inputFields[] = $field;

                self::$resolverFields[$field->getContentGqlHandle()] = $field->getContentGqlType();
            }
        }
    }

    public static function getInputFields(): array
    {
        return self::$inputFields;
    }

    public static function getResolverFields(): array
    {
        return self::$resolverFields;
    }
}

<?php

namespace Solspace\Freeform\Bundles\GraphQL\Types\Inputs;

use craft\gql\GqlEntityRegistry;
use GraphQL\Type\Definition\InputObjectType;
use Solspace\Freeform\Bundles\GraphQL\Arguments\SubmissionReCaptchaArguments;

class SubmissionReCaptchaInputType extends InputObjectType
{
    public static function getName(): string
    {
        return 'FreeformSubmissionReCaptchaInputType';
    }

    public static function getType(): mixed
    {
        if ($inputType = GqlEntityRegistry::getEntity(self::getName())) {
            return $inputType;
        }

        $fields = \Craft::$app->getGql()->prepareFieldDefinitions(
            SubmissionReCaptchaArguments::getArguments(),
            self::getName()
        );

        return GqlEntityRegistry::createEntity(self::getName(), new self([
            'name' => self::getName(),
            'fields' => function () use ($fields) {
                return $fields;
            },
        ]));
    }
}

<?php

namespace Solspace\Freeform\Bundles\GraphQL\Interfaces\SimpleObjects;

use Solspace\Freeform\Bundles\GraphQL\Arguments\ReCaptchaArguments;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\AbstractInterface;
use Solspace\Freeform\Bundles\GraphQL\Types\Generators\SimpleObjects\ReCaptchaGenerator;
use Solspace\Freeform\Bundles\GraphQL\Types\SimpleObjects\ReCaptchaType;

class ReCaptchaInterface extends AbstractInterface
{
    public static function getName(): string
    {
        return 'FreeformReCaptchaInterface';
    }

    public static function getTypeClass(): string
    {
        return ReCaptchaType::class;
    }

    public static function getGeneratorClass(): string
    {
        return ReCaptchaGenerator::class;
    }

    public static function getDescription(): string
    {
        return 'Freeform ReCaptcha GraphQL Interface';
    }

    public static function getFieldDefinitions(): array
    {
        return \Craft::$app->gql->prepareFieldDefinitions(
            ReCaptchaArguments::getArguments(),
            static::getName(),
        );
    }
}

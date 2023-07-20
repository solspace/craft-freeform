<?php

namespace Solspace\Freeform\Bundles\GraphQL\Interfaces\SimpleObjects;

use Solspace\Freeform\Bundles\GraphQL\Arguments\SubmissionReCaptchaArguments;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\AbstractInterface;
use Solspace\Freeform\Bundles\GraphQL\Types\Generators\SimpleObjects\SubmissionReCaptchaGenerator;
use Solspace\Freeform\Bundles\GraphQL\Types\SimpleObjects\SubmissionReCaptchaType;

class SubmissionReCaptchaInterface extends AbstractInterface
{
    public static function getName(): string
    {
        return 'FreeformSubmissionReCaptchaInterface';
    }

    public static function getTypeClass(): string
    {
        return SubmissionReCaptchaType::class;
    }

    public static function getGeneratorClass(): string
    {
        return SubmissionReCaptchaGenerator::class;
    }

    public static function getDescription(): string
    {
        return 'Freeform Submission ReCaptcha GraphQL Interface';
    }

    public static function getFieldDefinitions(): array
    {
        return \Craft::$app->gql->prepareFieldDefinitions(
            SubmissionReCaptchaArguments::getArguments(),
            static::getName(),
        );
    }
}

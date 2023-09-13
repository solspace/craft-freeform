<?php

namespace Solspace\Freeform\Bundles\GraphQL\Interfaces\SimpleObjects;

use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\AbstractInterface;
use Solspace\Freeform\Bundles\GraphQL\Types\Generators\SimpleObjects\FormCaptchaGenerator;
use Solspace\Freeform\Bundles\GraphQL\Types\SimpleObjects\FormCaptchaType;

class FormCaptchaInterface extends AbstractInterface
{
    public static function getName(): string
    {
        return 'FreeformFormCaptchaInterface';
    }

    public static function getTypeClass(): string
    {
        return FormCaptchaType::class;
    }

    public static function getGeneratorClass(): string
    {
        return FormCaptchaGenerator::class;
    }

    public static function getDescription(): string
    {
        return 'Freeform Form Captcha GraphQL Interface';
    }

    public static function getFieldDefinitions(): array
    {
        return \Craft::$app->gql->prepareFieldDefinitions([
            'name' => [
                'name' => 'name',
                'type' => Type::string(),
                'description' => 'The forms GraphQL mutation name for submissions',
            ],
            'handle' => [
                'name' => 'handle',
                'type' => Type::string(),
                'description' => 'The forms GraphQL mutation handle for submissions',
            ],
            'enabled' => [
                'name' => 'enabled',
                'type' => Type::boolean(),
                'description' => 'Is Captcha enabled for this form',
            ],
        ], static::getName());
    }
}

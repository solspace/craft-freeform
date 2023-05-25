<?php

namespace Solspace\Freeform\Bundles\GraphQL\Interfaces;

use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Arguments\FieldArguments;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\SimpleObjects\CsrfTokenInterface;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\SimpleObjects\HoneypotInterface;
use Solspace\Freeform\Bundles\GraphQL\Resolvers\CsrfTokenResolver;
use Solspace\Freeform\Bundles\GraphQL\Resolvers\FieldResolver;
use Solspace\Freeform\Bundles\GraphQL\Resolvers\HoneypotResolver;
use Solspace\Freeform\Bundles\GraphQL\Resolvers\PageResolver;
use Solspace\Freeform\Bundles\GraphQL\Types\FormType;
use Solspace\Freeform\Bundles\GraphQL\Types\Generators\FormGenerator;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Fields\RecaptchaField;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\Form;

class FormInterface extends AbstractInterface
{
    public static function getName(): string
    {
        return 'FreeformFormInterface';
    }

    public static function getTypeClass(): string
    {
        return FormType::class;
    }

    public static function getGeneratorClass(): string
    {
        return FormGenerator::class;
    }

    public static function getDescription(): string
    {
        return 'Freeform Form GraphQL Interface';
    }

    public static function getFieldDefinitions(): array
    {
        return \Craft::$app->gql->prepareFieldDefinitions([
            'id' => [
                'name' => 'id',
                'type' => Type::int(),
                'description' => "The form's ID",
            ],
            'uid' => [
                'name' => 'uid',
                'type' => Type::string(),
                'description' => "The form's UID",
            ],
            'name' => [
                'name' => 'name',
                'type' => Type::string(),
                'description' => "The form's name",
            ],
            'handle' => [
                'name' => 'handle',
                'type' => Type::string(),
                'description' => "The form's handle",
            ],
            'color' => [
                'name' => 'color',
                'type' => Type::string(),
                'description' => "The form's color hex",
            ],
            'description' => [
                'name' => 'description',
                'type' => Type::string(),
                'description' => "The form's handle",
            ],
            'returnUrl' => [
                'name' => 'returnUrl',
                'type' => Type::string(),
                'description' => "The form's return URL",
            ],
            'storeData' => [
                'name' => 'storeData',
                'type' => Type::boolean(),
                'description' => 'Whether the form stores submissions or not',
            ],
            'defaultStatus' => [
                'name' => 'defaultStatus',
                'type' => Type::int(),
                'description' => "The form's default status ID",
            ],
            'formTemplate' => [
                'name' => 'formTemplate',
                'type' => Type::string(),
                'description' => "The form's formatting template filename",
            ],
            'hash' => [
                'name' => 'hash',
                'type' => Type::string(),
                'description' => "The form's hash needed to submit forms",
            ],
            'submissionTitleFormat' => [
                'name' => 'submissionTitleFormat',
                'type' => Type::string(),
                'description' => 'Title format used for new submission titles',
            ],
            'submissionMutationName' => [
                'name' => 'submissionMutationName',
                'type' => Type::string(),
                'description' => 'The forms GraphQL mutation name for submissions',
                'resolve' => function ($source) {
                    return Submission::gqlMutationNameByContext($source);
                },
            ],
            'extraPostUrl' => [
                'name' => 'extraPostUrl',
                'type' => Type::string(),
                'description' => 'An URL that will get a POST call with the submitted data',
            ],
            'extraPostTriggerPhrase' => [
                'name' => 'extraPostTriggerPhrase',
                'type' => Type::string(),
                'description' => 'A keyword or phrase Freeform should check for in the output of the external POST URL to know if and when there’s an error to log, e.g. ‘error’ or ‘an error occurred’.',
            ],
            'ipCollectingEnabled' => [
                'name' => 'ipCollectingEnabled',
                'type' => Type::boolean(),
                'description' => 'Are the IP addresses being stored',
            ],
            'ajaxEnabled' => [
                'name' => 'ajaxEnabled',
                'type' => Type::boolean(),
                'description' => 'Is the ajax enabled for this form',
            ],
            'showSpinner' => [
                'name' => 'showSpinner',
                'type' => Type::boolean(),
                'description' => 'Should the submit button show a spinner when submitting',
            ],
            'showLoadingText' => [
                'name' => 'showLoadingText',
                'type' => Type::boolean(),
                'description' => 'Should the submit button change the button label while submitting',
            ],
            'loadingText' => [
                'name' => 'loadingText',
                'type' => Type::string(),
                'description' => 'The submit button loading label text',
            ],
            'gtmEnabled' => [
                'name' => 'gtmEnabled',
                'type' => Type::boolean(),
                'description' => 'Is Google Tag Manager enabled',
            ],
            'gtmId' => [
                'name' => 'gtmId',
                'type' => Type::string(),
                'description' => 'The Google Tag Manager ID',
            ],
            'gtmEventName' => [
                'name' => 'gtmEventName',
                'type' => Type::string(),
                'description' => 'The name of the Event that will be added to Google Tag Manager\'s data layer ',
            ],
            'recaptchaEnabled' => [
                'name' => 'recaptchaEnabled',
                'type' => Type::boolean(),
                'description' => 'Should Captchas be enabled for this form',
            ],
            'recaptchaHandle' => [
                'name' => 'recaptchaHandle',
                'type' => Type::string(),
                'description' => 'The Recaptcha handle for this form',
                'resolve' => function ($source) {
                    if ($source instanceof Form) {
                        if (!Freeform::getInstance()->settings->getSettingsModel()->recaptchaEnabled) {
                            return null;
                        }

                        // or if the form has the property disableRecaptcha set to true, then bail
                        if ($source->getPropertyBag()->get(Form::DATA_DISABLE_RECAPTCHA)) {
                            return null;
                        }

                        $fields = $source->getLayout()->getFields(RecaptchaField::class);
                        $field = reset($fields);
                        if (!$field) {
                            return [];
                        }

                        return $field->getHandle();
                    }

                    return null;
                },
            ],
            'honeypot' => [
                'name' => 'honeypot',
                'type' => HoneypotInterface::getType(),
                'resolve' => HoneypotResolver::class.'::resolve',
                'description' => 'A fresh honeypot instance',
            ],
            'csrfToken' => [
                'name' => 'csrfToken',
                'type' => CsrfTokenInterface::getType(),
                'resolve' => CsrfTokenResolver::class.'::resolve',
                'description' => 'A fresh csrf token',
            ],
            // Layout
            'pages' => [
                'name' => 'pages',
                'type' => Type::listOf(PageInterface::getType()),
                'resolve' => PageResolver::class.'::resolve',
                'description' => 'The form’s pages.',
            ],
            'fields' => [
                'name' => 'fields',
                'type' => Type::listOf(FieldInterface::getType()),
                'resolve' => FieldResolver::class.'::resolve',
                'args' => FieldArguments::getArguments(),
                'description' => "Form's fields",
            ],
        ], static::getName());
    }
}

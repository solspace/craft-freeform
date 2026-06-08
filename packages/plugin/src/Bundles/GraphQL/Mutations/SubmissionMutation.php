<?php

namespace Solspace\Freeform\Bundles\GraphQL\Mutations;

use craft\errors\GqlException;
use craft\gql\base\ElementMutationResolver;
use craft\gql\base\Mutation;
use CraftCms\Cms\Gql\Resolvers\MutationResolver;
use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Arguments\Inputs\CaptchaInputArguments;
use Solspace\Freeform\Bundles\GraphQL\Arguments\Inputs\CsrfTokenInputArguments;
use Solspace\Freeform\Bundles\GraphQL\Arguments\Inputs\FormPropertiesInputsArguments;
use Solspace\Freeform\Bundles\GraphQL\Arguments\Inputs\HoneypotInputArguments;
use Solspace\Freeform\Bundles\GraphQL\Arguments\Inputs\JavascriptTestInputArguments;
use Solspace\Freeform\Bundles\GraphQL\Arguments\Inputs\UrlParameterTrackingInputArguments;
use Solspace\Freeform\Bundles\GraphQL\GqlPermissions;
use Solspace\Freeform\Bundles\GraphQL\Resolvers\Mutations\SubmissionMutationResolver;
use Solspace\Freeform\Bundles\GraphQL\Types\Generators\SubmissionGenerator;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Freeform;
use yii\base\InvalidConfigException;

class SubmissionMutation extends Mutation
{
    /**
     * @throws GqlException
     * @throws InvalidConfigException
     */
    public static function getMutations(): array
    {
        $mutations = [];

        $forms = Freeform::getInstance()->forms->getAllForms();

        foreach ($forms as $form) {
            if (GqlPermissions::canCreateAllSubmissions() || GqlPermissions::canCreateSubmissions($form->getUid())) {
                $mutationName = Submission::gqlMutationNameByContext($form);
                $mutationType = SubmissionGenerator::generateType($form);

                $mutationResolver = \Craft::createObject(SubmissionMutationResolver::class);
                $mutationResolver->setResolutionData('form', $form);

                $mutationInputFields = SubmissionGenerator::getInputFields();
                self::prepareResolver($mutationResolver, $mutationInputFields);

                HoneypotInputArguments::setForm($form);
                CaptchaInputArguments::setForm($form);
                JavascriptTestInputArguments::setForm($form);
                UrlParameterTrackingInputArguments::setForm($form);

                $formPropertiesInputArguments = FormPropertiesInputsArguments::getArguments();
                $csrfInputArguments = CsrfTokenInputArguments::getArguments();
                $honeypotInputArguments = HoneypotInputArguments::getArguments();
                $captchaInputArguments = CaptchaInputArguments::getArguments();
                $javascriptTestInputArguments = JavascriptTestInputArguments::getArguments();
                $urlParameterTrackingInputArguments = UrlParameterTrackingInputArguments::getArguments();

                $mutationArguments = array_merge(
                    $formPropertiesInputArguments,
                    $csrfInputArguments,
                    $honeypotInputArguments,
                    $captchaInputArguments,
                    $javascriptTestInputArguments,
                    $urlParameterTrackingInputArguments,
                    $mutationResolver->getResolutionData(ElementMutationResolver::CONTENT_FIELD_KEY)
                );

                $mutations[] = [
                    'name' => $mutationName,
                    'type' => $mutationType,
                    'args' => $mutationArguments,
                    'resolve' => [$mutationResolver, 'saveSubmission'],
                    'description' => 'Save the "'.$form->getName().'" submission.',
                ];
            }
        }

        return $mutations;
    }

    protected static function prepareResolver(MutationResolver $resolver, array $contentFields): void
    {
        $fieldList = [];

        foreach ($contentFields as $contentField) {
            $contentFieldType = $contentField->getContentGqlMutationArgumentType();
            $handle = $contentField->getContentGqlHandle();

            // CASE 1: Field opts out (ConfirmationField, HTML, etc)
            if (!$contentFieldType) {
                continue;
            }

            // CASE 2: Field returns a GraphQL Type
            if ($contentFieldType instanceof Type) {
                $fieldList[$handle] = [
                    'type' => $contentFieldType,
                ];

                continue;
            }

            // CASE 3: Field returns a config array — only accept valid ones
            if (\is_array($contentFieldType) && isset($contentFieldType['type'])) {
                $fieldList[$handle] = $contentFieldType;

                if (!empty($contentFieldType['normalizeValue'])) {
                    $resolver->setValueNormalizer($handle, $contentFieldType['normalizeValue']);
                }
            }

            // else: invalid / empty array → skip
        }

        $resolver->setResolutionData(ElementMutationResolver::CONTENT_FIELD_KEY, $fieldList);
    }
}

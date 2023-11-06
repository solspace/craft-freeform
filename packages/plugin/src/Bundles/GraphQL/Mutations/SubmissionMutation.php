<?php

namespace Solspace\Freeform\Bundles\GraphQL\Mutations;

use craft\errors\GqlException;
use craft\gql\base\ElementMutationResolver;
use craft\gql\base\Mutation;
use craft\gql\base\MutationResolver;
use Solspace\Freeform\Bundles\GraphQL\Arguments\Inputs\CsrfTokenInputArguments;
use Solspace\Freeform\Bundles\GraphQL\Arguments\Inputs\HoneypotInputArguments;
use Solspace\Freeform\Bundles\GraphQL\Arguments\Inputs\SubmissionReCaptchaInputArguments;
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

        $formModels = Freeform::getInstance()->forms->getAllForms();

        foreach ($formModels as $formModel) {
            if (GqlPermissions::canCreateAllSubmissions() || GqlPermissions::canCreateSubmissions($formModel->uid)) {
                $mutationName = Submission::gqlMutationNameByContext($formModel);
                $mutationType = SubmissionGenerator::generateType($formModel);

                $mutationResolver = \Craft::createObject(SubmissionMutationResolver::class);
                $mutationResolver->setResolutionData('formModel', $formModel);

                $mutationInputFields = SubmissionGenerator::getInputFields();
                static::prepareResolver($mutationResolver, $mutationInputFields);

                SubmissionReCaptchaInputArguments::setForm($formModel->getForm());

                $csrfInputArguments = CsrfTokenInputArguments::getArguments();
                $honeypotInputArguments = HoneypotInputArguments::getArguments();
                $reCaptchaInputArguments = SubmissionReCaptchaInputArguments::getArguments();

                $mutationArguments = array_merge(
                    $csrfInputArguments,
                    $honeypotInputArguments,
                    $reCaptchaInputArguments,
                    $mutationResolver->getResolutionData(ElementMutationResolver::CONTENT_FIELD_KEY)
                );

                $mutations[] = [
                    'name' => $mutationName,
                    'type' => $mutationType,
                    'args' => $mutationArguments,
                    'resolve' => [$mutationResolver, 'saveSubmission'],
                    'description' => 'Save the "'.$formModel->name.'" submission.',
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
            $fieldList[$handle] = $contentFieldType;
            $configArray = \is_array($contentFieldType) ? $contentFieldType : $contentFieldType->config;

            if (\is_array($configArray) && !empty($configArray['normalizeValue'])) {
                $resolver->setValueNormalizer($handle, $configArray['normalizeValue']);
            }
        }

        $resolver->setResolutionData(ElementMutationResolver::CONTENT_FIELD_KEY, $fieldList);
    }
}

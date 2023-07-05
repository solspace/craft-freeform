<?php

namespace Solspace\Freeform\FieldTypes;

use craft\base\ElementInterface;
use craft\base\Field;
use craft\helpers\Gql as GqlHelper;
use craft\services\Gql as GqlService;
use GraphQL\Type\Definition\Type;
use Solspace\Freeform\Bundles\GraphQL\Arguments\FormArguments;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\FormInterface;
use Solspace\Freeform\Bundles\GraphQL\Resolvers\FormResolver;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Models\FormModel;
use yii\db\Schema;

class FormFieldType extends Field
{
    public static function displayName(): string
    {
        return Freeform::t('Freeform Form');
    }

    public static function defaultSelectionLabel(): string
    {
        return Freeform::t('Add a form');
    }

    public function getContentColumnType(): string
    {
        return Schema::TYPE_INTEGER;
    }

    public function getInputHtml($value, ElementInterface $element = null): string
    {
        $freeform = Freeform::getInstance();

        $forms = $freeform->forms->getAllForms(true);

        if ($freeform->settings->isFormFieldShowOnlyAllowedForms()) {
            $allowedIds = $freeform->forms->getAllowedFormIds();
        } else {
            $allowedIds = $freeform->forms->getAllFormIds();
        }

        $formOptions = ['' => Freeform::t('Select a form')];

        foreach ($forms as $form) {
            if (!\is_array($form) && !$form instanceof FormModel) {
                continue;
            }

            if (\is_array($form)) {
                $form = (object) $form;
            }

            if (\in_array($form->id, $allowedIds, false)) {
                $formOptions[(int) $form->id] = $form->name;
            }
        }

        return \Craft::$app->view->renderTemplate(
            'freeform/_components/fieldTypes/form',
            [
                'name' => $this->handle,
                'forms' => $forms,
                'formOptions' => $formOptions,
                'selectedForm' => $value instanceof Form ? $value->getId() : null,
            ]
        );
    }

    public function serializeValue(mixed $value, ElementInterface $element = null): mixed
    {
        if ($value instanceof Form) {
            return $value->getId();
        }

        return parent::serializeValue($value, $element);
    }

    public function normalizeValue(mixed $value, ElementInterface $element = null): mixed
    {
        if ($value instanceof Form) {
            return $value;
        }

        $form = Freeform::getInstance()->forms->getFormById((int) $value);

        if ($form) {
            return $form->getForm();
        }

        return null;
    }

    public function getContentGqlType(): Type|array
    {
        $gqlType = [
            'name' => $this->handle,
            'type' => FormInterface::getType(),
            'args' => FormArguments::getArguments(),
            'resolve' => FormResolver::class.'::resolveOne',
        ];

        if (version_compare(\Craft::$app->getVersion(), '3.6', '>=')) {
            $gqlType['complexity'] = GqlHelper::relatedArgumentComplexity(GqlService::GRAPHQL_COMPLEXITY_EAGER_LOAD);
        }

        return $gqlType;
    }

    protected function optionsSettingLabel(): string
    {
        return Freeform::t('Freeform Options');
    }
}

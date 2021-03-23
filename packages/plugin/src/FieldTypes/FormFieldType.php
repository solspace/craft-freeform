<?php

namespace Solspace\Freeform\FieldTypes;

use craft\base\ElementInterface;
use craft\base\Field;
use craft\helpers\Gql as GqlHelper;
use craft\services\Gql as GqlService;
use Solspace\Freeform\Bundles\GraphQL\Arguments\FormArguments;
use Solspace\Freeform\Bundles\GraphQL\Interfaces\FormInterface;
use Solspace\Freeform\Bundles\GraphQL\Resolvers\FormResolver;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Models\FormModel;
use yii\db\Schema;

class FormFieldType extends Field
{
    /**
     * {@inheritDoc}
     */
    public static function displayName(): string
    {
        return Freeform::t('Freeform Form');
    }

    /**
     * {@inheritDoc}
     */
    public static function defaultSelectionLabel(): string
    {
        return Freeform::t('Add a form');
    }

    /**
     * {@inheritDoc}
     */
    public function getContentColumnType(): string
    {
        return Schema::TYPE_INTEGER;
    }

    /**
     * {@inheritDoc IFieldType::getInputHtml()}.
     *
     * @param mixed $value
     */
    public function getInputHtml($value, ElementInterface $element = null): string
    {
        $forms = Freeform::getInstance()->forms->getAllForms();

        $formOptions = [
            '' => Freeform::t('Select a form'),
        ];

        /** @var FormModel $form */
        foreach ($forms as $form) {
            if (\is_array($form)) {
                $formOptions[(int) $form['id']] = $form['name'];
            } elseif ($form instanceof FormModel) {
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

    /**
     * {@inheritDoc}
     */
    public function serializeValue($value, ElementInterface $element = null)
    {
        if ($value instanceof Form) {
            return $value->getId();
        }

        return parent::serializeValue($value, $element);
    }

    /**
     * {@inheritDoc}
     */
    public function normalizeValue($value, ElementInterface $element = null)
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

    public function getContentGqlType()
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

    /**
     * {@inheritdoc}
     */
    protected function optionsSettingLabel(): string
    {
        return Freeform::t('Freeform Options');
    }
}

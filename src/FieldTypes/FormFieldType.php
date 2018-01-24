<?php

namespace Solspace\Freeform\FieldTypes;

use craft\base\ElementInterface;
use craft\base\Field;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Models\FormModel;
use yii\db\Schema;

class FormFieldType extends Field
{
    /**
     * @inheritDoc
     */
    public static function displayName(): string
    {
        return Freeform::t('Freeform Form');
    }

    /**
     * @inheritDoc
     */
    public static function defaultSelectionLabel(): string
    {
        return Freeform::t('Add a form');
    }

    /**
     * @inheritDoc
     */
    public function getContentColumnType(): string
    {
        return Schema::TYPE_INTEGER;
    }

    /**
     * @inheritdoc
     */
    protected function optionsSettingLabel(): string
    {
        return Freeform::t('Freeform Options');
    }

    /**
     * @inheritDoc IFieldType::getInputHtml()
     *
     * @param mixed $value
     * @param ElementInterface|null $element
     *
     * @return string
     */
    public function getInputHtml($value, ElementInterface $element = null): string
    {
        $forms = Freeform::getInstance()->forms->getAllForms();

        $formOptions = [
            '' => Freeform::t('Select a form'),
        ];

        /** @var FormModel $form */
        foreach ($forms as $form) {
            if (is_array($form)) {
                $formOptions[$form['id']] = $form['name'];
            } else if ($form instanceof FormModel) {
                $formOptions[$form->id] = $form->name;
            }
        }

        return \Craft::$app->view->renderTemplate(
            'freeform/_components/fieldTypes/form',
            [
                'name'         => $this->handle,
                'forms'        => $forms,
                'formOptions'  => $formOptions,
                'selectedForm' => $value instanceof Form ? $value->getId() : null,
            ]
        );
    }

    /**
     * @inheritDoc
     */
    public function normalizeValue($value, ElementInterface $element = null)
    {
        $form = Freeform::getInstance()->forms->getFormById($value);

        if ($form) {
            return $form->getForm();
        }

        return null;
    }
}

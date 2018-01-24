<?php

namespace Solspace\Freeform\Elements;

use craft\base\Element;
use craft\db\Query;
use craft\elements\Asset;
use craft\elements\db\ElementQueryInterface;
use craft\helpers\Html;
use craft\helpers\UrlHelper;
use Solspace\Freeform\Elements\Actions\DeleteSubmissionAction;
use Solspace\Freeform\Elements\Actions\ExportCSVAction;
use Solspace\Freeform\Elements\Actions\SetSubmissionStatusAction;
use Solspace\Freeform\Elements\Db\SubmissionQuery;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\AbstractField;
use Solspace\Freeform\Library\Composer\Components\Fields\CheckboxField;
use Solspace\Freeform\Library\Composer\Components\Fields\FileUploadField;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\MultipleValueInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\NoStorageInterface;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\Exceptions\Composer\ComposerException;
use Solspace\Freeform\Library\Exceptions\FieldExceptions\FieldException;
use Solspace\Freeform\Models\StatusModel;
use Solspace\FreeformPro\Fields\RatingField;

class Submission extends Element
{
    const TABLE_STD           = 'freeform_submissions';
    const TABLE               = '{{%freeform_submissions}}';
    const FIELD_COLUMN_PREFIX = 'field_';

    /** @var AbstractField[] */
    private static $fieldIdMap;

    /** @var AbstractField */
    private static $fieldHandleMap;

    /** @var int */
    public $formId;

    /** @var int */
    public $statusId;

    /** @var int */
    public $incrementalId;

    /** @var array */
    private $storedFieldValues;

    /**
     * @return SubmissionQuery|ElementQueryInterface
     */
    public static function find(): ElementQueryInterface
    {
        return new SubmissionQuery(self::class);
    }

    /**
     * @inheritdoc
     */
    public static function displayName(): string
    {
        return Freeform::t('Submission');
    }

    /**
     * @inheritdoc
     */
    public static function refHandle()
    {
        return 'submission';
    }

    /**
     * @return bool
     */
    public static function hasContent(): bool
    {
        return true;
    }

    /**
     * @return bool
     */
    public static function hasTitles(): bool
    {
        return true;
    }

    /**
     * @inheritdoc
     */
    public static function hasStatuses(): bool
    {
        return true;
    }

    /**
     * @return array
     */
    public static function statuses(): array
    {
        $statuses = Freeform::getInstance()->statuses->getAllStatuses();

        $list = [];
        foreach ($statuses as $status) {
            $list[$status->handle . ' ' . $status->color] = $status->name;
        }

        return $list;
    }

    /**
     * Submission constructor.
     *
     * @param array $config
     */
    public function __construct(array $config = [])
    {
        parent::__construct($config);

        if ($this->formId) {
            $this->getFieldMetadata();
            if (\is_array($this->storedFieldValues)) {
                foreach ($this->storedFieldValues as $key => $value) {
                    if (!empty($value) && $this->getFieldByIdentifier($key) instanceof MultipleValueInterface) {
                        $this->storedFieldValues[$key] = json_decode($value, true);
                    }
                }
            }
        }
    }

    /**
     * @param int $fieldId
     *
     * @return string
     */
    public static function getFieldColumnName(int $fieldId): string
    {
        return self::FIELD_COLUMN_PREFIX . $fieldId;
    }

    /**
     * @inheritDoc
     */
    protected static function defineSources(string $context = null): array
    {
        $sources = [
            [
                'key'      => '*',
                'label'    => Freeform::t('All Submissions'),
                'criteria' => [],
            ],
            ['heading' => Freeform::t('Forms')],
        ];

        $formsService = Freeform::getInstance()->forms;

        /** @var array|null $allowedFormIds */
        $allowedFormIds = Freeform::getInstance()->submissions->getAllowedSubmissionFormIds();

        foreach ($formsService->getAllForms() as $form) {
            if (null !== $allowedFormIds && !\in_array($form->id, $allowedFormIds, true)) {
                continue;
            }

            $sources[] = [
                'key'      => 'form:' . $form->id,
                'label'    => $form->name,
                'criteria' => [
                    'formId' => $form->id,
                ],
            ];
        }

        return $sources;
    }

    /**
     * @inheritDoc
     */
    protected static function defineTableAttributes(): array
    {
        $titles = [
            'title'         => ['label' => Freeform::t('Title')],
            'status'        => ['label' => Freeform::t('Status')],
            'form'          => ['label' => Freeform::t('Form')],
            'dateCreated'   => ['label' => Freeform::t('Date Created')],
            'id'            => ['label' => Freeform::t('ID')],
            'incrementalId' => ['label' => Freeform::t('Freeform ID')],
        ];

        foreach (Freeform::getInstance()->fields->getAllFields() as $field) {
            $titles[self::getFieldColumnName($field->id)] = ['label' => $field->label];
        }

        return $titles;
    }

    /**
     * @inheritDoc
     */
    protected static function defineDefaultTableAttributes(string $source): array
    {
        return [
            'id',
            'title',
            'status',
            'dateCreated',
            'form',
        ];
    }

    /**
     * @inheritDoc
     */
    protected static function defineActions(string $source = null): array
    {
        return [
            \Craft::$app->elements->createAction(
                [
                    'type'                => DeleteSubmissionAction::class,
                    'confirmationMessage' => Freeform::t('Are you sure you want to delete the selected submissions?'),
                    'successMessage'      => Freeform::t('Submissions deleted.'),
                ]
            ),
            \Craft::$app->elements->createAction(
                [
                    'type' => SetSubmissionStatusAction::class,
                ]
            ),
            \Craft::$app->elements->createAction(
                [
                    'type' => ExportCSVAction::class,
                ]
            ),
        ];
    }

    /**
     * @inheritDoc
     */
    protected function tableAttributeHtml(string $attribute): string
    {
        $value = $this->$attribute;

        if (\is_array($value)) {
            return Html::decode(implode(', ', $value));
        }

        if ($value instanceof AbstractField) {
            $field = $value;
            $value = $value->getValue();

            if (\is_array($value)) {
                $value = implode(', ', $value);
            }

            if ($field instanceof CheckboxField) {
                return $value ?: '-';
            }

            if ($field instanceof RatingField) {
                return (int) $value . '/' . $field->getMaxValue();
            }

            if ($field instanceof FileUploadField) {
                $asset = \Craft::$app->assets->getAssetById((int) $value);

                if ($asset) {
                    return \Craft::$app->view->renderTemplate(
                        'freeform/_components/fields/file.html',
                        ['asset' => $asset]
                    );
                }
            }

            return Html::encode($value);
        }

        return parent::tableAttributeHtml($attribute);
    }

    /**
     * @return StatusModel
     */
    public function getStatus(): StatusModel
    {
        return Freeform::getInstance()->statuses->getStatusById($this->statusId);
    }

    /**
     * @return \DateTime
     */
    public function getSubmissionDate(): \DateTime
    {
        return $this->dateCreated;
    }

    /**
     * @param string $fieldColumnHandle - e.g. "field_1" or "field_52", etc
     *
     * @return Asset|null
     */
    public function getAsset(string $fieldColumnHandle)
    {
        $columnPrefix = self::FIELD_COLUMN_PREFIX;

        if (strpos($fieldColumnHandle, $columnPrefix) === 0) {
            $value = $this->storedFieldValues[$fieldColumnHandle] ?? null;

            if ($value) {
                return \Craft::$app->assets->getAssetById($value);
            }
        }

        return null;
    }

    /**
     * @return array
     */
    public function getFieldAttributes(): array
    {
        return $this->storedFieldValues;
    }

    /**
     * @param array $values
     *
     * @return $this
     */
    public function setFormFieldValues(array $values): Submission
    {
        foreach ($values as $key => $value) {
            try {
                $field = $this->getFieldByIdentifier($key);

                $this->storedFieldValues[self::getFieldColumnName($field->getId())] = $value;
            } catch (FieldException $exception) {
            }
        }

        return $this;
    }

    /**
     * @return AbstractField[]
     * @throws ComposerException
     */
    public function getFieldMetadata(): array
    {
        $formId = $this->formId;

        if (null === self::$fieldIdMap) {
            self::$fieldIdMap = [];
        }

        if (null === self::$fieldHandleMap) {
            self::$fieldHandleMap = [];
        }

        if (!isset(self::$fieldIdMap[$formId])) {
            $ids = $handles = [];
            foreach ($this->getForm()->getLayout()->getFields() as $field) {
                if ($field instanceof NoStorageInterface || !$field->getHandle()) {
                    continue;
                }

                $ids[$field->getId()]         = $field;
                $handles[$field->getHandle()] = $field;
            }

            self::$fieldIdMap[$formId]     = $ids;
            self::$fieldHandleMap[$formId] = $handles;
        }

        return self::$fieldHandleMap[$formId];
    }

    /**
     * @return Form
     * @throws ComposerException
     */
    public function getForm(): Form
    {
        $formService = Freeform::getInstance()->forms;

        return $formService->getFormById((int) $this->formId)->getForm();
    }

    /**
     * Getter
     *
     * @param string $name
     *
     * @throws \Exception
     * @return mixed
     */
    public function __get($name)
    {
        try {
            $field  = $this->getFieldByIdentifier($name);
            $column = self::getFieldColumnName($field->getId());

            $value = $this->storedFieldValues[$column] ?? null;
            $clone = clone $field;
            $clone->setValue($value);

            if ($clone instanceof CheckboxField) {
                $clone->setIsChecked((bool) $value);
            }

            return $clone;
        } catch (FieldException $exception) {
            if (preg_match('/^' . self::FIELD_COLUMN_PREFIX . '\d+$/', $name)) {
                return null;
            }

            return parent::__get($name);
        }
    }

    /**
     * @inheritDoc
     */
    public function __set($name, $value)
    {
        try {
            $field  = $this->getFieldByIdentifier($name);
            $column = self::getFieldColumnName($field->getId());

            $this->storedFieldValues[$column] = $value;
        } catch (FieldException $exception) {
            if (!preg_match('/^' . self::FIELD_COLUMN_PREFIX . '\d+$/', $name)) {
                parent::__set($name, $value);
            }
        }
    }

    /**
     * @param string $name
     * @param array  $attributes
     *
     * @return bool|Submission|null
     */
    public function __call($name, $attributes = [])
    {
        if ($this->getFieldByIdentifier($name)) {
            return $this->__get($name);
        }

        if (\in_array($name, $this->getAllFieldHandles(), true)) {
            return $this->__get($name);
        }

        return parent::__call($name, $attributes);
    }

    /**
     * @param string $name
     *
     * @return bool
     * @throws ComposerException
     */
    public function __isset($name): bool
    {
        $fields = $this->getFieldMetadata();
        if (array_key_exists($name, $fields)) {
            return true;
        }

        if (\in_array($name, $this->getAllFieldHandles(), true)) {
            return null;
        }

        return parent::__isset($name);
    }

    /**
     * @inheritdoc
     */
    public function getIsEditable(): bool
    {
        return true;
    }

    /**
     * @inheritdoc
     */
    public function getCpEditUrl()
    {
        return UrlHelper::cpUrl('freeform/submissions/' . $this->id);
    }

    /**
     * @return string
     */
    public function getEditorHtml(): string
    {
        $html = \Craft::$app->getView()
            ->renderTemplateMacro(
                '_includes/forms',
                'textField',
                [
                    [
                        'label'     => Freeform::t('Title'),
                        'siteId'    => $this->siteId,
                        'id'        => 'title',
                        'name'      => 'title',
                        'value'     => $this->title,
                        'errors'    => $this->getErrors('title'),
                        'first'     => true,
                        'autofocus' => true,
                        'required'  => true,
                    ],
                ]
            );

        $html .= parent::getEditorHtml();

        return $html;
    }

    /**
     * @param bool $isNew
     */
    public function afterSave(bool $isNew)
    {
        $insertData = [
            'formId'        => $this->formId,
            'statusId'      => $this->statusId,
            'incrementalId' => $this->incrementalId ?? $this->getNewIncrementalId(),
        ];

        foreach ($this->storedFieldValues as $key => $value) {
            if (\is_array($value)) {
                $value = json_encode($value);
            }

            $insertData[$key] = $value;
        }

        if ($isNew) {
            $insertData['id'] = $this->id;

            \Craft::$app->db->createCommand()
                ->insert(self::TABLE, $insertData)
                ->execute();
        } else {
            \Craft::$app->db->createCommand()
                ->update(self::TABLE, $insertData, ['id' => $this->id])
                ->execute();
        }

        parent::afterSave($isNew);
    }

    /**
     * @return int
     */
    private function getNewIncrementalId(): int
    {
        $maxIncrementalId = (int) (new Query())
            ->select(['MAX(incrementalId)'])
            ->from(self::TABLE)
            ->scalar();

        return ++$maxIncrementalId;
    }

    /**
     * @return array
     */
    private function getAllFieldHandles(): array
    {
        return Freeform::getInstance()->fields->getAllFieldHandles();
    }

    /**
     * @param mixed $identifier
     *
     * @return AbstractField
     * @throws FieldException
     */
    private function getFieldByIdentifier($identifier): AbstractField
    {
        $this->getFieldMetadata();

        $exception = new FieldException(
            Freeform::t(
                'Field "{identifier}" not found',
                [
                    'identifier' => $identifier,
                ]
            )
        );

        $id = null;
        if (!is_numeric($identifier)) {
            if (preg_match('/^' . self::FIELD_COLUMN_PREFIX . '(\d+)$/', $identifier, $matches)) {
                $id = (int) $matches[1];
            } else {
                if (!isset(self::$fieldHandleMap[$this->formId][$identifier])) {
                    throw $exception;
                }

                return self::$fieldHandleMap[$this->formId][$identifier];
            }
        }

        if (!isset(self::$fieldIdMap[$this->formId][$id])) {
            throw $exception;
        }

        return self::$fieldIdMap[$this->formId][$id];
    }
}

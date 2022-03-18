<?php

namespace Solspace\Freeform\Elements;

use craft\base\Element;
use craft\db\Query;
use craft\elements\actions\Restore;
use craft\elements\Asset;
use craft\elements\User;
use craft\helpers\Html;
use craft\helpers\UrlHelper;
use LitEmoji\LitEmoji;
use Solspace\Commons\Helpers\CryptoHelper;
use Solspace\Commons\Helpers\PermissionHelper;
use Solspace\Commons\Helpers\StringHelper;
use Solspace\Freeform\Elements\Actions\DeleteAllSubmissionsAction;
use Solspace\Freeform\Elements\Actions\DeleteSubmissionAction;
use Solspace\Freeform\Elements\Actions\ExportCSVAction;
use Solspace\Freeform\Elements\Actions\Pro\ResendNotificationsAction;
use Solspace\Freeform\Elements\Actions\SendNotificationAction;
use Solspace\Freeform\Elements\Actions\SetSubmissionStatusAction;
use Solspace\Freeform\Elements\Db\SubmissionQuery;
use Solspace\Freeform\Fields\CheckboxField;
use Solspace\Freeform\Fields\FileUploadField;
use Solspace\Freeform\Fields\Pro\RatingField;
use Solspace\Freeform\Fields\Pro\SignatureField;
use Solspace\Freeform\Fields\Pro\TableField;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\AbstractField;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\MultipleValueInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\NoStorageInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\ObscureValueInterface;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\DataObjects\SpamReason;
use Solspace\Freeform\Library\Exceptions\FieldExceptions\FieldException;
use Solspace\Freeform\Models\StatusModel;
use Solspace\Freeform\Records\SpamReasonRecord;
use Solspace\Freeform\Services\NotesService;

class Submission extends Element
{
    public const TABLE_STD = 'freeform_submissions';
    public const TABLE = '{{%freeform_submissions}}';
    public const FIELD_COLUMN_PREFIX = 'field_';

    public const EVENT_PROCESS_SUBMISSION = 'process-submission';

    public const OPT_IN_DATA_TOKEN_LENGTH = 100;

    /** @var int */
    public $formId;

    /** @var int */
    public $userId;

    /** @var int */
    public $statusId;

    /** @var int */
    public $incrementalId;

    /** @var string */
    public $token;

    /** @var bool */
    public $isSpam;

    /** @var string */
    public $ip;

    /** @var AbstractField[] */
    private static $fieldIdMap = [];

    /** @var AbstractField */
    private static $fieldHandleMap = [];

    /** @var array */
    private static $permissionCache = [];

    /** @var SpamReason[] */
    private $spamReasons;

    /** @var array */
    private $storedFieldValues;

    /** @var AbstractField[] */
    private $fieldsByIdentifier = [];

    /** @var bool */
    private static $deletableTokens = [];

    /**
     * Submission constructor.
     */
    public function __construct(array $config = [])
    {
        $this->formId = $config['formId'] ?? null;
        $this->getFieldMetadata();

        parent::__construct($config);

        if ($this->formId) {
            if (\is_array($this->storedFieldValues)) {
                foreach ($this->storedFieldValues as $key => $value) {
                    if (!empty($value) && $this->getFieldByIdentifier($key) instanceof MultipleValueInterface) {
                        $this->storedFieldValues[$key] = json_decode($value, true);
                    }
                }
            }
        }
    }

    public function __get($name)
    {
        try {
            $field = $this->getFieldByIdentifier($name);
            $column = self::getFieldColumnName($field->getId());

            $value = $this->storedFieldValues[$column] ?? null;
            $clone = clone $field;
            $clone->setValue($value);

            if ($clone instanceof CheckboxField) {
                $clone->setIsChecked((bool) $value);
            }

            return $clone;
        } catch (FieldException $exception) {
            if (self::isSubmissionField($name)) {
                return null;
            }

            return parent::__get($name);
        }
    }

    public function __set($name, $value): void
    {
        if (!self::isSubmissionField($name)) {
            parent::__set($name, $value);

            return;
        }

        try {
            $field = $this->getFieldByIdentifier($name);
            $column = self::getFieldColumnName($field->getId());

            $this->storedFieldValues[$column] = $value;
        } catch (FieldException $exception) {
        }
    }

    /**
     * @param string $name
     * @param array  $attributes
     *
     * @return null|bool|Submission
     */
    public function __call($name, $attributes = [])
    {
        try {
            if ($this->getFieldByIdentifier($name)) {
                return $this->__get($name);
            }
        } catch (FieldException $e) {
        }

        if (\in_array($name, $this->getAllFieldHandles(), true)) {
            return $this->__get($name);
        }

        return parent::__call($name, $attributes);
    }

    public function __isset($name): bool
    {
        $fields = $this->getFieldMetadata();
        if (isset($fields[$name])) {
            return true;
        }

        if (\in_array($name, $this->getAllFieldHandles(), true)) {
            return false;
        }

        return parent::__isset($name);
    }

    public static function find(): SubmissionQuery
    {
        return (new SubmissionQuery(self::class))->isSpam(false);
    }

    public static function displayName(): string
    {
        return Freeform::t('Submission');
    }

    public static function refHandle(): ?string
    {
        return 'submission';
    }

    public static function hasContent(): bool
    {
        return true;
    }

    public static function hasTitles(): bool
    {
        return true;
    }

    public static function hasStatuses(): bool
    {
        return true;
    }

    public static function statuses(): array
    {
        $statuses = Freeform::getInstance()->statuses->getAllStatuses();

        $list = [];
        foreach ($statuses as $status) {
            $list[$status->handle] = ['label' => $status->name, 'color' => $status->color];
        }

        return $list;
    }

    public static function create(Form $form): self
    {
        $submission = new static(['formId' => $form->getId()]);
        $submission->generateToken();

        return $submission;
    }

    public static function isSubmissionField(string $name): bool
    {
        return (bool) preg_match('/^'.self::FIELD_COLUMN_PREFIX.'\d+$/', $name);
    }

    public static function getFieldColumnName(int $fieldId): string
    {
        return self::FIELD_COLUMN_PREFIX.$fieldId;
    }

    /**
     * @return SpamReason[]
     */
    public function getSpamReasons(): array
    {
        if (null === $this->spamReasons) {
            $data = (new Query())
                ->select(['reasonType', 'reasonMessage'])
                ->from(SpamReasonRecord::TABLE)
                ->where(['submissionId' => $this->id])
                ->all()
            ;

            $reasons = [];
            foreach ($data as $item) {
                $reasons[] = new SpamReason($item['reasonType'], $item['reasonMessage']);
            }

            $this->spamReasons = $reasons;
        }

        return $this->spamReasons;
    }

    public function getAuthor(): ?User
    {
        return $this->getUser();
    }

    public function getUser(): ?User
    {
        return $this->userId ? \Craft::$app->users->getUserById($this->userId) : null;
    }

    public function getStatus(): string
    {
        return $this->getStatusModel()->handle;
    }

    public function getStatusModel(): StatusModel
    {
        return Freeform::getInstance()->statuses->getStatusById($this->statusId);
    }

    public function getSubmissionDate(): \DateTime
    {
        return $this->dateCreated;
    }

    /**
     * @param string $fieldColumnHandle - e.g. "field_1" or "field_52", etc
     *
     * @return null|Asset[]
     */
    public function getAssets(string $fieldColumnHandle): ?array
    {
        $columnPrefix = self::FIELD_COLUMN_PREFIX;

        if (0 === strpos($fieldColumnHandle, $columnPrefix)) {
            $value = $this->storedFieldValues[$fieldColumnHandle] ?? null;

            if (!\is_array($value)) {
                $value = [$value];
            }

            $assets = [];
            foreach ($value as $assetId) {
                if ((int) $assetId > 0) {
                    $assets[] = \Craft::$app->assets->getAssetById((int) $assetId);
                }
            }

            return $assets;
        }

        return null;
    }

    public function getFieldAttributes(): array
    {
        return $this->storedFieldValues;
    }

    public function getFieldMetadata(): array
    {
        $formId = $this->formId;
        if (!$formId) {
            return [];
        }

        if (!isset(self::$fieldIdMap[$formId])) {
            $ids = $handles = [];
            foreach ($this->getForm()->getLayout()->getFields() as $field) {
                if ($field instanceof NoStorageInterface || !$field->getHandle()) {
                    continue;
                }

                $ids[$field->getId()] = $field;
                $handles[$field->getHandle()] = $field;
            }

            self::$fieldIdMap[$formId] = $ids;
            self::$fieldHandleMap[$formId] = $handles;
        }

        return self::$fieldHandleMap[$formId];
    }

    public function setFormFieldValues(array $values, bool $override = true): self
    {
        foreach ($this->getForm()->getLayout()->getFields() as $field) {
            if (!$field->canStoreValues()) {
                continue;
            }

            $value = null;
            if (isset($values[$field->getHandle()])) {
                $value = $values[$field->getHandle()];
            }

            if (!$override && null === $value) {
                continue;
            }

            $field->setValue($value);

            $this->storedFieldValues[self::getFieldColumnName($field->getId())] = $field->getValue();
        }

        return $this;
    }

    public function getForm(): ?Form
    {
        if (!$this->formId) {
            return null;
        }

        $formService = Freeform::getInstance()->forms;

        return $formService->getFormById((int) $this->formId)->getForm();
    }

    public function getIsEditable(): bool
    {
        if (!isset(self::$permissionCache[$this->formId])) {
            if (PermissionHelper::checkPermission(Freeform::PERMISSION_SUBMISSIONS_MANAGE)) {
                self::$permissionCache[$this->formId] = true;
            } else {
                self::$permissionCache[$this->formId] = PermissionHelper::checkPermission(
                    PermissionHelper::prepareNestedPermission(
                        Freeform::PERMISSION_SUBMISSIONS_MANAGE,
                        $this->formId
                    )
                );
            }
        }

        return self::$permissionCache[$this->formId];
    }

    public function getCpEditUrl(): ?string
    {
        return $this->getIsEditable() ? UrlHelper::cpUrl('freeform/submissions/'.$this->id) : false;
    }

    public function getEditorHtml(): string
    {
        $html = \Craft::$app->getView()
            ->renderTemplateMacro(
                '_includes/forms',
                'textField',
                [
                    [
                        'label' => Freeform::t('Title'),
                        'siteId' => $this->siteId,
                        'id' => 'title',
                        'name' => 'title',
                        'value' => $this->title,
                        'errors' => $this->getErrors('title'),
                        'first' => true,
                        'autofocus' => true,
                        'required' => true,
                    ],
                ]
            )
        ;

        $html .= parent::getEditorHtml();

        return $html;
    }

    public function afterSave(bool $isNew): void
    {
        $insertData = [
            'userId' => $this->userId,
            'formId' => $this->formId,
            'statusId' => $this->statusId,
            'incrementalId' => $this->incrementalId ?? $this->getNewIncrementalId(),
            'token' => $this->token,
            'ip' => $this->ip,
            'isSpam' => $this->isSpam,
        ];

        if ($this->storedFieldValues) {
            foreach ($this->storedFieldValues as $key => $value) {
                if (\is_array($value)) {
                    $value = json_encode($value);
                }

                if (\PHP_VERSION_ID >= 50400) {
                    $value = LitEmoji::unicodeToShortcode($value);
                }

                $insertData[$key] = $value;
            }
        }

        if ($isNew) {
            $insertData['id'] = $this->id;

            \Craft::$app->db->createCommand()
                ->insert(self::TABLE, $insertData)
                ->execute()
            ;
        } else {
            \Craft::$app->db->createCommand()
                ->update(self::TABLE, $insertData, ['id' => $this->id])
                ->execute()
            ;

            $notesService = $this->getNotesService();
            $notesService->saveNote($this->id);
        }

        parent::afterSave($isNew);
    }

    public function enableDeletingByToken()
    {
        self::$deletableTokens[] = $this->token;
    }

    public function beforeDelete(): bool
    {
        if (\in_array($this->token, self::$deletableTokens, true)) {
            return true;
        }

        $canModifyAll = PermissionHelper::checkPermission(Freeform::PERMISSION_SUBMISSIONS_MANAGE);
        if ($canModifyAll) {
            return true;
        }

        return PermissionHelper::checkPermission(
            PermissionHelper::prepareNestedPermission(
                Freeform::PERMISSION_SUBMISSIONS_MANAGE,
                $this->formId
            )
        );
    }

    public function toArray(array $fields = [], array $expand = [], $recursive = true): array
    {
        $fields = parent::toArray($fields, $expand, $recursive);

        foreach ($this->getFieldMetadata() as $field) {
            $handle = $field->getHandle();
            $fields[$handle] = $this->{$handle}->getValue();
        }

        return $fields;
    }

    public function getIterator(): \ArrayIterator
    {
        return new \ArrayIterator($this->getFieldMetadata());
    }

    public static function sortOptions(): array
    {
        return array_merge(
            ['title' => Freeform::t('Submission')],
            parent::sortOptions()
        );
    }

    protected static function defineSources(string $context = null): array
    {
        static $sources;

        if (null === $sources) {
            $formsService = Freeform::getInstance()->forms;
            $forms = $formsService->getAllForms();

            $allowedFormIds = Freeform::getInstance()->submissions->getAllowedReadFormIds();

            $items = [
                [
                    'key' => '*',
                    'label' => Freeform::t('All Submissions'),
                    'criteria' => ['formId' => $allowedFormIds],
                ],
                ['heading' => Freeform::t('Forms')],
            ];

            foreach ($forms as $form) {
                if (!\in_array($form->id, $allowedFormIds, false)) {
                    continue;
                }

                $items[] = [
                    'key' => 'form:'.$form->id,
                    'label' => $form->name,
                    'data' => [
                        'handle' => $form->handle,
                    ],
                    'criteria' => [
                        'formId' => $form->id,
                    ],
                ];
            }

            $sources = $items;
        }

        return $sources;
    }

    protected static function defineTableAttributes(): array
    {
        static $attributes;

        if (null === $attributes) {
            $titles = [
                'userId' => ['label' => Freeform::t('Author')],
                'status' => ['label' => Freeform::t('Status')],
                'form' => ['label' => Freeform::t('Form')],
                'dateCreated' => ['label' => Freeform::t('Date Created')],
                'id' => ['label' => Freeform::t('ID')],
                'incrementalId' => ['label' => Freeform::t('Freeform ID')],
                'ip' => ['label' => Freeform::t('IP Address')],
                'spamReasons' => ['label' => Freeform::t('Spam Reasons')],
            ];

            // Hide Author from Craft Personal/Client
            if (\Craft::$app->getEdition() < \Craft::Pro) {
                unset($attributes['userId']);
            }

            foreach (Freeform::getInstance()->fields->getAllFields() as $field) {
                if ($field->label) {
                    $titles[self::getFieldColumnName($field->id)] = ['label' => $field->label];
                }
            }

            $attributes = $titles;
        }

        return $attributes;
    }

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

    protected static function defineActions(string $source = null): array
    {
        if ('*' === $source) {
            $message = Freeform::t('Are you sure you want to delete all submissions?');
        } else {
            $message = Freeform::t('Are you sure you want to delete all submissions for this form?');
        }

        $actions = [
            \Craft::$app->elements->createAction(
                [
                    'type' => DeleteSubmissionAction::class,
                    'confirmationMessage' => Freeform::t('Are you sure you want to delete the selected submissions?'),
                    'successMessage' => Freeform::t('Submissions deleted.'),
                ]
            ),
            \Craft::$app->elements->createAction(
                [
                    'type' => DeleteAllSubmissionsAction::class,
                    'confirmationMessage' => $message,
                    'successMessage' => Freeform::t('Submissions deleted.'),
                ]
            ),
            \Craft::$app->elements->createAction(['type' => SetSubmissionStatusAction::class]),
        ];

        if (PermissionHelper::checkPermission(Freeform::PERMISSION_ACCESS_QUICK_EXPORT)) {
            $actions[] = \Craft::$app->elements->createAction(['type' => ExportCSVAction::class]);
        }

        if (Freeform::getInstance()->isPro()) {
            $actions[] = \Craft::$app->elements->createAction(['type' => ResendNotificationsAction::class]);
            $actions[] = \Craft::$app->elements->createAction(['type' => SendNotificationAction::class]);
        }

        if (version_compare(\Craft::$app->getVersion(), '3.1', '>=')) {
            $actions[] = \Craft::$app->elements->createAction([
                'type' => Restore::class,
                'successMessage' => \Craft::t('app', 'Submissions restored.'),
                'partialSuccessMessage' => \Craft::t('app', 'Some submissions restored.'),
                'failMessage' => \Craft::t('app', 'Submissions not restored.'),
            ]);
        }

        return $actions;
    }

    protected function tableAttributeHtml(string $attribute): string
    {
        if ('status' === $attribute) {
            return $this->getStatusModel()->name;
        }

        if ('userId' === $attribute) {
            $user = $this->getAuthor();

            return $user ? \Craft::$app->view->renderTemplate('_elements/element', ['element' => $user]) : '';
        }

        if ('spamReasons' === $attribute) {
            $spamReasons = $this->getSpamReasons();
            if (empty($spamReasons)) {
                return '';
            }

            $reasons = [];
            foreach ($spamReasons as $reason) {
                $reasons[] = $reason->getType();
            }

            $translatedReasons = [];
            $reasons = array_unique($reasons);
            $reasons = array_filter($reasons);
            foreach ($reasons as $reason) {
                $translatedReasons[] = Freeform::t($reason);
            }

            return StringHelper::implodeRecursively(', ', $translatedReasons);
        }

        $value = $this->{$attribute};

        if (\is_array($value)) {
            return Html::decode(StringHelper::implodeRecursively(', ', $value));
        }

        if ($value instanceof TableField) {
            $rows = $value->getValue();
            $value = '<table>';
            foreach ($rows as $row) {
                $value .= '<tr>';
                foreach ($row as $val) {
                    $value .= '<td>'.$val.'</td>';
                }
                $value .= '</tr>';
            }
            $value .= '</table>';

            return Html::decode($value);
        }

        if ($value instanceof SignatureField) {
            $field = $value;
            $value = $value->getValue();

            if (!$value) {
                return '';
            }

            $width = $field->getWidth();
            $height = $field->getHeight();

            $ratio = $width / $height;
            $newWidth = 50 * $ratio;

            return "<img height='50' width='{$newWidth}' src=\"{$value}\" />";
        }

        if ($value instanceof AbstractField) {
            $field = $value;
            $value = $value->getValue();

            if ($field instanceof FileUploadField) {
                $output = '';
                foreach ($value as $assetId) {
                    $asset = \Craft::$app->assets->getAssetById((int) $assetId);

                    if ($asset) {
                        $output .= \Craft::$app->view->renderTemplate(
                            'freeform/_components/fields/file.html',
                            ['asset' => $asset]
                        );
                    }
                }

                return $output;
            }

            if (\is_array($value)) {
                $value = implode(', ', $value);
            }

            if ($field instanceof CheckboxField) {
                return $value ?: '-';
            }

            if ($field instanceof RatingField) {
                return (int) $value.'/'.$field->getMaxValue();
            }

            if ($field instanceof ObscureValueInterface) {
                return (string) $field->getActualValue($value);
            }

            return Html::encode($value);
        }

        return parent::tableAttributeHtml($attribute);
    }

    protected function getNotesService(): NotesService
    {
        return Freeform::getInstance()->notes;
    }

    private function generateToken(): void
    {
        $this->token = CryptoHelper::getUniqueToken(self::OPT_IN_DATA_TOKEN_LENGTH);
    }

    private function getNewIncrementalId(): int
    {
        $maxIncrementalId = (int) (new Query())
            ->select(['MAX([[incrementalId]])'])
            ->from(self::TABLE)
            ->scalar()
        ;

        return ++$maxIncrementalId;
    }

    private function getAllFieldHandles(): array
    {
        return Freeform::getInstance()->fields->getAllFieldHandles();
    }

    private function getFieldByIdentifier(string|int $identifier): AbstractField
    {
        $exception = new FieldException(
            Freeform::t(
                'Field "{identifier}" not found',
                [
                    'identifier' => $identifier,
                ]
            )
        );

        if (!isset($this->fieldsByIdentifier[$identifier])) {
            $id = null;
            if (!is_numeric($identifier)) {
                if (preg_match('/^'.self::FIELD_COLUMN_PREFIX.'(\d+)$/', $identifier, $matches)) {
                    $id = (int) $matches[1];
                } else {
                    if (!isset(self::$fieldHandleMap[$this->formId][$identifier])) {
                        throw $exception;
                    }

                    $this->fieldsByIdentifier[$identifier] = self::$fieldHandleMap[$this->formId][$identifier];

                    return $this->fieldsByIdentifier[$identifier];
                }
            }

            if (!isset(self::$fieldIdMap[$this->formId][$id])) {
                throw $exception;
            }

            $this->fieldsByIdentifier[$identifier] = self::$fieldIdMap[$this->formId][$id];
        }

        return $this->fieldsByIdentifier[$identifier];
    }
}

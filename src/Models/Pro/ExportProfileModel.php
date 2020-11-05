<?php

namespace Solspace\Freeform\Models\Pro;

use craft\base\Model;
use craft\db\Query;
use craft\db\Table;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Fields\Pro\SignatureField;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\NoStorageInterface;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Library\Exceptions\FreeformException;
use Solspace\Freeform\Models\FormModel;
use Solspace\Freeform\Records\StatusRecord;
use Solspace\Freeform\Fields\Pro\Payments\CreditCardDetailsField;

class ExportProfileModel extends Model
{
    const RANGE_TODAY = 'today';
    const RANGE_YESTERDAY = 'yesterday';
    const RANGE_CUSTOM = 'custom';

    /** @var int */
    public $id;

    /** @var int */
    public $formId;

    /** @var string */
    public $name;

    /** @var int */
    public $limit;

    /** @var string */
    public $dateRange;

    /** @var string */
    public $rangeStart;

    /** @var string */
    public $rangeEnd;

    /** @var array */
    public $fields;

    /** @var array */
    public $filters;

    /** @var array */
    public $statuses;

    /**
     * @param Form $form
     *
     * @return ExportProfileModel
     */
    public static function create(Form $form): ExportProfileModel
    {
        $model = new self();

        $model->formId = $form->getId();
        $model->statuses = '*';

        return $model;
    }

    /**
     * @return FormModel
     */
    public function getFormModel(): FormModel
    {
        return Freeform::getInstance()->forms->getFormById($this->formId);
    }

    /**
     * @return int|string
     */
    public function getSubmissionCount()
    {
        $command = $this->buildCommand();
        $command->select('COUNT(s.id)');

        try {
            return $command->scalar();
        } catch (\Exception $e) {
            \Craft::$app->session->setError($e->getMessage());

            return 'Invalid Query';
        }
    }

    /**
     * @return array
     */
    public function getSubmissionData()
    {
        $command = $this->buildCommand();

        try {
            return $command->all();
        } catch (\Exception $e) {
            \Craft::$app->session->setError($e->getMessage());

            return [];
        }
    }

    /**
     * @return \DateTime|null
     */
    public function getDateRangeEnd()
    {
        if ($this->dateRange === self::RANGE_CUSTOM) {
            return (new \DateTime($this->rangeEnd))->setTime(23, 59, 59);
        }

        return null;
    }

    /**
     * @return \DateTime|null
     */
    public function getDateRangeStart()
    {
        if (empty($this->dateRange)) {
            return null;
        }

        if (is_numeric($this->dateRange)) {
            return (new \DateTime("-{$this->dateRange} days"))->setTime(0, 0, 0);
        }

        switch ($this->dateRange) {
            case self::RANGE_CUSTOM:
                return (new \DateTime($this->rangeStart))->setTime(0, 0, 0);

            case self::RANGE_YESTERDAY:
                return (new \DateTime('-1 day'))->setTime(0, 0, 0);

            case self::RANGE_TODAY:
            default:
                return (new \DateTime('now'))->setTime(0, 0, 0);
        }
    }

    /**
     * @return array
     */
    public function getFieldSettings(): array
    {
        $form = $this->getFormModel()->getForm();

        $storedFieldIds = $fieldSettings = [];
        if (!empty($this->fields)) {
            foreach ($this->fields as $fieldId => $item) {
                $label     = $item['label'];
                $isChecked = (bool) $item['checked'];

                if (is_numeric($fieldId)) {
                    try {
                        $field = $form->getLayout()->getFieldById($fieldId);
                        if ($field instanceof CreditCardDetailsField || $field instanceof SignatureField) {
                            continue;
                        }

                        $label            = $field->getLabel();
                        $storedFieldIds[] = $field->getId();
                    } catch (FreeformException $e) {
                        continue;
                    }
                }

                $fieldSettings[$fieldId] = [
                    'label'   => $label,
                    'checked' => $isChecked,
                ];
            }
        }

        if (empty($fieldSettings)) {
            $fieldSettings['id']          = [
                'label'   => 'ID',
                'checked' => true,
            ];
            $fieldSettings['title']       = [
                'label'   => 'Title',
                'checked' => true,
            ];
            $fieldSettings['ip']          = [
                'label'   => 'IP',
                'checked' => true,
            ];
            $fieldSettings['dateCreated'] = [
                'label'   => 'Date Created',
                'checked' => true,
            ];
            $fieldSettings['status']      = [
                'label'   => 'Status',
                'checked' => true,
            ];
        }

        foreach ($form->getLayout()->getFields() as $field) {
            if (
                $field instanceof NoStorageInterface ||
                $field instanceof CreditCardDetailsField ||
                $field instanceof SignatureField ||
                !$field->getId() ||
                \in_array($field->getId(), $storedFieldIds, true)
            ) {
                continue;
            }

            $fieldSettings[$field->getId()] = [
                'label'   => $field->getLabel(),
                'checked' => true,
            ];
        }

        return $fieldSettings;
    }

    /**
     * @inheritDoc
     */
    public function safeAttributes(): array
    {
        return [
            'id',
            'formId',
            'name',
            'limit',
            'dateRange',
            'rangeStart',
            'rangeEnd',
            'fields',
            'statuses',
            'filters',
        ];
    }

    /**
     * @return Query
     */
    private function buildCommand(): Query
    {
        $fieldData = $this->getFieldSettings();

        $searchableFields = $labels = [];
        foreach ($fieldData as $fieldId => $data) {
            $isChecked = $data['checked'];

            if (!(bool) $isChecked) {
                continue;
            }

            $fieldName = is_numeric($fieldId) ? Submission::getFieldColumnName($fieldId) : $fieldId;
            switch ($fieldName) {
                case 'title':
                    $fieldName = 'c.[[' . $fieldName . ']]';
                    break;

                case 'status':
                    $fieldName = 'stat.[[name]] AS status';
                    break;

                default:
                    $fieldName = 's.[[' . $fieldName . ']]';
                    break;
            }

            $searchableFields[] = $fieldName;
        }

        $conditions = ['s.[[formId]] = :formId', 's.[[isSpam]] = false'];
        $parameters = ['formId' => $this->formId];

        $dateRangeStart = $this->getDateRangeStart();
        if ($dateRangeStart) {
            $conditions[]               = 's.[[dateCreated]] >= :dateRangeStart';
            $parameters['dateRangeStart'] = $dateRangeStart->format('Y-m-d H:i:s');
        }

        $dateRangeEnd = $this->getDateRangeEnd();
        if ($dateRangeEnd) {
            $conditions[]               = 's.[[dateCreated]] <= :dateRangeEnd';
            $parameters['dateRangeEnd'] = $dateRangeEnd->format('Y-m-d H:i:s');
        }

        if ($this->filters) {
            foreach ($this->filters as $filter) {
                $id    = $filter['field'];
                $type  = $filter['type'];
                $value = $filter['value'];

                $fieldId = $id;
                if (is_numeric($id)) {
                    $fieldId = 's.[[' . Submission::getFieldColumnName($id) . ']]';
                }

                if ($fieldId === 'id') {
                    $fieldId = 's.[[id]]';
                }

                if ($fieldId === 'dateCreated') {
                    $fieldId = 's.[[dateCreated]]';
                }

                if ($fieldId === 'status') {
                    $fieldId = 'stat.[[name]] AS status';
                }

                switch ($type) {
                    case '=':
                        $conditions[] = "$fieldId = :field_$id";
                        break;

                    case '!=':
                        $conditions[] = "$fieldId != :field_$id";
                        break;

                    case 'like':
                        $conditions[] = "$fieldId LIKE :field_$id";
                        break;

                    default:
                        continue 2;
                }

                $parameters["field_$id"] = $value;
            }
        }

        $command = (new Query())
            ->select(implode(',', $searchableFields))
            ->from(Submission::TABLE . ' s')
            ->innerJoin(StatusRecord::TABLE . ' stat', 'stat.[[id]] = s.[[statusId]]')
            ->innerJoin('{{%content}} c', 'c.[[elementId]] = s.[[id]]')
            ->where(implode(' AND ', $conditions), $parameters);

        if (version_compare(\Craft::$app->getVersion(), '3.1', '>=')) {
            $elements = Table::ELEMENTS;
            $command->innerJoin(
                "$elements e",
                'e.[[id]] = s.[[id]] AND e.[[dateDeleted]] IS NULL'
            );
        }

        if ($this->limit) {
            $command->limit((int) $this->limit);
        }

        if (is_array($this->statuses)) {
            $command->andWhere(['IN', '[[statusId]]', $this->statuses]);
        }

        return $command;
    }
}

<?php

namespace Solspace\Freeform\Elements\Db;

use craft\db\Query;
use craft\elements\db\ElementQuery;
use craft\helpers\Db;
use Solspace\Commons\Helpers\PermissionHelper;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Records\FormRecord;
use Solspace\Freeform\Records\StatusRecord;

class SubmissionQuery extends ElementQuery
{
    /** @var int */
    public $formId;

    /** @var string */
    public $form;

    /** @var int */
    public $statusId;

    /** @var int */
    public $incrementalId;

    /** @var string */
    public $token;

    /** @var bool */
    public $isSpam = null;

    /** @var array */
    public $fieldSearch = [];

    /** @var string */
    private $freeformStatus;

    /**
     * @param mixed $value
     *
     * @return $this
     */
    public function formId($value): SubmissionQuery
    {
        $this->formId = $value;

        return $this;
    }

    /**
     * @param string $value
     *
     * @return $this
     */
    public function form(string $value): SubmissionQuery
    {
        $this->form = $value;

        return $this;
    }

    /**
     * @param mixed $value
     *
     * @return $this
     */
    public function statusId($value): SubmissionQuery
    {
        $this->statusId = (int) $value;

        return $this;
    }

    /**
     * @param mixed $value
     *
     * @return $this
     */
    public function incrementalId($value): SubmissionQuery
    {
        $this->incrementalId = (int) $value;

        return $this;
    }

    /**
     * @param string $value
     *
     * @return SubmissionQuery
     */
    public function token(string $value): SubmissionQuery
    {
        $this->token = $value;

        return $this;
    }

    /**
     * @param bool|null $value
     *
     * @return SubmissionQuery
     */
    public function isSpam($value): SubmissionQuery
    {
        $this->isSpam = $value;

        return $this;
    }

    /**
     * @param $fieldSearch
     *
     * @return SubmissionQuery
     */
    public function fieldSearch(array $fieldSearch = []): SubmissionQuery
    {
        $this->fieldSearch = $fieldSearch;

        return $this;
    }

    /**
     * @return bool
     */
    protected function beforePrepare(): bool
    {
        static $formHandleToIdMap;
        $selectedForm = null;

        if (null === $formHandleToIdMap) {
            $result = (new Query())
                ->select(['id', 'handle'])
                ->from(FormRecord::TABLE)
                ->all();

            $formHandleToIdMap = array_column($result, 'id', 'handle');
            $formHandleToIdMap = array_map('intval', $formHandleToIdMap);
        }

        $table       = Submission::TABLE_STD;
        $formTable   = FormRecord::TABLE_STD;
        $statusTable = StatusRecord::TABLE_STD;
        $this->joinElementTable($table);

        $hasFormJoin = false;
        if (\is_array($this->join)) {
            foreach ($this->join as $joinData) {
                if (isset($joinData[1]) && $joinData[1] === FormRecord::TABLE . ' ' . $formTable) {
                    $hasFormJoin = true;
                }
            }
        }

        if (!$hasFormJoin) {
            $this->innerJoin(FormRecord::TABLE . ' ' . $formTable, "$formTable.[[id]] = $table.[[formId]]");
            $this->innerJoin(StatusRecord::TABLE . ' ' . $statusTable, "$statusTable.[[id]] = $table.[[statusId]]");
            $this->subQuery->innerJoin(StatusRecord::TABLE . ' sub_' . $statusTable, "sub_$statusTable.[[id]] = $table.[[statusId]]");
        }

        $select = [
            $table . '.[[formId]]',
            $table . '.[[statusId]]',
            $table . '.[[incrementalId]]',
            $table . '.[[token]]',
            $table . '.[[isSpam]]',
            $table . '.[[ip]]',
        ];

        foreach (Freeform::getInstance()->fields->getAllFieldIds() as $id) {
            $select[] = $table . '.' . Submission::FIELD_COLUMN_PREFIX . $id;
        }

        $this->query->select($select);

        $request = \Craft::$app->request;
        if (null === $this->formId && $request->getIsCpRequest() && $request->post('context') === 'index') {
            if (!PermissionHelper::checkPermission(Freeform::PERMISSION_SUBMISSIONS_MANAGE)) {
                $allowedFormIds = PermissionHelper::getNestedPermissionIds(Freeform::PERMISSION_SUBMISSIONS_MANAGE);
                $this->formId   = $allowedFormIds;
            }
        }

        $formHandle = $this->form;
        if ($formHandle instanceof Form) {
            $formHandle = $formHandle->getHandle();
        }

        if ($formHandle && $formHandleToIdMap[$formHandle]) {
            $this->formId = $formHandleToIdMap[$formHandle];
        }

        if ($this->formId) {
            $this->subQuery->andWhere(Db::parseParam($table . '.[[formId]]', $this->formId));

            if (\is_numeric($this->formId)) {
                $form = Freeform::getInstance()->forms->getFormById($this->formId);
                if ($form) {
                    $selectedForm = $form->getForm();
                }
            }
        }

        if ($this->statusId) {
            $this->subQuery->andWhere(Db::parseParam($table . '.[[statusId]]', $this->statusId));
        }

        if ($this->incrementalId) {
            $this->subQuery->andWhere(Db::parseParam($table . '.[[incrementalId]]', $this->incrementalId));
        }

        if (null !== $this->token) {
            $this->subQuery->andWhere(Db::parseParam($table . '.[[token]]', $this->token));
        }

        if ($this->isSpam !== null) {
            $this->subQuery->andWhere(Db::parseParam($table . '.[[isSpam]]', $this->isSpam));
        }

        if ($this->status) {
            $this->freeformStatus = $this->status;
            $this->status         = null;

            if (\is_array($this->freeformStatus)) {
                if (isset($this->freeformStatus[0]) && $this->freeformStatus[0] === 'enabled') {
                    $this->freeformStatus = null;
                }
            }
        }

        if ($this->freeformStatus) {
            $this->subQuery->andWhere(Db::parseParam("sub_$statusTable.[[handle]]", $this->freeformStatus));
        }

        $customSortTables = [
            'status' => "$statusTable.[[name]]",
            'form'   => "$formTable.[[name]]",
        ];

        foreach ($customSortTables as $column => $columnUpdate) {
            if (isset($this->orderBy[$column])) {
                $sortOrder = $this->orderBy[$column];

                unset($this->orderBy[$column]);
                $this->orderBy([$columnUpdate => $sortOrder]);
            }
        }

        if (!empty($this->orderBy) && \is_array($this->orderBy)) {
            $orderExceptions = ['title', 'score'];

            $prefixedOrderList = [];
            foreach ($this->orderBy as $key => $sortDirection) {
                if (preg_match("/\(\)$/", $key)) {
                    $prefixedOrderList[$key] = $sortDirection;
                    continue;
                }

                if (\in_array($key, $orderExceptions, true) || preg_match('/^[a-z0-9_]+\./i', $key)) {
                    $prefixedOrderList[$key] = $sortDirection;
                    continue;
                }

                if ($selectedForm) {
                    $field = $selectedForm->get($key);
                    if ($field) {
                        $key = Submission::getFieldColumnName($field->getId());
                    }
                }

                $prefixedOrderList[$table . '.[[' . $key . ']]'] = $sortDirection;
            }

            $this->orderBy = $prefixedOrderList;
        }

        $this->prepareFieldSearch();

        return parent::beforePrepare();
    }

    /**
     * Parses the fieldSearch variable and attaches the WHERE conditions to the query
     */
    private function prepareFieldSearch()
    {
        if (!$this->fieldSearch) {
            return;
        }

        $fieldHandleToIdMap = array_flip(Freeform::getInstance()->fields->getAllFieldHandles());

        $table = Submission::TABLE_STD;

        foreach ($this->fieldSearch as $handle => $term) {
            if (!array_key_exists($handle, $fieldHandleToIdMap)) {
                continue;
            }

            $columnName = Submission::getFieldColumnName($fieldHandleToIdMap[$handle]);

            $this->subQuery->andWhere(Db::parseParam($table . '.[[' . $columnName . ']]', $term));
        }
    }
}

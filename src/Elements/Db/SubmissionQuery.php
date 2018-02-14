<?php

namespace Solspace\Freeform\Elements\Db;

use craft\elements\db\ElementQuery;
use craft\helpers\Db;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Freeform;
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
     * @return bool
     */
    protected function beforePrepare(): bool
    {
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
            $this->innerJoin(FormRecord::TABLE . ' ' . $formTable, "`$formTable`.`id` = `$table`.`formId`");
            $this->innerJoin(StatusRecord::TABLE . ' ' . $statusTable, "`$statusTable`.`id` = `$table`.`statusId`");
        }

        $select = [
            $table . '.formId',
            $table . '.statusId',
            $table . '.incrementalId',
        ];

        foreach (Freeform::getInstance()->fields->getAllFieldIds() as $id) {
            $select[] = $table . '.' . Submission::FIELD_COLUMN_PREFIX . $id;
        }

        $this->query->select($select);

        if ($this->formId) {
            $this->subQuery->andWhere(Db::parseParam($table . '.formId', $this->formId));
        }

        if ($this->form) {
            $this->subQuery->andWhere(Db::parseParam($formTable . '.handle', $this->form));
        }

        if ($this->statusId) {
            $this->subQuery->andWhere(Db::parseParam($table . '.statusId', $this->statusId));
        }

        if ($this->incrementalId) {
            $this->subQuery->andWhere(Db::parseParam($table . '.incrementalId', $this->incrementalId));
        }

        if ($this->status && \is_string($this->status)) {
            $this->subQuery->andWhere(Db::parseParam($statusTable . '.handle', $this->status));
            $this->status = '';
        }

        $customSortTables = [
            'status' => "$statusTable.name",
            'form'   => "$formTable.name",
        ];

        foreach ($customSortTables as $column => $columnUpdate) {
            if (isset($this->orderBy[$column])) {
                $sortOrder = $this->orderBy[$column];

                unset($this->orderBy[$column]);
                $this->orderBy([$columnUpdate => $sortOrder]);
            }
        }

        if (!empty($this->orderBy) && \is_array($this->orderBy)) {
            $orderExceptions = ['title'];

            $prefixedOrderList = [];
            foreach ($this->orderBy as $key => $sortDirection) {
                if (\in_array($key, $orderExceptions, true) || preg_match('/^[a-z0-9_]+\./i', $key)) {
                    $prefixedOrderList[$key] = $sortDirection;
                    continue;
                }

                $prefixedOrderList[$table . '.' . $key] = $sortDirection;
            }

            $this->orderBy = $prefixedOrderList;
        }

        return parent::beforePrepare();
    }
}

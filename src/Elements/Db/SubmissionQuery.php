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
                if (isset($joinData[1]) && $joinData[1] === $formTable) {
                    $hasFormJoin = true;
                }
            }
        }

        if (!$hasFormJoin) {
            $this->innerJoin($formTable, "`$formTable`.`id` = `$table`.`formId`");
            $this->innerJoin($statusTable, "`$statusTable`.`id` = `$table`.`statusId`");
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

        if ($this->status && \is_string($this->status) && preg_match('/ /', $this->status)) {
            $status = explode(' ', $this->status);
            $status = reset($status);

            $this->subQuery->andWhere(Db::parseParam($statusTable . '.handle', $status));
            $this->status = '';
        }

        if (isset($this->orderBy['status'])) {
            $sortOrder = $this->orderBy['status'];

            unset($this->orderBy['status']);
            $this->orderBy(["$statusTable.name" => $sortOrder]);
        }

        if (isset($this->orderBy['form'])) {
            $sortOrder = $this->orderBy['form'];

            unset($this->orderBy['form']);
            $this->orderBy(["$formTable.name" => $sortOrder]);
        }

        return parent::beforePrepare();
    }
}

<?php

namespace Solspace\Freeform\Elements\Db;

use craft\db\Query;
use craft\elements\db\ElementQuery;
use craft\helpers\Db;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\Form;
use Solspace\Freeform\Records\FormRecord;
use Solspace\Freeform\Records\SpamReasonRecord;
use Solspace\Freeform\Records\StatusRecord;

class SubmissionQuery extends ElementQuery
{
    /** @var int */
    public $formId;

    /** @var int */
    public $userId;

    /** @var string */
    public $form;

    /** @var int */
    public $statusId;

    /** @var int */
    public $incrementalId;

    /** @var string */
    public $token;

    /** @var bool */
    public $isSpam;

    /** @var array */
    public $fieldSearch = [];

    /** @var string */
    public $spamReason;

    public bool $skipContent = false;

    /** @var string */
    private $freeformStatus;

    /**
     * @param mixed $value
     *
     * @return $this
     */
    public function formId($value): self
    {
        $this->formId = $value;

        return $this;
    }

    public function userId($value): self
    {
        $this->userId = $value;

        return $this;
    }

    /**
     * @return $this
     */
    public function form(string $value): self
    {
        $this->form = $value;

        return $this;
    }

    /**
     * @param mixed $value
     *
     * @return $this
     */
    public function statusId($value): self
    {
        $this->statusId = (int) $value;

        return $this;
    }

    /**
     * @param mixed $value
     *
     * @return $this
     */
    public function incrementalId($value): self
    {
        $this->incrementalId = (int) $value;

        return $this;
    }

    public function token(string $value): self
    {
        $this->token = $value;

        return $this;
    }

    /**
     * @param null|bool $value
     */
    public function isSpam($value): self
    {
        $this->isSpam = $value;

        return $this;
    }

    public function skipContent(bool $value): self
    {
        $this->skipContent = true;

        return $this;
    }

    /**
     * @param $fieldSearch
     */
    public function fieldSearch(array $fieldSearch = []): self
    {
        $this->fieldSearch = $fieldSearch;

        return $this;
    }

    /**
     * @param string $value
     */
    public function spamReason($value): self
    {
        $this->spamReason = $value;

        return $this;
    }

    protected function beforePrepare(): bool
    {
        static $forms;
        static $formHandleToIdMap;
        static $formIdToHandleMap;

        if (null === $formHandleToIdMap) {
            $forms = Freeform::getInstance()->forms->getResolvedForms();
            foreach ($forms as $form) {
                $formHandleToIdMap[$form->getHandle()] = $form->getId();
                $formIdToHandleMap[$form->getId()] = $form->getHandle();
                $forms[$form->getId()] = $form;
            }
        }

        $table = Submission::TABLE_STD;
        $formTable = FormRecord::TABLE_STD;
        $statusTable = StatusRecord::TABLE_STD;
        $spamReasonTable = SpamReasonRecord::TABLE_STD;

        $this->joinElementTable($table);

        $this->query->innerJoin(FormRecord::TABLE.' '.$formTable, "{$formTable}.[[id]] = {$table}.[[formId]]");
        $this->query->innerJoin(StatusRecord::TABLE.' '.$statusTable, "{$statusTable}.[[id]] = {$table}.[[statusId]]");
        $this->subQuery->innerJoin(StatusRecord::TABLE.' sub_'.$statusTable, "sub_{$statusTable}.[[id]] = {$table}.[[statusId]]");

        if ($this->form instanceof Form) {
            $this->form = $this->form->getHandle();
        }

        if ($this->form && $formHandleToIdMap[$this->form]) {
            $this->formId = $formHandleToIdMap[$this->form];
        }

        if (!$this->skipContent && !$this->formId && ($this->id || $this->token)) {
            if ($this->token) {
                $param = Db::parseParam('token', $this->token);
            } else {
                $param = Db::parseParam('id', $this->id);
            }

            $this->formId = (int) (new Query())
                ->select(['formId'])
                ->from(Submission::TABLE)
                ->where($param)
                ->scalar()
            ;
        }

        $select = [
            $table.'.[[formId]]',
            $table.'.[[userId]]',
            $table.'.[[statusId]]',
            $table.'.[[incrementalId]]',
            $table.'.[[token]]',
            $table.'.[[isSpam]]',
            $table.'.[[ip]]',
        ];

        $joinedForms = [];
        if (!$this->skipContent) {
            $joinFormIds = [];
            if ($this->formId) {
                if (\is_array($this->formId)) {
                    $joinFormIds = $this->formId;
                } else {
                    $joinFormIds[] = $this->formId;
                }
            } else {
                $joinFormIds = array_values($formHandleToIdMap ?? []);
            }

            foreach ($joinFormIds as $formId) {
                $form = $forms[$formId];
                $joinedForms[] = $form;
                $contentTable = Submission::getContentTableName($form);

                $this->query->leftJoin("{$contentTable} fc{$formId}", "[[fc{$formId}]].[[id]] = [[{$table}]].[[id]]");
                foreach ($form->getLayout()->getStorableFields() as $field) {
                    $fieldHandle = Submission::getFieldColumnName($field);
                    $select[] = "[[fc{$formId}]].[[{$fieldHandle}]] as [[form_{$formId}__{$fieldHandle}]]";
                }
            }
        }

        if (null !== $this->formId) {
            $this->subQuery->andWhere(Db::parseParam($table.'.[[formId]]', $this->formId));
        }

        $this->query->select($select);

        $request = \Craft::$app->request;

        $isEmptyFormId = empty($this->formId);
        $isCpRequest = $request->getIsCpRequest();
        $isIndex = !$request->getIsConsoleRequest() && 'index' === $request->post('context');
        if ($isEmptyFormId && $isCpRequest && $isIndex) {
            $allowedFormIds = Freeform::getInstance()->submissions->getAllowedReadFormIds();
            $this->subQuery->andWhere([$table.'.[[formId]]' => $allowedFormIds]);
        }

        if ($this->statusId) {
            $this->subQuery->andWhere(Db::parseParam($table.'.[[statusId]]', $this->statusId));
        }

        if ($this->userId) {
            $this->subQuery->andWhere(Db::parseParam($table.'.[[userId]]', $this->userId));
        }

        if ($this->incrementalId) {
            $this->subQuery->andWhere(Db::parseParam($table.'.[[incrementalId]]', $this->incrementalId));
        }

        if (null !== $this->token) {
            $this->subQuery->andWhere(Db::parseParam($table.'.[[token]]', $this->token));
        }

        if (null !== $this->isSpam) {
            $this->subQuery->andWhere(Db::parseParam($table.'.[[isSpam]]', $this->isSpam));
        }

        if (!empty($this->spamReason)) {
            $this->query->innerJoin(
                SpamReasonRecord::TABLE." {$spamReasonTable}",
                "{$spamReasonTable}.[[submissionId]] = {$table}.[[id]] AND {$spamReasonTable}.[[reasonType]] = :spamReason",
                ['spamReason' => $this->spamReason]
            );
        }

        if ($this->status) {
            $this->freeformStatus = $this->status;
            $this->status = null;

            if (\is_array($this->freeformStatus)) {
                if (isset($this->freeformStatus[0]) && 'enabled' === $this->freeformStatus[0]) {
                    $this->freeformStatus = null;
                }
            }
        }

        if ($this->freeformStatus) {
            $this->subQuery->andWhere(Db::parseParam("sub_{$statusTable}.[[handle]]", $this->freeformStatus));
        }

        $customSortTables = [
            'status' => "{$statusTable}.[[name]]",
            'form' => "{$formTable}.[[name]]",
        ];

        foreach ($customSortTables as $column => $columnUpdate) {
            if (isset($this->orderBy[$column])) {
                $sortOrder = $this->orderBy[$column];

                unset($this->orderBy[$column]);
                $this->subQuery->orderBy([$columnUpdate => $sortOrder]);
            }
        }

        $this->prepareFieldSearch($joinedForms);

        return parent::beforePrepare();
    }

    /**
     * Parses the fieldSearch variable and attaches the WHERE conditions to the query.
     *
     * @param Form[] $joinedForms
     */
    private function prepareFieldSearch(array $joinedForms): void
    {
        if (!$this->fieldSearch) {
            return;
        }

        foreach ($this->fieldSearch as $handle => $term) {
            $field = null;
            $currentForm = null;
            foreach ($joinedForms as $form) {
                $currentForm = $form;
                $field = $form->get($handle);
                if (null !== $field) {
                    break;
                }
            }

            if (null === $field) {
                continue;
            }

            $tableName = 'fc'.$currentForm->getId();
            $columnName = Submission::getFieldColumnName($field);

            $this->query->andWhere(Db::parseParam("[[{$tableName}]].[[{$columnName}]]", $term));
        }
    }
}

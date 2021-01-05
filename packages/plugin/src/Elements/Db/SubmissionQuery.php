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
use Solspace\Freeform\Records\SpamReasonRecord;
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
    public $isSpam;

    /** @var array */
    public $fieldSearch = [];

    /** @var string */
    public $spamReason;

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
        static $formHandleToIdMap;
        $selectedForm = null;

        if (null === $formHandleToIdMap) {
            $result = (new Query())
                ->select(['id', 'handle'])
                ->from(FormRecord::TABLE)
                ->all()
            ;

            $formHandleToIdMap = array_column($result, 'id', 'handle');
            $formHandleToIdMap = array_map('intval', $formHandleToIdMap);
        }

        $table = Submission::TABLE_STD;
        $formTable = FormRecord::TABLE_STD;
        $statusTable = StatusRecord::TABLE_STD;
        $spamReasonTable = SpamReasonRecord::TABLE_STD;
        $this->joinElementTable($table);

        $hasFormJoin = false;
        $hasStatusJoin = false;
        $hasSubStatusJoin = false;
        $hasSpamReasonJoin = false;
        if (\is_array($this->join)) {
            foreach ($this->join as $joinData) {
                if (isset($joinData[1]) && $joinData[1] === FormRecord::TABLE.' '.$formTable) {
                    $hasFormJoin = true;
                }
                if (isset($joinData[1]) && $joinData[1] === StatusRecord::TABLE.' '.$statusTable) {
                    $hasStatusJoin = true;
                }
                if (isset($joinData[1]) && $joinData[1] === 'sub_'.StatusRecord::TABLE.' '.$statusTable) {
                    $hasSubStatusJoin = true;
                }
                if (isset($joinData[1]) && $joinData[1] === SpamReasonRecord::TABLE.' '.$spamReasonTable) {
                    $hasSpamReasonJoin = true;
                }
            }
        }

        if (!$hasFormJoin) {
            $this->innerJoin(FormRecord::TABLE.' '.$formTable, "{$formTable}.[[id]] = {$table}.[[formId]]");
        }

        if (!$hasStatusJoin) {
            $this->innerJoin(StatusRecord::TABLE.' '.$statusTable, "{$statusTable}.[[id]] = {$table}.[[statusId]]");
        }

        if (!$hasSubStatusJoin) {
            $this->subQuery->innerJoin(StatusRecord::TABLE.' sub_'.$statusTable, "sub_{$statusTable}.[[id]] = {$table}.[[statusId]]");
        }

        $select = [
            $table.'.[[formId]]',
            $table.'.[[statusId]]',
            $table.'.[[incrementalId]]',
            $table.'.[[token]]',
            $table.'.[[isSpam]]',
            $table.'.[[ip]]',
        ];

        foreach (Freeform::getInstance()->fields->getAllFieldIds() as $id) {
            $select[] = $table.'.'.Submission::FIELD_COLUMN_PREFIX.$id;
        }

        $this->query->select($select);

        $request = \Craft::$app->request;
        if (null === $this->formId && $request->getIsCpRequest() && 'index' === $request->post('context')) {
            if (!PermissionHelper::checkPermission(Freeform::PERMISSION_SUBMISSIONS_MANAGE)) {
                $allowedFormIds = PermissionHelper::getNestedPermissionIds(Freeform::PERMISSION_SUBMISSIONS_MANAGE);
                $this->formId = $allowedFormIds;
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
            $this->subQuery->andWhere(Db::parseParam($table.'.[[formId]]', $this->formId));

            if (is_numeric($this->formId)) {
                $form = Freeform::getInstance()->forms->getFormById($this->formId);
                if ($form) {
                    $selectedForm = $form->getForm();
                }
            }
        }

        if ($this->statusId) {
            $this->subQuery->andWhere(Db::parseParam($table.'.[[statusId]]', $this->statusId));
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

        if (!empty($this->spamReason) && !$hasSpamReasonJoin) {
            $this->innerJoin(
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
                $this->orderBy([$columnUpdate => $sortOrder]);
            }
        }

        if (!empty($this->orderBy) && \is_array($this->orderBy)) {
            $orderExceptions = ['title', 'score'];

            $prefixedOrderList = [];
            foreach ($this->orderBy as $key => $sortDirection) {
                if (preg_match('/\\(\\)$/', $key)) {
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

                $prefixedOrderList[$table.'.[['.$key.']]'] = $sortDirection;
            }

            $this->orderBy = $prefixedOrderList;
        }

        $this->prepareFieldSearch();

        return parent::beforePrepare();
    }

    /**
     * Parses the fieldSearch variable and attaches the WHERE conditions to the query.
     */
    private function prepareFieldSearch()
    {
        if (!$this->fieldSearch) {
            return;
        }

        $fieldHandleToIdMap = array_flip(Freeform::getInstance()->fields->getAllFieldHandles());

        $table = Submission::TABLE_STD;

        foreach ($this->fieldSearch as $handle => $term) {
            if (!isset($fieldHandleToIdMap[$handle])) {
                continue;
            }

            $columnName = Submission::getFieldColumnName($fieldHandleToIdMap[$handle]);

            $this->subQuery->andWhere(Db::parseParam($table.'.[['.$columnName.']]', $term));
        }
    }
}

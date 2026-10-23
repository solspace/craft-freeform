<?php

namespace Solspace\Freeform\Services;

use Carbon\Carbon;
use craft\db\Query;
use craft\db\Table;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Fields\Implementations\NumberField;
use Solspace\Freeform\Fields\Implementations\Pro\OpinionScaleField;
use Solspace\Freeform\Fields\Implementations\Pro\RatingField;
use Solspace\Freeform\Fields\Interfaces\MultiValueInterface;
use Solspace\Freeform\Fields\Interfaces\NoStorageInterface;
use Solspace\Freeform\Fields\Interfaces\OptionsInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Records\StatusRecord;
use yii\web\BadRequestHttpException;

class FormCardAnalyticsService
{
    public function getStats(array $formIds, int $days, array $statusFormIds = []): array
    {
        $end = Carbon::now('UTC');
        $start = $end->copy()->startOfDay()->subDays($days - 1);
        $previousStart = $start->copy()->subDays($days);
        $stats = [];
        foreach ($formIds as $id) {
            $daily = [];
            for ($date = $start->copy(); $date->lte($end); $date->addDay()) {
                $daily[$date->toDateString()] = ['date' => $date->toDateString(), 'uv' => 0];
            }
            $stats[$id] = ['daily' => $daily, 'total' => 0, 'previousTotal' => 0, 'changePercent' => null, 'statuses' => []];
        }
        if ($formIds) {
            foreach ($this->getDailyRows($formIds, $previousStart, $end) as $row) {
                if (!isset($stats[$row['formId']])) {
                    continue;
                }
                $item = &$stats[$row['formId']];
                if ($row['date'] < $start->toDateString()) {
                    $item['previousTotal'] += (int) $row['count'];
                } elseif (isset($item['daily'][$row['date']])) {
                    $item['daily'][$row['date']]['uv'] = (int) $row['count'];
                    $item['total'] += (int) $row['count'];
                }
                unset($item);
            }
            $statusFormIds = array_values(array_intersect($formIds, $statusFormIds));
            if ($statusFormIds) {
                foreach ($this->getStatusRows($statusFormIds, $start, $end) as $row) {
                    $stats[$row['formId']]['statuses'][] = ['id' => (int) $row['statusId'], 'name' => $row['name'], 'count' => (int) $row['count']];
                }
            }
        }
        foreach ($stats as &$item) {
            $item['daily'] = array_values($item['daily']);
            $item['changePercent'] = $item['previousTotal'] ? round(($item['total'] - $item['previousTotal']) / $item['previousTotal'] * 100, 1) : ($item['total'] ? null : 0);
            $item['period'] = ['from' => $start->toDateString(), 'to' => $end->toDateString(), 'previousFrom' => $previousStart->toDateString(), 'previousTo' => $start->copy()->subDay()->toDateString()];
        }
        unset($item);

        return ['days' => $days, 'from' => $start->toIso8601String(), 'to' => $end->toIso8601String(), 'previousFrom' => $previousStart->toIso8601String(), 'timezone' => 'UTC', 'forms' => (object) $stats];
    }

    public function getFields(Form $form): array
    {
        $fields = [];
        foreach ($form->getLayout()->getFields() as $field) {
            if ($field instanceof NoStorageInterface || $field instanceof MultiValueInterface) {
                continue;
            }
            $numeric = $field instanceof NumberField || $field instanceof RatingField || $field instanceof OpinionScaleField;
            if (!$numeric && !$field instanceof OptionsInterface) {
                continue;
            }
            $fields[] = ['id' => $field->getId(), 'label' => $field->getLabel() ?: $field->getHandle(), 'kind' => $numeric ? 'number' : 'options'];
        }

        return $fields;
    }

    public function getFieldSummary(Form $form, int $fieldId, int $days): array
    {
        $choices = array_column($this->getFields($form), null, 'id');
        if (!isset($choices[$fieldId])) {
            throw new BadRequestHttpException('Choose an available numeric or single-choice field.');
        }
        $choice = $choices[$fieldId];
        $field = $form->getLayout()->getFields()->get($fieldId);
        $labels = [];
        if ($choice['kind'] === 'options') {
            $collect = static function (OptionCollection $options) use (&$collect, &$labels): void {
                foreach ($options as $option) {
                    if ($option instanceof OptionCollection) {
                        $collect($option);
                    } elseif (!$option->isOptgroup()) {
                        $labels[$option->getValue()] = $option->getLabel() ?: $option->getValue();
                    }
                }
            };
            $collect($field->getOptions());
        }
        $count = 0;
        $sum = 0;
        $min = $max = null;
        $counts = [];
        foreach ($this->getFieldValues($form, Submission::getFieldColumnName($field), $days) as $value) {
            if ($value === null || $value === '') {
                continue;
            }
            if ($choice['kind'] === 'number') {
                if (!is_numeric($value) || !is_finite((float) $value)) {
                    continue;
                }
                $sum += (float) $value;
                $min = $min === null ? (float) $value : min($min, (float) $value);
                $max = $max === null ? (float) $value : max($max, (float) $value);
            } else {
                // Do not expose unexpected or retired raw values as labels.
                if (!isset($labels[(string) $value])) {
                    continue;
                }
                $counts[(string) $value] = ($counts[(string) $value] ?? 0) + 1;
            }
            ++$count;
        }
        arsort($counts);
        $options = [];
        foreach (\array_slice($counts, 0, 3, true) as $value => $total) {
            $options[] = ['label' => $labels[$value], 'count' => $total, 'percent' => round($total / $count * 100, 1)];
        }

        return [...$choice, 'count' => $count, 'average' => $count && $choice['kind'] === 'number' ? round($sum / $count, 2) : null, 'min' => $min, 'max' => $max, 'options' => $options];
    }

    protected function getDailyRows(array $ids, Carbon $start, Carbon $end): array
    {
        return $this->submissionQuery($ids, $start, $end)->select(['s.formId', 'DATE(s.[[dateCreated]]) AS date', 'COUNT(*) AS count'])->groupBy(['s.formId', 'DATE(s.[[dateCreated]])'])->all();
    }

    protected function getStatusRows(array $ids, Carbon $start, Carbon $end): array
    {
        return $this->submissionQuery($ids, $start, $end)->innerJoin(['status' => StatusRecord::TABLE], 'status.[[id]]=s.[[statusId]]')->select(['s.formId', 's.statusId', 'status.name', 'COUNT(*) AS count'])->groupBy(['s.formId', 's.statusId', 'status.name', 'status.sortOrder'])->orderBy(['status.sortOrder' => \SORT_ASC, 's.statusId' => \SORT_ASC])->all();
    }

    protected function getFieldValues(Form $form, string $column, int $days): iterable
    {
        $end = Carbon::now('UTC');
        $start = $end->copy()->startOfDay()->subDays($days - 1);
        $query = $this->submissionQuery([$form->getId()], $start, $end)->innerJoin(['c' => Submission::getContentTableName($form)], 'c.[[id]]=s.[[id]]')->select(['value' => 'c.'.$column]);
        foreach ($query->each(500) as $row) {
            yield $row['value'];
        }
    }

    private function submissionQuery(array $ids, Carbon $start, Carbon $end): Query
    {
        return (new Query())->from(['s' => Submission::TABLE])->innerJoin(['e' => Table::ELEMENTS], 'e.[[id]]=s.[[id]]')->where(['s.formId' => $ids, 's.isSpam' => false, 's.isHidden' => false, 'e.dateDeleted' => null])->andWhere(['between', 's.dateCreated', $start->toDateTimeString(), $end->toDateTimeString()]);
    }
}

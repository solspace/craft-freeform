<?php

namespace Solspace\Freeform\Services;

use Carbon\Carbon;
use craft\db\Query;
use craft\db\Table;
use Solspace\Commons\Helpers\ColorHelper;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Charts\LinearChartData;
use Solspace\Freeform\Library\Charts\LinearItem;
use Solspace\Freeform\Library\Charts\RadialChartData;

class ChartsService extends BaseService
{
    /**
     * @param Carbon $rangeStart
     * @param Carbon $rangeEnd
     * @param array  $formIds
     * @param bool   $aggregate
     *
     * @return LinearChartData
     * @throws \Exception
     */
    public function getLinearSubmissionChartData(
        Carbon $rangeStart,
        Carbon $rangeEnd,
        array $formIds,
        bool $aggregate = false
    ): LinearChartData {
        $submissions = Submission::TABLE;
        
        if (version_compare(\Craft::$app->getVersion(), '3.1', '>=')) {
            $elements = Table::ELEMENTS;
        }

        $diff = $rangeStart->diffInDays($rangeEnd);

        $labels      = $dates = [];
        $dateContext = $rangeStart->copy();
        for ($i = 0; $i <= $diff; $i++) {
            $labels[] = $dateContext->format('M j');
            $dates[]  = $dateContext->format('Y-m-d');
            $dateContext->addDay();
        }

        $forms    = Freeform::getInstance()->forms->getAllForms();
        $datasets = [];
        foreach ($formIds as $formId) {
            if (null !== $formId && !isset($forms[$formId])) {
                continue;
            }

            $query = (new Query())
                ->select(["DATE($submissions.[[dateCreated]]) as dt", "COUNT($submissions.[[id]]) as count"])
                ->from(Submission::TABLE)
                ->groupBy(['dt']);

            $query->where(['between', "$submissions.[[dateCreated]]", $rangeStart->toDateTimeString(), $rangeEnd->toDateTimeString()]);

            $form = null;
            if ($aggregate) {
                $query->andWhere(['in', "$submissions.[[formId]]", $formIds]);
            } else {
                $form = $forms[$formId];
                $query->andWhere(["$submissions.[[formId]]" => $formId]);
            }

            if (version_compare(\Craft::$app->getVersion(), '3.1', '>=')) {
                $query->innerJoin(
                    $elements,
                    "$elements.[[id]] = $submissions.[[id]] AND $elements.[[dateDeleted]] IS NULL"
                );
            }

            $result = $query->all();

            $data = [];
            foreach ($dates as $date) {
                $data[$date] = 0;
            }

            foreach ($result as $item) {
                $data[$item['dt']] = (int) $item['count'];
            }

            if ($form) {
                $color = ColorHelper::getRGBColor($form->color);
            } else {
                $color = [5, 148, 209];
            }

            $datasets[] = new LinearItem($form ? $form->name : 'Submissions', $color, $data);

            if ($aggregate) {
                break;
            }
        }

        return $this->getData($labels, $datasets);
    }

    /**
     * @param Carbon $rangeStart
     * @param Carbon $rangeEnd
     * @param array  $forms
     *
     * @return RadialChartData
     */
    public function getRadialFormSubmissionData(
        Carbon $rangeStart,
        Carbon $rangeEnd,
        array $forms
    ): RadialChartData {
        $formIds = array_keys($forms);

        $submissions = Submission::TABLE;
        $query = (new Query())
            ->select(["$submissions.[[formId]]", "COUNT($submissions.[[id]]) as count"])
            ->from($submissions)
            ->where(['between', "$submissions.[[dateCreated]]", $rangeStart, $rangeEnd])
            ->andWhere(['IN', "$submissions.[[formId]]", $formIds])
            ->groupBy(["$submissions.[[formId]]"]);

        if (version_compare(\Craft::$app->getVersion(), '3.1', '>=')) {
            $elements = Table::ELEMENTS;
            $query->innerJoin(
                $elements,
                "$elements.[[id]] = $submissions.[[id]] AND $elements.[[dateDeleted]] IS NULL"
            );
        }

        $result = $query->all();

        $labels = $data = $backgroundColors = $hoverBackgroundColors = $formsWithResults = [];
        foreach ($result as $item) {
            $formId             = $item['formId'];
            $formsWithResults[] = $formId;

            $count = (int) $item['count'];
            $color = ColorHelper::getRGBColor($forms[$formId]->color);

            $labels[]                = $forms[$formId]->name;
            $data[]                  = $count;
            $backgroundColors[]      = sprintf('rgba(%s,0.8)', implode(',', $color));
            $hoverBackgroundColors[] = sprintf('rgba(%s,1)', implode(',', $color));
        }

        foreach ($formIds as $formId) {
            if (\in_array($formId, $formsWithResults, false)) {
                continue;
            }

            $color = ColorHelper::getRGBColor($forms[$formId]->color);

            $labels[]                = $forms[$formId]->name;
            $data[]                  = 0;
            $backgroundColors[]      = sprintf('rgba(%s,0.8)', implode(',', $color));
            $hoverBackgroundColors[] = sprintf('rgba(%s,1)', implode(',', $color));
        }

        $radialChartData = (new RadialChartData())
            ->setLabels($labels)
            ->setData($data)
            ->setBackgroundColors($backgroundColors)
            ->setHoverBackgroundColors($hoverBackgroundColors);

        return $radialChartData;
    }

    /**
     * @param array $labels
     * @param array $datasets
     *
     * @return LinearChartData
     * @throws \Exception
     */
    public function getData(array $labels, array $datasets): LinearChartData
    {
        $chartData = new LinearChartData();
        $chartData->setLabels($labels);
        $chartData->setDatasets($datasets);

        return $chartData;
    }
}

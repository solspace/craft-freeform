<?php

namespace Solspace\Freeform\Services;

use Carbon\Carbon;
use craft\base\Component;
use craft\db\Query;
use Solspace\Commons\Helpers\ColorHelper;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Charts\LinearChartData;
use Solspace\Freeform\Library\Charts\LinearItem;
use Solspace\Freeform\Library\Charts\RadialChartData;

class ChartsService extends Component
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
                ->select(['DATE(dateCreated) as dt', 'COUNT(id) as count'])
                ->from(Submission::TABLE)
                ->groupBy(['dt']);

            $query->where(['between', 'dateCreated', $rangeStart->toDateTimeString(), $rangeEnd->toDateTimeString()]);

            $form = null;
            if ($aggregate) {
                $query->andWhere(['in', 'formId', $formIds]);
            } else {
                $form = $forms[$formId];
                $query->andWhere(['formId' => $formId]);
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

        $result = (new Query())
            ->select(['formId', 'COUNT(id) as count'])
            ->from(Submission::TABLE)
            ->where(['between', 'dateCreated', $rangeStart, $rangeEnd])
            ->andWhere(['IN', 'formId', $formIds])
            ->groupBy(['formId'])
            ->all();

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

<?php

namespace Solspace\Freeform\Bundles\Form\Types\Surveys\Providers;

use Carbon\Carbon;
use craft\db\Query;
use craft\db\Table;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Form\Form;

class ChartDataProvider
{
    public function get(Form $form): array
    {
        $submissions = Submission::TABLE;
        $elements = Table::ELEMENTS;

        $query = (new Query())
            ->select([
                "COUNT({$submissions}.[[id]]) as count",
                "DATE({$submissions}.[[dateCreated]]) as dt",
            ])
            ->from(Submission::TABLE)
            ->groupBy('dt')
            ->where(["{$submissions}.[[formId]]" => $form->getId()])
            ->innerJoin(
                $elements,
                "{$elements}.[[id]] = {$submissions}.[[id]] AND {$elements}.[[dateDeleted]] IS NULL"
            )
            ->orderBy(['dt' => \SORT_ASC])
            ->indexBy('dt')
        ;

        $result = $query->column();

        $rangeStart = new Carbon('-60 days');
        $rangeEnd = new Carbon('now');

        $data = [];

        $dateContext = $rangeStart->copy();
        while ($dateContext->lte($rangeEnd)) {
            $count = (int) ($result[$dateContext->toDateString()] ?? 0);

            $data[] = [
                'name' => $dateContext->format('M j'),
                'x' => $dateContext->toDateString(),
                'y' => $count,
            ];

            $dateContext->addDay();
        }

        return $data;
    }
}

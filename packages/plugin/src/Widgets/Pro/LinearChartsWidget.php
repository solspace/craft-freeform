<?php

/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2026, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Widgets\Pro;

use craft\helpers\UrlHelper;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Charts\LinearChartData;
use Solspace\Freeform\Services\Pro\WidgetsService;
use Solspace\Freeform\Widgets\AbstractChartWidget;
use Solspace\Freeform\Widgets\ExtraWidgetInterface;

class LinearChartsWidget extends AbstractChartWidget implements ExtraWidgetInterface
{
    public ?string $title = null;

    public array|string|null $formIds = null;

    public ?bool $aggregate = null;

    public ?string $dateRange = null;

    public ?string $chartType = null;

    public ?bool $includeSpam = null;

    public static function displayName(): string
    {
        return Freeform::getInstance()->name.' '.Freeform::t('Linear Chart');
    }

    public static function icon(): string
    {
        return '@freeform/icon-mask.svg';
    }

    public function init(): void
    {
        parent::init();

        if (null === $this->title) {
            $this->title = self::displayName();
        }

        if (null === $this->formIds) {
            $this->formIds = [];
        }

        if (null === $this->aggregate) {
            $this->aggregate = false;
        }

        if (null === $this->dateRange) {
            $this->dateRange = WidgetsService::RANGE_LAST_30_DAYS;
        }

        if (null === $this->chartType) {
            $this->chartType = WidgetsService::CHART_LINE;
        }

        if (null === $this->includeSpam) {
            $this->includeSpam = false;
        }
    }

    public function rules(): array
    {
        return [
            [['formIds'], 'required'],
            [['chartSize'], 'in', 'range' => self::CHART_SIZES],
            [['dateRange'], 'in', 'range' => array_keys($this->getWidgetsService()->getDateRanges())],
            [['chartType'], 'in', 'range' => [WidgetsService::CHART_LINE, WidgetsService::CHART_BAR]],
        ];
    }

    public function getBodyHtml(): string
    {
        if (!Freeform::getInstance()->isPro()) {
            return Freeform::t(
                "Requires <a href='{link}'>Pro</a> edition",
                ['link' => UrlHelper::cpUrl('plugin-store/freeform')]
            );
        }

        $data = $this->getChartData();

        return \Craft::$app->view->renderTemplate(
            'freeform/_widgets/linear-charts/body',
            [
                'chartData' => $data,
                'dateRangeLabel' => $this->getWidgetsService()->getDateRanges()[$this->dateRange],
                'settings' => $this,
            ]
        );
    }

    public function getSettingsHtml(): string
    {
        return \Craft::$app->view->renderTemplate(
            'freeform/_widgets/linear-charts/settings',
            [
                'settings' => $this,
                'formOptions' => $this->getFormService()->getAllFormNames(orderByName: true),
                'dateRangeOptions' => Freeform::getInstance()->widgets->getDateRanges(),
                'chartTypes' => [
                    WidgetsService::CHART_LINE => Freeform::t('Line'),
                    WidgetsService::CHART_BAR => Freeform::t('Bar'),
                ],
            ]
        );
    }

    private function getChartData(): LinearChartData
    {
        [$rangeStart, $rangeEnd] = $this->getWidgetsService()->getRange($this->dateRange);

        $formIds = $this->formIds;
        if ('*' === $formIds) {
            $formIds = $this->getFormService()->getAllFormIds();
        }

        $chartData = $this->getChartsService()->getLinearSubmissionChartData(
            $rangeStart,
            $rangeEnd,
            $formIds,
            (bool) $this->aggregate,
            (bool) $this->includeSpam
        );

        $chartData->setChartType($this->chartType);

        return $chartData;
    }
}

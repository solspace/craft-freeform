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
use Solspace\Freeform\Library\Charts\RadialChartData;
use Solspace\Freeform\Services\Pro\WidgetsService;
use Solspace\Freeform\Widgets\AbstractChartWidget;
use Solspace\Freeform\Widgets\ExtraWidgetInterface;

class RadialChartsWidget extends AbstractChartWidget implements ExtraWidgetInterface
{
    public ?string $title = null;

    public array|string|null $formIds = null;

    public ?string $dateRange = null;

    public ?string $chartType = null;

    public ?bool $includeSpam = null;

    public static function displayName(): string
    {
        return Freeform::getInstance()->name.' '.Freeform::t('Radial Chart');
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

        if (null === $this->dateRange) {
            $this->dateRange = WidgetsService::RANGE_LAST_30_DAYS;
        }

        if (null === $this->chartType) {
            $this->chartType = WidgetsService::CHART_DONUT;
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
            [['chartType'], 'in', 'range' => [WidgetsService::CHART_PIE, WidgetsService::CHART_DONUT, WidgetsService::CHART_POLAR_AREA]],
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
            'freeform/_widgets/radial-charts/body',
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
            'freeform/_widgets/radial-charts/settings',
            [
                'settings' => $this,
                'formOptions' => $this->getFormService()->getAllFormNames(orderByName: true),
                'chartTypes' => [
                    WidgetsService::CHART_PIE => Freeform::t('Pie'),
                    WidgetsService::CHART_DONUT => Freeform::t('Donut'),
                    WidgetsService::CHART_POLAR_AREA => Freeform::t('Polar Area'),
                ],
                'dateRangeOptions' => $this->getWidgetsService()->getDateRanges(),
            ]
        );
    }

    private function getChartData(): RadialChartData
    {
        [$rangeStart, $rangeEnd] = $this->getWidgetsService()->getRange($this->dateRange);

        $forms = $this->getFormService()->getAllForms();

        $formList = [];
        if ('*' === $this->formIds) {
            $formList = $forms;
        } else {
            foreach ($forms as $form) {
                if (\in_array($form->getId(), $this->formIds)) {
                    $formList[$form->getId()] = $form;
                }
            }
        }

        $chartData = $this->getChartsService()->getRadialFormSubmissionData(
            $rangeStart,
            $rangeEnd,
            $formList,
            (bool) $this->includeSpam
        );

        $chartData->setChartType($this->chartType);

        return $chartData;
    }
}

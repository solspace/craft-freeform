<?php

namespace Solspace\Freeform\Library\Charts;

class LinearChartData implements \JsonSerializable
{
    const TYPE_BAR  = 'bar';
    const TYPE_LINE = 'line';

    /** @var string */
    private $chartType;

    /** @var array */
    private $labels;

    /** @var array */
    private $datasets;

    /** @var bool */
    private $stacked;

    /** @var bool */
    private $legends;

    /**\
     * LinearChartData constructor.
     */
    public function __construct()
    {
        $this->chartType = self::TYPE_LINE;
        $this->labels    = [];
        $this->datasets  = [];
        $this->stacked   = false;
        $this->legends   = true;
    }

    /**
     * @return string
     */
    public function getChartType(): string
    {
        return $this->chartType;
    }

    /**
     * @param string $chartType
     *
     * @return LinearChartData
     */
    public function setChartType(string $chartType): LinearChartData
    {
        $this->chartType = $chartType;

        return $this;
    }

    /**
     * @return array
     */
    public function getLabels(): array
    {
        return $this->labels;
    }

    /**
     * @param array $labels
     *
     * @return LinearChartData
     */
    public function setLabels(array $labels): LinearChartData
    {
        $this->labels = $labels;

        return $this;
    }

    /**
     * @return array
     */
    public function getDatasets(): array
    {
        return $this->datasets;
    }

    /**
     * @param array $datasets
     *
     * @return LinearChartData
     */
    public function setDatasets(array $datasets): LinearChartData
    {
        $this->datasets = $datasets;

        return $this;
    }

    /**
     * @return bool
     */
    public function isStacked(): bool
    {
        return $this->stacked;
    }

    /**
     * @param bool $stacked
     *
     * @return LinearChartData
     */
    public function setStacked(bool $stacked): LinearChartData
    {
        $this->stacked = $stacked;

        return $this;
    }

    /**
     * @return bool
     */
    public function isLegends(): bool
    {
        return $this->legends;
    }

    /**
     * @param bool $legends
     *
     * @return LinearChartData
     */
    public function setLegends(bool $legends): LinearChartData
    {
        $this->legends = $legends;

        return $this;
    }

    /**
     * @return array
     */
    public function jsonSerialize(): array
    {
        return [
            'type'    => $this->chartType,
            'data'    => [
                'labels'   => $this->labels,
                'datasets' => $this->datasets,
            ],
            'options' => [
                'tooltips'   => [
                    'backgroundColor' => 'rgba(250, 250, 250, 0.9)',
                    'titleFontColor'  => '#000',
                    'bodyFontColor'   => '#000',
                    'cornerRadius'    => 4,
                    'xPadding'        => 10,
                    'yPadding'        => 7,
                    'displayColors'   => false,
                ],
                'responsive' => true,
                'legend'     => [
                    'display' => $this->isLegends(),
                    'labels'  => [
                        'padding'       => 20,
                        'usePointStyle' => true,
                    ],
                ],
                'scales'     => [
                    'yAxes' => [
                        [
                            'stacked'     => $this->isStacked(),
                            'beginAtZero' => true,
                            'ticks'       => [
                                'maxTicksLimit' => 10,
                                'min'           => 0,
                            ],
                        ],
                    ],
                    'xAxes' => [
                        [
                            'stacked'   => $this->isStacked(),
                            'gridLines' => [
                                'display' => false,
                            ],
                        ],
                    ],
                ],
            ],
        ];
    }
}

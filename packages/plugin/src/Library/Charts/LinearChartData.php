<?php

namespace Solspace\Freeform\Library\Charts;

class LinearChartData implements \JsonSerializable
{
    const TYPE_BAR = 'bar';
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

    /*\
     * LinearChartData constructor.
     */
    public function __construct()
    {
        $this->chartType = self::TYPE_LINE;
        $this->labels = [];
        $this->datasets = [];
        $this->stacked = false;
        $this->legends = true;
    }

    public function getChartType(): string
    {
        return $this->chartType;
    }

    public function setChartType(string $chartType): self
    {
        $this->chartType = $chartType;

        return $this;
    }

    public function getLabels(): array
    {
        return $this->labels;
    }

    public function setLabels(array $labels): self
    {
        $this->labels = $labels;

        return $this;
    }

    public function getDatasets(): array
    {
        return $this->datasets;
    }

    public function setDatasets(array $datasets): self
    {
        $this->datasets = $datasets;

        return $this;
    }

    public function isStacked(): bool
    {
        return $this->stacked;
    }

    public function setStacked(bool $stacked): self
    {
        $this->stacked = $stacked;

        return $this;
    }

    public function isLegends(): bool
    {
        return $this->legends;
    }

    public function setLegends(bool $legends): self
    {
        $this->legends = $legends;

        return $this;
    }

    public function jsonSerialize(): array
    {
        return [
            'type' => $this->chartType,
            'data' => [
                'labels' => $this->labels,
                'datasets' => $this->datasets,
            ],
            'options' => [
                'tooltips' => [
                    'backgroundColor' => 'rgba(250, 250, 250, 0.9)',
                    'titleFontColor' => '#000',
                    'bodyFontColor' => '#000',
                    'cornerRadius' => 4,
                    'xPadding' => 10,
                    'yPadding' => 7,
                    'displayColors' => false,
                ],
                'responsive' => true,
                'legend' => [
                    'display' => $this->isLegends(),
                    'labels' => [
                        'padding' => 20,
                        'usePointStyle' => true,
                    ],
                ],
                'scales' => [
                    'yAxes' => [
                        [
                            'stacked' => $this->isStacked(),
                            'beginAtZero' => true,
                            'ticks' => [
                                'maxTicksLimit' => 10,
                                'min' => 0,
                            ],
                        ],
                    ],
                    'xAxes' => [
                        [
                            'stacked' => $this->isStacked(),
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

<?php

namespace Solspace\Freeform\Library\Charts;

class RadialChartData implements \JsonSerializable
{
    const TYPE_PIE = 'pie';
    const TYPE_DOUGHNUT = 'doughnut';
    const TYPE_POLAR_AREA = 'polarArea';

    /** @var string */
    private $chartType;

    /** @var array */
    private $labels;

    /** @var array */
    private $data;

    /** @var array */
    private $backgroundColors;

    /** @var array */
    private $hoverBackgroundColors;

    /** @var bool */
    private $legends;

    /**
     * RadialChartData constructor.
     */
    public function __construct()
    {
        $this->chartType = self::TYPE_DOUGHNUT;
        $this->labels = [];
        $this->data = [];
        $this->backgroundColors = [];
        $this->hoverBackgroundColors = [];
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

    public function getData(): array
    {
        return $this->data;
    }

    public function setData(array $data): self
    {
        $this->data = $data;

        return $this;
    }

    public function getBackgroundColors(): array
    {
        return $this->backgroundColors;
    }

    public function setBackgroundColors(array $backgroundColors): self
    {
        $this->backgroundColors = $backgroundColors;

        return $this;
    }

    public function getHoverBackgroundColors(): array
    {
        return $this->hoverBackgroundColors;
    }

    public function setHoverBackgroundColors(array $hoverBackgroundColors): self
    {
        $this->hoverBackgroundColors = $hoverBackgroundColors;

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
                'labels' => $this->getLabels(),
                'datasets' => [
                    [
                        'data' => $this->getData(),
                        'backgroundColor' => $this->getBackgroundColors(),
                        'hoverBackgroundColor' => $this->getHoverBackgroundColors(),
                    ],
                ],
            ],
            'options' => [
                'tooltips' => [
                    'backgroundColor' => 'rgba(250, 250, 250, 0.9)',
                    'titleFontColor' => '#000',
                    'bodyFontColor' => '#000',
                    'cornerRadius' => 3,
                    'xPadding' => 10,
                    'yPadding' => 7,
                    'displayColors' => false,
                ],
                'responsive' => true,
                'legend' => [
                    'display' => $this->isLegends(),
                    'labels' => [
                        'padding' => 15,
                        'usePointStyle' => true,
                    ],
                ],
            ],
        ];
    }
}

<?php

namespace Solspace\Freeform\Library\Charts;

class RadialChartData implements \JsonSerializable
{
    const TYPE_PIE        = 'pie';
    const TYPE_DOUGHNUT   = 'doughnut';
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
        $this->chartType             = self::TYPE_DOUGHNUT;
        $this->labels                = [];
        $this->data                  = [];
        $this->backgroundColors      = [];
        $this->hoverBackgroundColors = [];
        $this->legends               = true;
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
     * @return RadialChartData
     */
    public function setChartType(string $chartType): RadialChartData
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
     * @return RadialChartData
     */
    public function setLabels(array $labels): RadialChartData
    {
        $this->labels = $labels;

        return $this;
    }

    /**
     * @return array
     */
    public function getData(): array
    {
        return $this->data;
    }

    /**
     * @param array $data
     *
     * @return RadialChartData
     */
    public function setData(array $data): RadialChartData
    {
        $this->data = $data;

        return $this;
    }

    /**
     * @return array
     */
    public function getBackgroundColors(): array
    {
        return $this->backgroundColors;
    }

    /**
     * @param array $backgroundColors
     *
     * @return RadialChartData
     */
    public function setBackgroundColors(array $backgroundColors): RadialChartData
    {
        $this->backgroundColors = $backgroundColors;

        return $this;
    }

    /**
     * @return array
     */
    public function getHoverBackgroundColors(): array
    {
        return $this->hoverBackgroundColors;
    }

    /**
     * @param array $hoverBackgroundColors
     *
     * @return RadialChartData
     */
    public function setHoverBackgroundColors(array $hoverBackgroundColors): RadialChartData
    {
        $this->hoverBackgroundColors = $hoverBackgroundColors;

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
     * @return RadialChartData
     */
    public function setLegends(bool $legends): RadialChartData
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
                'labels'   => $this->getLabels(),
                'datasets' => [
                    [
                        'data'                 => $this->getData(),
                        'backgroundColor'      => $this->getBackgroundColors(),
                        'hoverBackgroundColor' => $this->getHoverBackgroundColors(),
                    ],
                ],
            ],
            'options' => [
                'tooltips'   => [
                    'backgroundColor' => 'rgba(250, 250, 250, 0.9)',
                    'titleFontColor'  => '#000',
                    'bodyFontColor'   => '#000',
                    'cornerRadius'    => 3,
                    'xPadding'        => 10,
                    'yPadding'        => 7,
                    'displayColors'   => false,
                ],
                'responsive' => true,
                'legend'     => [
                    'display' => $this->isLegends(),
                    'labels' => [
                        'padding'       => 15,
                        'usePointStyle' => true,
                    ],
                ],
            ],
        ];
    }
}

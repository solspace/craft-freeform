<?php

namespace Solspace\Freeform\Library\Charts;

class LinearItem implements \JsonSerializable
{
    /** @var string */
    private $label;

    /** @var string */
    private $borderColor;

    /** @var string */
    private $backgroundColor;

    /** @var int */
    private $pointRadius;

    /** @var string */
    private $pointBackgroundColor;

    /** @var float */
    private $lineTension;

    /** @var bool */
    private $fill;

    /** @var array */
    private $data;

    /**
     * LinearItem constructor.
     *
     * @param string $label
     * @param array  $color
     * @param array  $data
     */
    public function __construct(string $label, array $color, array $data)
    {
        $this->label = $label;
        $this->borderColor = $this->getColor($color);
        $this->backgroundColor = $this->borderColor;
        $this->pointBackgroundColor = $this->borderColor;
        $this->data = $data;

        $this->pointRadius = 3;
        $this->lineTension = 0.2;
        $this->fill = false;
    }

    /**
     * @return string
     */
    public function getLabel(): string
    {
        return $this->label;
    }

    /**
     * @param string $label
     *
     * @return LinearItem
     */
    public function setLabel(string $label): LinearItem
    {
        $this->label = $label;

        return $this;
    }

    /**
     * @return string
     */
    public function getBorderColor(): string
    {
        return $this->borderColor;
    }

    /**
     * @param array $borderColor
     *
     * @return LinearItem
     */
    public function setBorderColor(array $borderColor): LinearItem
    {
        $this->borderColor = $this->getColor($borderColor);

        return $this;
    }

    /**
     * @return string
     */
    public function getBackgroundColor(): string
    {
        return $this->backgroundColor;
    }

    /**
     * @param array $backgroundColor
     *
     * @return LinearItem
     */
    public function setBackgroundColor(array $backgroundColor): LinearItem
    {
        $this->backgroundColor = $this->getColor($backgroundColor);

        return $this;
    }

    /**
     * @return int
     */
    public function getPointRadius(): int
    {
        return $this->pointRadius;
    }

    /**
     * @param int $pointRadius
     *
     * @return LinearItem
     */
    public function setPointRadius(int $pointRadius): LinearItem
    {
        $this->pointRadius = $pointRadius;

        return $this;
    }

    /**
     * @return string
     */
    public function getPointBackgroundColor(): string
    {
        return $this->pointBackgroundColor;
    }

    /**
     * @param array $pointBackgroundColor
     *
     * @return LinearItem
     */
    public function setPointBackgroundColor(array $pointBackgroundColor): LinearItem
    {
        $this->pointBackgroundColor = $this->getColor($pointBackgroundColor);

        return $this;
    }

    /**
     * @return float
     */
    public function getLineTension(): float
    {
        return $this->lineTension;
    }

    /**
     * @param float $lineTension
     *
     * @return LinearItem
     */
    public function setLineTension(float $lineTension): LinearItem
    {
        $this->lineTension = $lineTension;

        return $this;
    }

    /**
     * @return bool
     */
    public function isFill(): bool
    {
        return $this->fill;
    }

    /**
     * @param bool $fill
     *
     * @return LinearItem
     */
    public function setFill(bool $fill): LinearItem
    {
        $this->fill = $fill;

        return $this;
    }

    /**
     * @return array
     */
    public function getData(): array
    {
        return array_values($this->data);
    }

    /**
     * @param array $data
     *
     * @return LinearItem
     */
    public function setData(array $data): LinearItem
    {
        $this->data = $data;

        return $this;
    }

    /**
     * @inheritDoc
     */
    public function jsonSerialize()
    {
        return [
            'label'                => $this->getLabel(),
            'borderColor'          => $this->getBorderColor(),
            'backgroundColor'      => $this->getBackgroundColor(),
            'pointRadius'          => $this->getPointRadius(),
            'pointBackgroundColor' => $this->getPointBackgroundColor(),
            'lineTension'          => $this->getLineTension(),
            'fill'                 => $this->isFill(),
            'data'                 => $this->getData(),
        ];
    }

    /**
     * @param array $color
     *
     * @return string
     */
    private function getColor(array $color): string
    {
        return sprintf('rgba(%s,1)', implode(',', $color));
    }
}

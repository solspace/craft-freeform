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

    public function getLabel(): string
    {
        return $this->label;
    }

    public function setLabel(string $label): self
    {
        $this->label = $label;

        return $this;
    }

    public function getBorderColor(): string
    {
        return $this->borderColor;
    }

    public function setBorderColor(array $borderColor): self
    {
        $this->borderColor = $this->getColor($borderColor);

        return $this;
    }

    public function getBackgroundColor(): string
    {
        return $this->backgroundColor;
    }

    public function setBackgroundColor(array $backgroundColor): self
    {
        $this->backgroundColor = $this->getColor($backgroundColor);

        return $this;
    }

    public function getPointRadius(): int
    {
        return $this->pointRadius;
    }

    public function setPointRadius(int $pointRadius): self
    {
        $this->pointRadius = $pointRadius;

        return $this;
    }

    public function getPointBackgroundColor(): string
    {
        return $this->pointBackgroundColor;
    }

    public function setPointBackgroundColor(array $pointBackgroundColor): self
    {
        $this->pointBackgroundColor = $this->getColor($pointBackgroundColor);

        return $this;
    }

    public function getLineTension(): float
    {
        return $this->lineTension;
    }

    public function setLineTension(float $lineTension): self
    {
        $this->lineTension = $lineTension;

        return $this;
    }

    public function isFill(): bool
    {
        return $this->fill;
    }

    public function setFill(bool $fill): self
    {
        $this->fill = $fill;

        return $this;
    }

    public function getData(): array
    {
        return array_values($this->data);
    }

    public function setData(array $data): self
    {
        $this->data = $data;

        return $this;
    }

    /**
     * {@inheritDoc}
     */
    public function jsonSerialize()
    {
        return [
            'label' => $this->getLabel(),
            'borderColor' => $this->getBorderColor(),
            'backgroundColor' => $this->getBackgroundColor(),
            'pointRadius' => $this->getPointRadius(),
            'pointBackgroundColor' => $this->getPointBackgroundColor(),
            'lineTension' => $this->getLineTension(),
            'fill' => $this->isFill(),
            'data' => $this->getData(),
        ];
    }

    private function getColor(array $color): string
    {
        return sprintf('rgba(%s,1)', implode(',', $color));
    }
}

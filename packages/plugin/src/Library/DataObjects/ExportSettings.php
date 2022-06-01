<?php

namespace Solspace\Freeform\Library\DataObjects;

class ExportSettings
{
    /** @var bool */
    private $removeNewlines;

    /** @var bool */
    private $exportLabels;

    /** @var null|string */
    private $timezone;

    /** @var bool */
    private $handlesAsNames;

    public function __construct(bool $removeNewlines = false, bool $exportLabels = false, string $timezone = null, bool $handlesAsNames = false)
    {
        $this->removeNewlines = $removeNewlines;
        $this->exportLabels = $exportLabels;
        $this->timezone = $timezone;
        $this->handlesAsNames = $handlesAsNames;
    }

    public function isRemoveNewlines(): bool
    {
        return $this->removeNewlines;
    }

    public function setRemoveNewlines(bool $removeNewlines): self
    {
        $this->removeNewlines = $removeNewlines;

        return $this;
    }

    public function isExportLabels(): bool
    {
        return $this->exportLabels;
    }

    public function setExportLabels(bool $exportLabels): self
    {
        $this->exportLabels = $exportLabels;

        return $this;
    }

    public function getTimezone()
    {
        return $this->timezone;
    }

    public function setTimezone(string $timezone): self
    {
        $this->timezone = $timezone;

        return $this;
    }

    public function isHandlesAsNames(): bool
    {
        return $this->handlesAsNames;
    }

    public function setHandlesAsNames(bool $handlesAsNames): self
    {
        $this->handlesAsNames = $handlesAsNames;

        return $this;
    }
}

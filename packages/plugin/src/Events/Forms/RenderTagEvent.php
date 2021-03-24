<?php

namespace Solspace\Freeform\Events\Forms;

use Solspace\Commons\Helpers\StringHelper;
use Solspace\Freeform\Events\ArrayableEvent;
use Solspace\Freeform\Library\Composer\Components\Form;

class RenderTagEvent extends ArrayableEvent
{
    const POSITION_BEGINNING = 'beginning';
    const POSITION_END = 'end';

    /** @var Form */
    private $form;

    /** @var string[] */
    private $chunks;

    public function __construct(Form $form)
    {
        $this->form = $form;
        $this->chunks = [];

        parent::__construct([]);
    }

    public function fields()
    {
        return ['form', 'chunks'];
    }

    public function getForm(): Form
    {
        return $this->form;
    }

    public function getChunks(): array
    {
        return $this->chunks;
    }

    public function addChunk(string $chunk, $position = self::POSITION_END): self
    {
        if (null === $position || self::POSITION_END === $position || !is_numeric($position)) {
            $this->chunks[] = $chunk;
        }

        if (self::POSITION_BEGINNING === $position) {
            array_unshift($this->chunks, $chunk);
        }

        if (is_numeric($position)) {
            array_splice($this->chunks, $position, 0, $chunk);
        }

        return $this;
    }

    public function getChunksAsString(): string
    {
        return StringHelper::implodeRecursively("\n", $this->chunks);
    }
}

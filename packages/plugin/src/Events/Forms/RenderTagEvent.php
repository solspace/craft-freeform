<?php

namespace Solspace\Freeform\Events\Forms;

use Solspace\Commons\Helpers\StringHelper;
use Solspace\Freeform\Events\ArrayableEvent;
use Solspace\Freeform\Events\FormEventInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;

class RenderTagEvent extends ArrayableEvent implements FormEventInterface
{
    public const POSITION_BEGINNING = 'beginning';
    public const POSITION_END = 'end';

    /** @var string[] */
    private array $chunks = [];

    public function __construct(private Form $form)
    {
        parent::__construct();
    }

    public function fields(): array
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
        if (self::POSITION_END === $position || !is_numeric($position)) {
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

    public function isScriptsDisabled(): bool
    {
        $settings = Freeform::getInstance()->settings;

        $isFooter = $settings->isFooterScripts();
        $isForm = $settings->isFormScripts();

        return !$isFooter && !$isForm;
    }
}

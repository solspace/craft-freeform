<?php

namespace Solspace\Freeform\Events\Forms;

use Solspace\Commons\Helpers\StringHelper;
use Solspace\Freeform\Events\ArrayableEvent;
use Solspace\Freeform\Events\FormEventInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\IsolatedTwig;

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

    public function addChunk(string $chunk, array $variables = [], $position = self::POSITION_END): self
    {
        static $isolatedTwig;

        if (!empty($variables)) {
            if (null === $isolatedTwig) {
                $isolatedTwig = new IsolatedTwig();
            }

            $chunk = $isolatedTwig->render($chunk, $variables);
        }

        if (self::POSITION_BEGINNING === $position) {
            array_unshift($this->chunks, $chunk);

            return $this;
        }

        if (is_numeric($position)) {
            array_splice($this->chunks, $position, 0, $chunk);

            return $this;
        }

        $this->chunks[] = $chunk;

        return $this;
    }

    public function getChunksAsString(): string
    {
        return StringHelper::implodeRecursively("\n", $this->chunks);
    }

    public function isScriptsDisabled(): bool
    {
        $settings = Freeform::getInstance()->settings;

        return $settings->isManualScripts();
    }
}

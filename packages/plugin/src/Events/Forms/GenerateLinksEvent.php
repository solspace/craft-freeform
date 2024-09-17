<?php

namespace Solspace\Freeform\Events\Forms;

use Solspace\Freeform\Bundles\Transformers\Builder\Form\Links\Link;
use Solspace\Freeform\Form\Form;
use yii\base\Event;

class GenerateLinksEvent extends Event
{
    private array $links = [];

    public function __construct(private Form $form, private \stdClass $formData)
    {
        parent::__construct();
    }

    public function getForm(): Form
    {
        return $this->form;
    }

    public function getFormData(): \stdClass
    {
        return $this->formData;
    }

    public function getLinks(): array
    {
        return $this->links;
    }

    public function add(
        string $label,
        string $handle,
        string $url,
        string $type,
        int $count = 1,
        bool $isInternal = false,
        ?int $atIndex = null,
    ): self {
        $link = new Link($label, $handle, $url, $type, $count, $isInternal);

        if (null !== $atIndex) {
            array_splice($this->links, $atIndex, 0, [$link]);
        } else {
            $this->links[] = $link;
        }

        return $this;
    }

    public function remove(int $index): self
    {
        unset($this->links[$index]);

        return $this;
    }
}

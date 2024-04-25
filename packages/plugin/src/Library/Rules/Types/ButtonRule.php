<?php

namespace Solspace\Freeform\Library\Rules\Types;

use Solspace\Freeform\Form\Layout\Page;
use Solspace\Freeform\Library\Rules\Rule;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Annotation\SerializedName;

class ButtonRule extends Rule
{
    public const DISPLAY_SHOW = 'show';
    public const DISPLAY_HIDE = 'hide';

    private Page $page;
    private string $button;
    private string $display;

    public function getPage(): Page
    {
        return $this->page;
    }

    #[Groups(['builder'])]
    #[SerializedName('page')]
    public function getPageUid(): string
    {
        return $this->page->getUid();
    }

    public function setPage(Page $page): self
    {
        $this->page = $page;

        return $this;
    }

    #[Groups(['builder', 'front-end'])]
    public function getButton(): string
    {
        return $this->button;
    }

    public function setButton(string $button): self
    {
        $this->button = $button;

        return $this;
    }

    #[Groups(['front-end', 'builder'])]
    public function getDisplay(): string
    {
        return $this->display;
    }

    public function setDisplay(string $display): self
    {
        $this->display = $display;

        return $this;
    }
}

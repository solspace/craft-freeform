<?php

namespace Solspace\Freeform\Library\Rules\Types;

use Solspace\Freeform\Form\Layout\Page;
use Solspace\Freeform\Library\Rules\Rule;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Annotation\SerializedName;

class ButtonRule extends Rule
{
    private Page $page;

    private string $button;

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

    #[Groups(['builder'])]
    public function getButton(): string
    {
        return $this->button;
    }

    public function setButton(string $button): self
    {
        $this->button = $button;

        return $this;
    }
}

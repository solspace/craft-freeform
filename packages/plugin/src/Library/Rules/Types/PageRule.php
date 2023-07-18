<?php

namespace Solspace\Freeform\Library\Rules\Types;

use Solspace\Freeform\Form\Layout\Page;
use Solspace\Freeform\Library\Rules\Rule;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Serializer\Annotation\SerializedName;

class PageRule extends Rule
{
    private Page $page;

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
}

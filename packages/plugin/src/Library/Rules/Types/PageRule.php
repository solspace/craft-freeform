<?php

namespace Solspace\Freeform\Library\Rules\Types;

use Solspace\Freeform\Form\Layout\Page;
use Solspace\Freeform\Library\Rules\Rule;

class PageRule extends Rule
{
    private Page $page;

    public function getPage(): Page
    {
        return $this->page;
    }

    public function setPage(Page $page): self
    {
        $this->page = $page;

        return $this;
    }
}

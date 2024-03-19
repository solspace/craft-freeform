<?php

namespace Solspace\Freeform\Events\Forms;

use Solspace\Freeform\Events\ArrayableEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Logging\FreeformLogger;

class PageJumpEvent extends ArrayableEvent
{
    private ?int $jumpToIndex = null;

    public function __construct(private Form $form)
    {
        parent::__construct();
    }

    public function fields(): array
    {
        return ['form'];
    }

    public function getForm(): Form
    {
        return $this->form;
    }

    public function getJumpToIndex(): ?int
    {
        return $this->jumpToIndex;
    }

    public function setJumpToIndex(?int $jumpToIndex = null): void
    {
        $totalPages = \count($this->getForm()->getLayout()->getPages());

        if ($jumpToIndex < $totalPages) {
            $this->jumpToIndex = $jumpToIndex;
        } else {
            Freeform::getInstance()->logger->getLogger(FreeformLogger::CONDITIONAL_RULE)->error(
                Freeform::t(
                    'Form "{form}" did not correctly jump to page index "{pageIndex}"',
                    [
                        'form' => $this->getForm()->getName(),
                        'pageIndex' => $this->jumpToIndex,
                    ]
                ),
                ['form' => $this->getForm()]
            );
        }
    }
}

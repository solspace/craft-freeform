<?php

namespace Solspace\Freeform\Bundles\Form\Types\Surveys\DTO;

use Solspace\Freeform\Bundles\Form\Types\Surveys\Collections\FieldTotalsCollection;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;

class FormTotals implements \IteratorAggregate, \Countable, \ArrayAccess, \JsonSerializable
{
    private Form $form;

    private FieldTotalsCollection $fieldTotals;

    public function __construct(Form $form)
    {
        $this->form = $form;
        $this->fieldTotals = new FieldTotalsCollection();
    }

    public function getForm(): Form
    {
        return $this->form;
    }

    public function getVotes(): int
    {
        $votes = 0;

        /** @var FieldTotals $totals */
        foreach ($this->getFieldTotals() as $totals) {
            $votes += $totals->getVotes();
        }

        return $votes;
    }

    public function getFieldTotals(): FieldTotalsCollection
    {
        return $this->fieldTotals;
    }

    public function jsonSerialize(): array
    {
        $submissionService = Freeform::getInstance()->submissions;
        $formIds = [$this->form->getId()];

        $submissions = $submissionService->getSubmissionCount($formIds);
        $spam = $submissionService->getSubmissionCount($formIds, null, true);

        return [
            'form' => [
                'id' => $this->form->getId(),
                'handle' => $this->form->getHandle(),
                'name' => $this->form->getName(),
                'color' => $this->form->getColor(),
                'submissions' => $submissions,
                'spam' => $spam,
            ],
            'votes' => $this->getVotes(),
            'results' => $this->getFieldTotals(),
        ];
    }

    public function getIterator(): \Traversable
    {
        return $this->fieldTotals->getIterator();
    }

    public function offsetExists($offset): bool
    {
        return $this->fieldTotals->offsetExists($offset);
    }

    public function offsetGet($offset): mixed
    {
        return $this->fieldTotals->offsetGet($offset);
    }

    public function offsetSet($offset, $value): void
    {
        $this->fieldTotals->offsetSet($offset, $value);
    }

    public function offsetUnset($offset): void
    {
        $this->fieldTotals->offsetUnset($offset);
    }

    public function count(): int
    {
        return $this->fieldTotals->count();
    }
}

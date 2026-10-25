<?php

namespace Solspace\Freeform\Fields\Implementations\Pro;

use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Fields\Interfaces\InputOnlyInterface;
use Solspace\Freeform\Fields\Interfaces\NoEmailPresenceInterface;
use Solspace\Freeform\Form\Layout\Layout;

#[Type(name: 'Form', typeShorthand: 'form-section', iconPath: __DIR__.'/../Icons/group.svg')]
class FormSectionField extends GroupField implements InputOnlyInterface, NoEmailPresenceInterface
{
    protected string $instructions = '';

    public function getType(): string
    {
        return 'form-section';
    }

    public function includeInGqlSchema(): bool
    {
        return false;
    }

    public function getStepLayout(): ?Layout
    {
        $form = $this->getForm();

        return $form->getCurrentPageIndex() === 0
            ? $this->getLayout()
            : $form->getCurrentPage()->getLayout();
    }

    protected function getInputHtml(): string
    {
        $content = '';
        foreach ($this->getStepLayout()?->getRows() ?? [] as $row) {
            foreach ($row->getFields() as $field) {
                $content .= $field->render();
            }
        }

        return $content.$this->getForm()->renderPageButtons();
    }
}

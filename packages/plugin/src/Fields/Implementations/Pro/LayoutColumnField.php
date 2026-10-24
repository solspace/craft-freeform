<?php

namespace Solspace\Freeform\Fields\Implementations\Pro;

use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Fields\Interfaces\InputOnlyInterface;
use Solspace\Freeform\Fields\Interfaces\NoEmailPresenceInterface;

/** Internal container created by LayoutField; never offered as a field type. */
#[Type(name: 'Column', typeShorthand: 'layout-column', iconPath: __DIR__.'/../Icons/layout.svg')]
class LayoutColumnField extends GroupField implements InputOnlyInterface, NoEmailPresenceInterface
{
    protected string $instructions = '';

    public function getType(): string
    {
        return 'layout-column';
    }

    public function includeInGqlSchema(): bool
    {
        return false;
    }

    protected function getInputHtml(): string
    {
        $content = '';
        foreach ($this->getLayout()?->getRows() ?? [] as $row) {
            foreach ($row->getFields() as $field) {
                $content .= $field->render();
            }
        }

        return $content;
    }
}

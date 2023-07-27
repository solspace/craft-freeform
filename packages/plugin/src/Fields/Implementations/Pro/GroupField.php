<?php

namespace Solspace\Freeform\Fields\Implementations\Pro;

use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Fields\AbstractField;
use Solspace\Freeform\Fields\Interfaces\ExtraFieldInterface;
use Solspace\Freeform\Fields\Interfaces\NoStorageInterface;
use Solspace\Freeform\Form\Layout\Layout;

#[Type(
    name: 'Group',
    typeShorthand: 'group',
    iconPath: __DIR__.'/../Icons/group.svg',
)]
class GroupField extends AbstractField implements NoStorageInterface, ExtraFieldInterface
{
    protected bool $required = false;

    protected ?Layout $layout;

    public function getLayout(): ?Layout
    {
        return $this->layout;
    }

    public function getType(): string
    {
        return self::TYPE_GROUP;
    }

    protected function getInputHtml(): string
    {
        return '';
    }
}

<?php

namespace Solspace\Freeform\Fields\Implementations\Pro;

use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Implementations\Layout\GroupFieldLayoutTransformer;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Section;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Fields\AbstractField;
use Solspace\Freeform\Fields\Interfaces\ExtraFieldInterface;
use Solspace\Freeform\Fields\Interfaces\NoEncryptionInterface;
use Solspace\Freeform\Fields\Interfaces\NoStorageInterface;
use Solspace\Freeform\Form\Layout\Layout;

#[Type(
    name: 'Group',
    typeShorthand: 'group',
    iconPath: __DIR__.'/../Icons/group.svg',
)]
class GroupField extends AbstractField implements NoEncryptionInterface, NoStorageInterface, ExtraFieldInterface
{
    protected bool $required = false;

    // Hides option in Pro edition
    #[Flag('')]
    protected bool $encryption = false;

    #[ValueTransformer(GroupFieldLayoutTransformer::class)]
    #[Section('advanced')]
    #[Input\Hidden]
    protected ?Layout $layout = null;

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

<?php

namespace Solspace\Freeform\Fields\Implementations\Pro;

use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Fields\AbstractField;
use Solspace\Freeform\Fields\Interfaces\ExtraFieldInterface;
use Solspace\Freeform\Fields\Interfaces\NoRenderInterface;
use Solspace\Freeform\Fields\Interfaces\PersistentValueInterface;
use Solspace\Freeform\Fields\Interfaces\SingleValueInterface;
use Solspace\Freeform\Fields\Traits\SingleValueTrait;
use Solspace\Freeform\Fields\Traits\StaticValueTrait;

#[Type(
    name: 'Invisible',
    typeShorthand: 'invisible',
    iconPath: __DIR__.'/../Icons/text.svg',
)]
class InvisibleField extends AbstractField implements ExtraFieldInterface, SingleValueInterface, PersistentValueInterface, NoRenderInterface
{
    use SingleValueTrait;
    use StaticValueTrait;

    /**
     * Return the field TYPE.
     */
    public function getType(): string
    {
        return self::TYPE_INVISIBLE;
    }

    /**
     * Assemble the Input HTML string.
     */
    protected function getInputHtml(): string
    {
        return '';
    }
}

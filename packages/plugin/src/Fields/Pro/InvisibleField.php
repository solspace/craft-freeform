<?php

namespace Solspace\Freeform\Fields\Pro;

use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Library\Composer\Components\AbstractField;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\ExtraFieldInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\NoRenderInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\PersistentValueInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\SingleValueInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Traits\SingleValueTrait;
use Solspace\Freeform\Library\Composer\Components\Fields\Traits\StaticValueTrait;

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

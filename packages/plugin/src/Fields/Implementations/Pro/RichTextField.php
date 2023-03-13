<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2022, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Fields\Implementations\Pro;

use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Fields\AbstractField;
use Solspace\Freeform\Fields\Interfaces\DefaultFieldInterface;
use Solspace\Freeform\Fields\Interfaces\ExtraFieldInterface;
use Solspace\Freeform\Fields\Interfaces\InputOnlyInterface;
use Solspace\Freeform\Fields\Interfaces\NoStorageInterface;
use Solspace\Freeform\Fields\Interfaces\SingleValueInterface;
use Solspace\Freeform\Fields\Traits\SingleStaticValueTrait;

#[Type(
    name: 'Rich Text',
    typeShorthand: 'rich-text',
    iconPath: __DIR__.'/../Icons/text.svg',
)]
class RichTextField extends AbstractField implements DefaultFieldInterface, SingleValueInterface, InputOnlyInterface, NoStorageInterface, ExtraFieldInterface
{
    use SingleStaticValueTrait;

    /**
     * Return the field TYPE.
     */
    public function getType(): string
    {
        return self::TYPE_RICH_TEXT;
    }

    /**
     * Outputs the HTML of input.
     */
    public function getInputHtml(): string
    {
        return $this->getValue();
    }
}

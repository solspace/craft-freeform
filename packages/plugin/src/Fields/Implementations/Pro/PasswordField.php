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
use Solspace\Freeform\Fields\Implementations\TextField;
use Solspace\Freeform\Fields\Interfaces\DefaultFieldInterface;
use Solspace\Freeform\Fields\Interfaces\ExtraFieldInterface;
use Solspace\Freeform\Fields\Interfaces\NoStorageInterface;
use Solspace\Freeform\Fields\Interfaces\RememberPostedValueInterface;

#[Type(
    name: 'Password',
    typeShorthand: 'password',
    iconPath: __DIR__.'/../Icons/text.svg',
)]
class PasswordField extends TextField implements DefaultFieldInterface, NoStorageInterface, ExtraFieldInterface, RememberPostedValueInterface
{
    public function getType(): string
    {
        return self::TYPE_PASSWORD;
    }

    public function getInputHtml(): string
    {
        $output = parent::getInputHtml();

        return str_replace('type="text"', 'type="password"', $output);
    }
}

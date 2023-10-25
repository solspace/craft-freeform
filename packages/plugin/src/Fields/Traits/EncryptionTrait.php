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

namespace Solspace\Freeform\Fields\Traits;

use Solspace\Freeform\Attributes\Property\Flag;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Section;

trait EncryptionTrait
{
    #[Section(
        handle: 'advanced',
        label: 'Advanced',
        icon: __DIR__.'/../SectionIcons/advanced.svg',
        order: 1000,
    )]
    #[Flag(Flag::PRO)]
    #[Input\Boolean(
        label: 'Encrypt field data',
    )]
    protected bool $encrypted = false;

    public function isEncrypted(): bool
    {
        return $this->encrypted;
    }
}

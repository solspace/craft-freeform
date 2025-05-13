<?php

/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2025, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Fields\Implementations\Pro;

use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\Input\ToolbarInterface;
use Solspace\Freeform\Fields\AbstractField;
use Solspace\Freeform\Fields\Interfaces\ExtraFieldInterface;
use Solspace\Freeform\Fields\Interfaces\InputOnlyInterface;
use Solspace\Freeform\Fields\Interfaces\NoEmailPresenceInterface;
use Solspace\Freeform\Fields\Interfaces\NoStorageInterface;
use Solspace\Freeform\Form\Settings\Implementations\Toolbars\RichTextToolbarConfiguration;

#[Type(
    name: 'Rich Text',
    typeShorthand: 'rich-text',
    iconPath: __DIR__.'/../Icons/rich-text.svg',
    previewTemplatePath: __DIR__.'/../PreviewTemplates/rich-text.ejs',
)]
class RichTextField extends AbstractField implements ToolbarInterface, InputOnlyInterface, NoStorageInterface, ExtraFieldInterface, NoEmailPresenceInterface
{
    protected string $instructions = '';
    protected bool $required = false;

    #[Input\Wysiwyg(
        label: 'Content',
        instructions: 'The HTML content to be rendered',
        order: 1,
        value: null,
        placeholder: null,
        width: null,
        disabled: null,
        menu: false,
        statusbar: false,
        toggleEditor: false,
        toolbar: RichTextToolbarConfiguration::class,
    )]
    protected ?string $content = '';

    public function getContent(): string
    {
        return $this->content ?? '';
    }

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
        return $this->getContent();
    }

    public function includeInGqlSchema(): bool
    {
        return false;
    }
}

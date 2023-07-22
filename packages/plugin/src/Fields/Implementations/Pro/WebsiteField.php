<?php

namespace Solspace\Freeform\Fields\Implementations\Pro;

use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Fields\Implementations\TextField;
use Solspace\Freeform\Fields\Interfaces\ExtraFieldInterface;

#[Type(
    name: 'Website',
    typeShorthand: 'website',
    iconPath: __DIR__.'/../Icons/website.svg',
    previewTemplatePath: __DIR__.'/../PreviewTemplates/text.ejs',
)]
class WebsiteField extends TextField implements ExtraFieldInterface
{
    protected string $customInputType = 'url';

    /**
     * Return the field TYPE.
     */
    public function getType(): string
    {
        return self::TYPE_WEBSITE;
    }
}

<?php

namespace Solspace\Freeform\Fields\Implementations\Pro;

use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Fields\Implementations\TextField;
use Solspace\Freeform\Fields\Interfaces\ExtraFieldInterface;
use Solspace\Freeform\Fields\Validation\Constraints\WebsiteConstraint;

#[Type(
    name: 'Website',
    typeShorthand: 'website',
    iconPath: __DIR__.'/../Icons/text.svg',
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

    /**
     * {@inheritDoc}
     */
    public function getConstraints(): array
    {
        $constraints = parent::getConstraints();
        $constraints[] = new WebsiteConstraint($this->translate('Website not valid'));

        return $constraints;
    }
}

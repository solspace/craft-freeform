<?php

namespace Solspace\Freeform\Fields\Implementations\Pro;

use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\TextField;
use Solspace\Freeform\Fields\Interfaces\ExtraFieldInterface;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Attributes\FieldAttributesCollection;

#[Type(
    name: 'Website',
    typeShorthand: 'website',
    iconPath: __DIR__.'/../Icons/website.svg',
    previewTemplatePath: __DIR__.'/../PreviewTemplates/text.ejs',
)]
class WebsiteField extends TextField implements ExtraFieldInterface
{
    // Character counts are only configurable on Text and Textarea fields.
    protected bool $showCharacterCount = false;

    protected string $customInputType = 'url';

    public static function normalizeValue(string $value): string
    {
        $value = preg_replace('/^\s+|\s+$/u', '', $value) ?? $value;
        $bare = str_starts_with($value, '//') ? substr($value, 2) : $value;

        // Keep in sync with normalizeWebsite() in the shared frontend runtime.
        if (preg_match('/^(?:[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?\.)+[a-z]{2,15}(?:[\/?#][^\s]*)?$/i', $bare)) {
            return 'https://'.$bare;
        }

        return $value;
    }

    public function setValue(mixed $value): FieldInterface
    {
        return parent::setValue(\is_string($value) ? self::normalizeValue($value) : $value);
    }

    public function getAttributes(): FieldAttributesCollection
    {
        $attributes = parent::getAttributes();
        $attributes->getInput()
            ->replace('data-freeform-website', true)
            ->setIfEmpty('data-website-error', Freeform::t('Enter a website address, like example.com.'))
        ;

        return $attributes;
    }

    /**
     * Return the field TYPE.
     */
    public function getType(): string
    {
        return self::TYPE_WEBSITE;
    }
}

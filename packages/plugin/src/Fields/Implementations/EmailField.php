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

namespace Solspace\Freeform\Fields\Implementations;

use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Fields\AbstractField;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Interfaces\DefaultValueInterface;
use Solspace\Freeform\Fields\Interfaces\EncryptionInterface;
use Solspace\Freeform\Fields\Interfaces\PlaceholderInterface;
use Solspace\Freeform\Fields\Interfaces\RecipientInterface;
use Solspace\Freeform\Fields\Traits\DefaultTextValueTrait;
use Solspace\Freeform\Fields\Traits\EncryptionTrait;
use Solspace\Freeform\Fields\Traits\PlaceholderTrait;
use Solspace\Freeform\Freeform;

#[Type(
    name: 'Email',
    typeShorthand: 'email',
    iconPath: __DIR__.'/Icons/email.svg',
    previewTemplatePath: __DIR__.'/PreviewTemplates/text.ejs',
)]
class EmailField extends AbstractField implements RecipientInterface, PlaceholderInterface, DefaultValueInterface, EncryptionInterface
{
    use DefaultTextValueTrait;
    use EncryptionTrait;
    use PlaceholderTrait;

    /**
     * Return the field TYPE.
     */
    public function getType(): string
    {
        return FieldInterface::TYPE_EMAIL;
    }

    /**
     * Outputs the HTML of input.
     */
    public function getInputHtml(): string
    {
        $attributes = $this->getAttributes()
            ->getInput()
            ->clone()
            ->setIfEmpty('name', $this->getHandle())
            ->setIfEmpty('type', $this->getType())
            ->setIfEmpty('id', $this->getIdAttribute())
            ->setIfEmpty('placeholder', Freeform::t($this->getPlaceholder()))
            ->setIfEmpty('value', $this->getValue())
            ->set($this->getRequiredAttribute())
        ;

        return '<input'.$attributes.' />';
    }

    /**
     * Returns an array value of all possible recipient Email addresses.
     *
     * Either returns an ["email", "email"] array
     * Or an array with keys as recipient names, like ["Jon Doe" => "email", ..]
     */
    public function getRecipients(): array
    {
        $recipients = [$this->getValue()];

        return array_filter($recipients);
    }
}

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

use Egulias\EmailValidator\EmailValidator;
use Egulias\EmailValidator\Validation\NoRFCWarningsValidation;
use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Fields\AbstractField;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Interfaces\PlaceholderInterface;
use Solspace\Freeform\Fields\Interfaces\RecipientInterface;
use Solspace\Freeform\Fields\Interfaces\SingleValueInterface;
use Solspace\Freeform\Fields\Traits\PlaceholderTrait;
use Solspace\Freeform\Fields\Traits\SingleValueTrait;
use Solspace\Freeform\Freeform;

#[Type(
    name: 'Email',
    typeShorthand: 'email',
    iconPath: __DIR__.'/Icons/text.svg',
)]
class EmailField extends AbstractField implements RecipientInterface, SingleValueInterface, PlaceholderInterface
{
    use PlaceholderTrait;
    use SingleValueTrait;

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
        $attributes = $this->getCustomAttributes();
        $this->addInputAttribute('class', $attributes->getClass());

        return '<input '
            .$this->getInputAttributesString()
            .$this->getAttributeString('name', $this->getHandle())
            .$this->getAttributeString('type', $this->getType())
            .$this->getAttributeString('id', $this->getIdAttribute())
            .$this->getAttributeString(
                'placeholder',
                Freeform::t($attributes->getPlaceholder() ?: $this->getPlaceholder())
            )
            .$this->getAttributeString('value', $this->getValue())
            .$this->getRequiredAttribute()
            .$attributes->getInputAttributesAsString()
            .'/>';
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

    /**
     * Validate the field and add error messages if any.
     */
    protected function validate(): array
    {
        $errors = parent::validate();

        $validator = new EmailValidator();
        $email = $this->getValue();

        if (empty($email)) {
            return $errors;
        }

        $hasDot = preg_match('/@.+\..+$/', $email);

        if (!$hasDot || !$validator->isValid($email, new NoRFCWarningsValidation())) {
            $errors[] = $this->translate('{email} is not a valid email address', ['email' => $email]);
        }

        return $errors;
    }
}

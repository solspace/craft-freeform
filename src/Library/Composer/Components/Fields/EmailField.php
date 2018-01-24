<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2016, Solspace, Inc.
 * @link          https://solspace.com/craft/freeform
 * @license       https://solspace.com/software/license-agreement
 */

namespace Solspace\Freeform\Library\Composer\Components\Fields;

use Egulias\EmailValidator\EmailValidator;
use Egulias\EmailValidator\Validation\NoRFCWarningsValidation;
use Solspace\Freeform\Library\Composer\Components\AbstractField;
use Solspace\Freeform\Library\Composer\Components\FieldInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\MultipleValueInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\PlaceholderInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\RecipientInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Traits\MultipleValueTrait;
use Solspace\Freeform\Library\Composer\Components\Fields\Traits\PlaceholderTrait;
use Solspace\Freeform\Library\Composer\Components\Fields\Traits\RecipientTrait;

class EmailField extends AbstractField implements RecipientInterface, MultipleValueInterface, PlaceholderInterface
{
    use PlaceholderTrait;
    use MultipleValueTrait;
    use RecipientTrait;

    /**
     * Return the field TYPE
     *
     * @return string
     */
    public function getType(): string
    {
        return FieldInterface::TYPE_EMAIL;
    }

    /**
     * Outputs the HTML of input
     *
     * @return string
     */
    public function getInputHtml(): string
    {
        $attributes = $this->getCustomAttributes();

        $values = $this->getValue();
        if (empty($values)) {
            $values = [''];
        }

        $output = '';
        foreach ($values as $value) {
            $output .= '<input '
                . $this->getAttributeString('name', $this->getHandle())
                . $this->getAttributeString('type', $this->getType())
                . $this->getAttributeString('id', $this->getIdAttribute())
                . $this->getAttributeString('class', $attributes->getClass())
                . $this->getAttributeString(
                    'placeholder',
                    $this->getForm()->getTranslator()->translate(
                        $attributes->getPlaceholder() ?: $this->getPlaceholder()
                    )
                )
                . $this->getAttributeString('value', $value, false)
                . $this->getRequiredAttribute()
                . $attributes->getInputAttributesAsString()
                . '/>';
        }

        return $output;
    }

    /**
     * Returns an array value of all possible recipient Email addresses
     *
     * Either returns an ["email", "email"] array
     * Or an array with keys as recipient names, like ["Jon Doe" => "email", ..]
     *
     * @return array
     */
    public function getRecipients(): array
    {
        return $this->getValue();
    }

    /**
     * Validate the field and add error messages if any
     *
     * @return array
     */
    protected function validate(): array
    {
        $errors = parent::validate();

        $validator = new EmailValidator();
        foreach ($this->getValue() as $email) {
            if (empty($email)) {
                continue;
            }

            $hasDot = preg_match('/@.+\..+$/', $email);

            if (!$hasDot || !$validator->isValid($email, new NoRFCWarningsValidation())) {
                $errors[] = $this->translate('{email} is not a valid email address', ['email' => $email]);
            }
        }

        return $errors;
    }
}

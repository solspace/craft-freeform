<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2018, Solspace, Inc.
 * @link          https://solspace.com/craft/freeform
 * @license       https://solspace.com/software/license-agreement
 */

namespace Solspace\Freeform\Library\Composer\Components;

use Solspace\Freeform\Library\Composer\Components\Validation\Constraints\ConstraintInterface;

interface FieldInterface
{
    const TYPE_TEXT               = 'text';
    const TYPE_TEXTAREA           = 'textarea';
    const TYPE_HIDDEN             = 'hidden';
    const TYPE_SELECT             = 'select';
    const TYPE_MULTIPLE_SELECT    = 'multiple_select';
    const TYPE_CHECKBOX           = 'checkbox';
    const TYPE_CHECKBOX_GROUP     = 'checkbox_group';
    const TYPE_RADIO_GROUP        = 'radio_group';
    const TYPE_HTML               = 'html';
    const TYPE_SUBMIT             = 'submit';
    const TYPE_DYNAMIC_RECIPIENTS = 'dynamic_recipients';
    const TYPE_EMAIL              = 'email';
    const TYPE_MAILING_LIST       = 'mailing_list';
    const TYPE_FILE               = 'file';
    const TYPE_PASSWORD           = 'password';

    const TYPE_DATETIME     = 'datetime';
    const TYPE_NUMBER       = 'number';
    const TYPE_PHONE        = 'phone';
    const TYPE_WEBSITE      = 'website';
    const TYPE_RATING       = 'rating';
    const TYPE_REGEX        = 'regex';
    const TYPE_CONFIRMATION = 'confirmation';
    const TYPE_RECAPTCHA    = 'recaptcha';

    const TYPE_CREDIT_CARD_DETAILS = 'cc_details';
    const TYPE_CREDIT_CARD_NUMBER  = 'cc_number';
    const TYPE_CREDIT_CARD_EXPIRY  = 'cc_expiry';
    const TYPE_CREDIT_CARD_CVC     = 'cc_cvc';

    /**
     * Returns the INPUT type
     *
     * @return string
     */
    public function getType(): string;

    /**
     * @return mixed
     */
    public function getValue();

    /**
     * Gets whatever value is set and returns its string representation
     *
     * @return string
     */
    public function getValueAsString(): string;

    /**
     * @return string|null
     */
    public function getHandle();

    /**
     * @param mixed $value
     *
     * @return $this
     */
    public function setValue($value);

    /**
     * Returns an array of error messages
     *
     * @return array|null
     */
    public function getErrors();

    /**
     * @return bool
     */
    public function hasErrors(): bool;

    /**
     * @param string $error
     *
     * @return AbstractField
     */
    public function addError(string $error): AbstractField;

    /**
     * Renders the <label> and <input> tags combined
     *
     * @return \Twig_Markup
     */
    public function render(): \Twig_Markup;

    /**
     * Renders the <label> tag
     *
     * @return \Twig_Markup
     */
    public function renderLabel(): \Twig_Markup;

    /**
     * Outputs the HTML of input
     *
     * @return \Twig_Markup
     */
    public function renderInput(): \Twig_Markup;

    /**
     * Outputs the HTML of errors
     *
     * @return \Twig_Markup
     */
    public function renderErrors(): \Twig_Markup;

    /**
     * Validates the Field value
     *
     * @return bool
     */
    public function isValid(): bool;

    /**
     * @return bool
     */
    public function canRender(): bool;

    /**
     * @return bool
     */
    public function canStoreValues(): bool;

    /**
     * @return ConstraintInterface[]
     */
    public function getConstraints(): array;
}

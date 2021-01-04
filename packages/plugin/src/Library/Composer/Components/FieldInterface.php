<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2021, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Library\Composer\Components;

use Solspace\Freeform\Library\Composer\Components\Validation\Constraints\ConstraintInterface;
use Twig\Markup;

interface FieldInterface
{
    const TYPE_TEXT = 'text';
    const TYPE_TEXTAREA = 'textarea';
    const TYPE_HIDDEN = 'hidden';
    const TYPE_SELECT = 'select';
    const TYPE_MULTIPLE_SELECT = 'multiple_select';
    const TYPE_CHECKBOX = 'checkbox';
    const TYPE_CHECKBOX_GROUP = 'checkbox_group';
    const TYPE_RADIO_GROUP = 'radio_group';
    const TYPE_HTML = 'html';
    const TYPE_SUBMIT = 'submit';
    const TYPE_DYNAMIC_RECIPIENTS = 'dynamic_recipients';
    const TYPE_EMAIL = 'email';
    const TYPE_MAILING_LIST = 'mailing_list';
    const TYPE_FILE = 'file';
    const TYPE_PASSWORD = 'password';

    const TYPE_RICH_TEXT = 'rich_text';
    const TYPE_DATETIME = 'datetime';
    const TYPE_NUMBER = 'number';
    const TYPE_PHONE = 'phone';
    const TYPE_WEBSITE = 'website';
    const TYPE_RATING = 'rating';
    const TYPE_REGEX = 'regex';
    const TYPE_CONFIRMATION = 'confirmation';
    const TYPE_RECAPTCHA = 'recaptcha';
    const TYPE_OPINION_SCALE = 'opinion_scale';
    const TYPE_SIGNATURE = 'signature';
    const TYPE_TABLE = 'table';
    const TYPE_INVISIBLE = 'invisible';

    const TYPE_CREDIT_CARD_DETAILS = 'cc_details';
    const TYPE_CREDIT_CARD_NUMBER = 'cc_number';
    const TYPE_CREDIT_CARD_EXPIRY = 'cc_expiry';
    const TYPE_CREDIT_CARD_CVC = 'cc_cvc';

    /**
     * Returns the INPUT type.
     */
    public function getType(): string;

    /**
     * @return mixed
     */
    public function getValue();

    /**
     * Gets whatever value is set and returns its string representation.
     */
    public function getValueAsString(): string;

    /**
     * @return null|string
     */
    public function getHandle();

    /**
     * @param mixed $value
     *
     * @return $this
     */
    public function setValue($value);

    /**
     * Returns an array of error messages.
     *
     * @return null|array
     */
    public function getErrors();

    public function hasErrors(): bool;

    public function addError(string $error): AbstractField;

    /**
     * Renders the <label> and <input> tags combined.
     */
    public function render(): Markup;

    /**
     * Renders the <label> tag.
     */
    public function renderLabel(): Markup;

    /**
     * Outputs the HTML of input.
     */
    public function renderInput(): Markup;

    /**
     * Outputs the HTML of errors.
     */
    public function renderErrors(): Markup;

    /**
     * Validates the Field value.
     */
    public function isValid(): bool;

    public function canRender(): bool;

    public function canStoreValues(): bool;

    /**
     * @return ConstraintInterface[]
     */
    public function getConstraints(): array;
}

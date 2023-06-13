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

namespace Solspace\Freeform\Fields;

use Twig\Markup;

interface FieldInterface
{
    public const EVENT_TRANSFORM_FROM_POST = 'transform-from-post';
    public const EVENT_TRANSFORM_FROM_STORAGE = 'transform-from-storage';
    public const EVENT_TRANSFORM_FROM_DATABASE = 'transform-from-database';

    public const EVENT_BEFORE_VALIDATE = 'before-validate';
    public const EVENT_AFTER_VALIDATE = 'after-validate';

    public const TYPE_TEXT = 'text';
    public const TYPE_TEXTAREA = 'textarea';
    public const TYPE_HIDDEN = 'hidden';
    public const TYPE_SELECT = 'select';
    public const TYPE_MULTIPLE_SELECT = 'multiple-select';
    public const TYPE_CHECKBOX = 'checkbox';
    public const TYPE_CHECKBOX_GROUP = 'checkbox-group';
    public const TYPE_RADIO_GROUP = 'radio-group';
    public const TYPE_HTML = 'html';
    public const TYPE_SUBMIT = 'submit';
    public const TYPE_SAVE = 'save';
    public const TYPE_DYNAMIC_RECIPIENTS = 'dynamic-recipients';
    public const TYPE_EMAIL = 'email';
    public const TYPE_MAILING_LIST = 'mailing-list';
    public const TYPE_FILE = 'file';
    public const TYPE_FILE_DRAG_AND_DROP = 'file-drag-and-drop';
    public const TYPE_PASSWORD = 'password';

    public const TYPE_RICH_TEXT = 'rich-text';
    public const TYPE_DATETIME = 'datetime';
    public const TYPE_NUMBER = 'number';
    public const TYPE_PHONE = 'phone';
    public const TYPE_WEBSITE = 'website';
    public const TYPE_RATING = 'rating';
    public const TYPE_REGEX = 'regex';
    public const TYPE_CONFIRMATION = 'confirmation';
    public const TYPE_RECAPTCHA = 'recaptcha';
    public const TYPE_OPINION_SCALE = 'opinion-scale';
    public const TYPE_SIGNATURE = 'signature';
    public const TYPE_TABLE = 'table';
    public const TYPE_INVISIBLE = 'invisible';

    public const TYPE_CREDIT_CARD_DETAILS = 'cc-details';
    public const TYPE_CREDIT_CARD_NUMBER = 'cc-number';
    public const TYPE_CREDIT_CARD_EXPIRY = 'cc-expiry';
    public const TYPE_CREDIT_CARD_CVC = 'cc-cvc';

    public function getType(): string;

    public function getValue(): mixed;

    public function setValue(mixed $value): self;

    public function getValueAsString(): string;

    public function getId(): ?int;

    public function getUid(): ?string;

    public function getHandle(): ?string;

    public function getLabel(): ?string;

    public function getInstructions(): ?string;

    public function isRequired(): bool;

    public function getErrors(): ?array;

    public function hasErrors(): bool;

    public function addError(string $error): AbstractField;

    public function render(): Markup;

    public function renderLabel(): Markup;

    public function renderInput(): Markup;

    public function renderErrors(): Markup;

    public function isValid(): bool;

    public function canRender(): bool;

    public function canStoreValues(): bool;

    public function getConstraints(): array;
}

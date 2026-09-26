<?php

/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2026, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Fields\Implementations\Pro;

use craft\helpers\Html;
use GraphQL\Type\Definition\Type as GQLType;
use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Fields\Implementations\TextField;
use Solspace\Freeform\Fields\Interfaces\CharacterVariabilityInterface;
use Solspace\Freeform\Fields\Interfaces\ExtraFieldInterface;
use Solspace\Freeform\Fields\Interfaces\MinLengthInterface;
use Solspace\Freeform\Fields\Interfaces\NoEmailPresenceInterface;
use Solspace\Freeform\Fields\Interfaces\NoStorageInterface;
use Solspace\Freeform\Fields\Interfaces\RememberPostedValueInterface;
use Solspace\Freeform\Fields\Traits\CharacterVariabilityTrait;
use Solspace\Freeform\Fields\Traits\MinLengthTrait;
use Solspace\Freeform\Freeform;

#[Type(
    name: 'Password',
    typeShorthand: 'password',
    iconPath: __DIR__.'/../Icons/password.svg',
    previewTemplatePath: __DIR__.'/../PreviewTemplates/password.ejs',
)]
class PasswordField extends TextField implements NoStorageInterface, ExtraFieldInterface, RememberPostedValueInterface, NoEmailPresenceInterface, MinLengthInterface, CharacterVariabilityInterface
{
    use CharacterVariabilityTrait;
    use MinLengthTrait;
    // Character counts are only configurable on Text and Textarea fields.
    protected bool $showCharacterCount = false;

    #[Input\Boolean(
        label: 'Show Password Toggle',
        instructions: 'Let visitors show or hide their password while entering it.',
    )]
    protected bool $showPasswordToggle = false;

    #[Input\Hidden]
    protected bool $encrypted = false;

    public function isShowPasswordToggle(): bool
    {
        return $this->showPasswordToggle;
    }

    public function getPasswordToggleLabels(): array
    {
        return ['show' => Freeform::t('Show password'), 'hide' => Freeform::t('Hide password')];
    }

    public function getType(): string
    {
        return self::TYPE_PASSWORD;
    }

    public function getInputHtml(): string
    {
        $attributes = $this->getAttributes()->getInput()->clone()
            ->replace('type', 'password')
            ->setIfEmpty('name', $this->getHandle())
            ->setIfEmpty('id', $this->getIdAttribute())
            ->setIfEmpty('placeholder', $this->translate('placeholder', $this->getPlaceholder()))
            ->setIfEmpty('value', $this->getValue())
        ;

        $this->addBrowserAutofillAttribute($attributes);

        if ($this->showPasswordToggle) {
            $labels = $this->getPasswordToggleLabels();
            $attributes->replace('data-freeform-password-toggle', true)
                ->replace('data-password-show-label', $labels['show'])
                ->replace('data-password-hide-label', $labels['hide'])
            ;
        }

        return Html::tag('input', '', $attributes->toHtmlTagArray(['field' => $this]));
    }

    public function getContentGqlMutationArgumentType(): array|GQLType
    {
        $description = $this->getContentGqlDescription();

        if (!empty($this->getMinLength())) {
            $description[] = 'Min length: '.$this->getMinLength().'.';
        }

        if (!empty($this->getMaxLength())) {
            $description[] = 'Max length: '.$this->getMaxLength().'.';
        }

        if ($this->isUseCharacterVariability()) {
            $description[] = 'Character Variability: The value should contain at least one number, one lowercase letter, one uppercase letter, and one special character.';
        }

        $description = implode("\n", $description);

        return [
            'name' => $this->getContentGqlHandle(),
            'type' => $this->getContentGqlType(),
            'description' => trim($description),
        ];
    }
}

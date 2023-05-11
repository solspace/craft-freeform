<?php

namespace Solspace\Freeform\Fields\Implementations\Pro;

use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Bundles\Form\SaveForm\SaveForm;
use Solspace\Freeform\Fields\AbstractField;
use Solspace\Freeform\Fields\Interfaces\DefaultFieldInterface;
use Solspace\Freeform\Fields\Interfaces\InputOnlyInterface;
use Solspace\Freeform\Fields\Interfaces\NoStorageInterface;
use Solspace\Freeform\Fields\Traits\SingleStaticValueTrait;

#[Type(
    name: 'Save',
    typeShorthand: 'save',
    iconPath: __DIR__.'/../Icons/text.svg',
)]
class SaveField extends AbstractField implements DefaultFieldInterface, InputOnlyInterface, NoStorageInterface
{
    use SingleStaticValueTrait;

    public const POSITION_LEFT = 'left';
    public const POSITION_CENTER = 'center';
    public const POSITION_RIGHT = 'right';

    #[Input\Text(
        label: 'Save button Label',
        instructions: 'The label of the Save & Continue Later button.',
    )]
    protected string $label;

    protected string $position = self::POSITION_RIGHT;

    #[Input\Text(
        label: 'Return URL',
        instructions: 'The URL the user will be redirected to after saving. Can use {token} and {key}.',
    )]
    protected string $url = '';

    protected ?string $notificationId = null;

    protected ?string $emailFieldHash = null;

    public function getPosition(): string
    {
        return $this->position;
    }

    public function getLabel(): string
    {
        return $this->translate($this->label);
    }

    public function getUrl(): string
    {
        return $this->url;
    }

    public function getNotificationId(): string
    {
        return $this->notificationId;
    }

    public function getEmailFieldHash(): string
    {
        return $this->emailFieldHash;
    }

    public function getType(): string
    {
        return self::TYPE_SAVE;
    }

    public function getInputHtml(): string
    {
        $attributes = $this->attributes->getInput()
            ->clone()
            ->replace('data-freeform-action', SaveForm::SAVE_ACTION)
            ->replace('type', 'submit')
        ;

        $output = '<button'.$attributes.'>';
        $output .= $this->getLabel();
        $output .= '</button>';

        return $output;
    }
}

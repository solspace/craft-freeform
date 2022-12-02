<?php

namespace Solspace\Freeform\Fields\Pro;

use Solspace\Freeform\Attributes\Field\Property;
use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Bundles\Form\SaveForm\SaveForm;
use Solspace\Freeform\Library\Composer\Components\AbstractField;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\DefaultFieldInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\InputOnlyInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\NoStorageInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\SingleValueInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Traits\SingleStaticValueTrait;

#[Type(
    name: 'Save',
    typeShorthand: 'save',
    iconPath: __DIR__.'/../Icons/text.svg',
)]
class SaveField extends AbstractField implements DefaultFieldInterface, SingleValueInterface, InputOnlyInterface, NoStorageInterface
{
    use SingleStaticValueTrait;

    public const POSITION_LEFT = 'left';
    public const POSITION_CENTER = 'center';
    public const POSITION_RIGHT = 'right';

    #[Property(
        label: 'Save button Label',
        instructions: 'The label of the Save & Continue Later button.',
    )]
    protected string $label;

    protected string $position = self::POSITION_RIGHT;

    #[Property(
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
        $attributes = $this->getCustomAttributes();
        $submitClass = $attributes->getInputClassOnly();
        $formSubmitClass = $this->getForm()->getPropertyBag()->get('submitClass', '');

        $submitClass = trim($submitClass.' '.$formSubmitClass);

        $this->addInputAttribute('class', $submitClass);

        return '<button '
            .$this->getInputAttributesString()
            .$this->getAttributeString('data-freeform-action', SaveForm::SAVE_ACTION)
            .$this->getAttributeString('type', 'submit')
            .$attributes->getInputAttributesAsString()
            .'>'
            .$this->getLabel()
            .'</button>';
    }
}

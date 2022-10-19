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

use Solspace\Freeform\Attributes\Field\EditableProperty;
use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Library\Composer\Components\AbstractField;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\DefaultFieldInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\InputOnlyInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\NoStorageInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\SingleValueInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Traits\SingleStaticValueTrait;

#[Type(
    name: 'Submit',
    typeShorthand: 'submit',
    iconPath: __DIR__.'/Icons/text.svg',
)]
class SubmitField extends AbstractField implements DefaultFieldInterface, SingleValueInterface, InputOnlyInterface, NoStorageInterface
{
    use SingleStaticValueTrait;
    public const PREVIOUS_PAGE_INPUT_NAME = 'form_previous_page_button';
    public const SUBMIT_INPUT_NAME = 'form_page_submit';

    public const POSITION_LEFT = 'left';
    public const POSITION_CENTER = 'center';
    public const POSITION_RIGHT = 'right';
    public const POSITION_SPREAD = 'spread';

    #[EditableProperty(
        label: 'Submit button Label',
        instructions: 'The label of the submit button',
    )]
    protected string $labelNext = 'Submit';

    #[EditableProperty(
        label: 'Previous button Label',
        instructions: 'The label of the previous button',
        visibilityFilters: [
            '{{state.pages}}.length > 1',
        ]
    )]
    protected string $labelPrev = 'Back';

    #[EditableProperty(
        label: 'Disable the Previous button',
        visibilityFilters: [
            '{{state.pages}}.length > 1',
        ]
    )]
    protected bool $disablePrev = false;

    #[EditableProperty(
        label: 'Positioning',
        type: 'select',
        instructions: 'Choose whether the submit button is positioned on the left, center or right side',
        options: [
            'left' => 'Left',
            'center' => 'Center',
            'right' => 'Right',
        ],
    )]
    protected string $position = self::POSITION_RIGHT;

    /**
     * Returns either "left", "center", "right" or "spread"
     * Does not return "spread" if the back button is disabled or this is the first page
     * In that case "left" is returned.
     */
    public function getPosition(): string
    {
        if (self::POSITION_SPREAD === $this->position) {
            if ($this->isDisablePrev() || $this->isFirstPage()) {
                return self::POSITION_LEFT;
            }
        }

        return $this->position;
    }

    public function getLabel(): string
    {
        return $this->getLabelNext();
    }

    public function getLabelNext(): string
    {
        return $this->translate($this->labelNext);
    }

    public function getLabelPrev(): string
    {
        return $this->translate($this->labelPrev);
    }

    public function isDisablePrev(): bool
    {
        return $this->disablePrev;
    }

    /**
     * Return the field TYPE.
     */
    public function getType(): string
    {
        return self::TYPE_SUBMIT;
    }

    /**
     * Outputs the HTML of input.
     */
    public function getInputHtml(): string
    {
        $attributes = $this->getCustomAttributes();
        $submitClass = $attributes->getInputClassOnly();
        $formSubmitClass = $this->getForm()->getPropertyBag()->get('submitClass', '');

        $submitClass = trim($submitClass.' '.$formSubmitClass);

        $this->addInputAttribute('class', $submitClass);

        $output = '';

        if (!$this->isFirstPage() && !$this->isDisablePrev()) {
            $output .= '<input '
                .$this->getAttributeString('style', 'height: 0px !important; width: 0px !important; visibility: hidden !important; position: absolute !important; left: -99999px !important; top: -9999px !important;')
                .$this->getAttributeString('type', 'submit')
                .$this->getAttributeString('tabindex', -1, false)
                .' />';

            $output .= '<button '
                .$this->getInputAttributesString()
                .$this->getAttributeString('data-freeform-action', 'back')
                .$this->getAttributeString('type', 'submit')
                .$this->getAttributeString('name', self::PREVIOUS_PAGE_INPUT_NAME)
                .$attributes->getInputAttributesAsString()
                .'>'
                .$this->getLabelPrev()
                .'</button>';
        }

        $output .= '<button '
            .$this->getInputAttributesString()
            .$this->getAttributeString('data-freeform-action', 'submit')
            .$this->getAttributeString('type', 'submit')
            .$this->getAttributeString('name', self::SUBMIT_INPUT_NAME)
            .$attributes->getInputAttributesAsString()
            .'>'
            .$this->getLabelNext()
            .'</button>';

        return $output;
    }

    private function isFirstPage(): bool
    {
        return 0 === $this->getPageIndex();
    }
}

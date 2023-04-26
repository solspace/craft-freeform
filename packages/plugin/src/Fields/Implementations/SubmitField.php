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
use Solspace\Freeform\Attributes\Property\Property;
use Solspace\Freeform\Attributes\Property\VisibilityFilter;
use Solspace\Freeform\Fields\AbstractField;
use Solspace\Freeform\Fields\Interfaces\DefaultFieldInterface;
use Solspace\Freeform\Fields\Interfaces\InputOnlyInterface;
use Solspace\Freeform\Fields\Interfaces\NoStorageInterface;
use Solspace\Freeform\Fields\Traits\SingleStaticValueTrait;
use Solspace\Freeform\Library\Attributes\Attributes;

#[Type(
    name: 'Submit',
    typeShorthand: 'submit',
    iconPath: __DIR__.'/Icons/text.svg',
)]
class SubmitField extends AbstractField implements DefaultFieldInterface, InputOnlyInterface, NoStorageInterface
{
    use SingleStaticValueTrait;

    public const PREVIOUS_PAGE_INPUT_NAME = 'form_previous_page_button';
    public const SUBMIT_INPUT_NAME = 'form_page_submit';

    public const POSITION_LEFT = 'left';
    public const POSITION_CENTER = 'center';
    public const POSITION_RIGHT = 'right';
    public const POSITION_SPREAD = 'spread';

    #[Property(
        label: 'Submit button Label',
        instructions: 'The label of the submit button',
    )]
    protected string $labelNext = 'Submit';

    #[Property(
        label: 'Previous button Label',
        instructions: 'The label of the previous button',
    )]
    #[VisibilityFilter('{{state.pages}}.length > 1')]
    protected string $labelPrev = 'Back';

    #[Property(
        label: 'Disable the Previous button',
    )]
    #[VisibilityFilter('{{state.pages}}.length > 1')]
    protected bool $disablePrev = false;

    #[Property(
        label: 'Positioning',
        instructions: 'Choose whether the submit button is positioned on the left, center or right side',
        type: Property::TYPE_SELECT,
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
        $attributes = clone $this->attributes->getInput();
        $attributes->replace('type', 'submit');

        $inputAttributes = (new Attributes())
            ->set('style', 'height: 0px !important; width: 0px !important; visibility: hidden !important; position: absolute !important; left: -99999px !important; top: -9999px !important;')
            ->set('type', 'submit')
            ->set('tabindex', -1)
        ;

        $backButtonAttributes = $attributes
            ->clone()
            ->replace('data-freeform-action', 'back')
            ->replace('name', self::PREVIOUS_PAGE_INPUT_NAME)
        ;

        $submitButtonAttributes = $attributes
            ->clone()
            ->replace('data-freeform-action', 'submit')
            ->replace('name', self::SUBMIT_INPUT_NAME)
        ;

        $output = '';
        if (!$this->isFirstPage() && !$this->isDisablePrev()) {
            $output .= '<input'.$inputAttributes.' />';
            $output .= '<button'.$attributes.$backButtonAttributes.'>';
            $output .= $this->getLabelPrev();
            $output .= '</button>';
        }

        $output .= '<button'.$attributes.$submitButtonAttributes.'>';
        $output .= $this->getLabelNext();
        $output .= '</button>';

        return $output;
    }

    private function isFirstPage(): bool
    {
        return 0 === $this->getPageIndex();
    }
}

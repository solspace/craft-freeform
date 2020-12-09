<?php

namespace Solspace\Freeform\Fields\Pro\Payments;

use Solspace\Freeform\Library\Composer\Attributes\FormAttributes;
use Solspace\Freeform\Library\Composer\Components\AbstractField;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\ExtraFieldInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\PaymentInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\SingleValueInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Traits\SingleValueTrait;
use Solspace\Freeform\Library\Composer\Components\Properties\FieldProperties;
use Solspace\Freeform\Library\Pro\Payments\ElementHookHandlers\SubmissionHookHandler;
use Solspace\Freeform\Library\Session\CraftRequest;
use Solspace\Freeform\Library\Session\CraftSession;

class CreditCardDetailsField extends AbstractField implements SingleValueInterface, PaymentInterface, ExtraFieldInterface
{
    use SingleValueTrait;

    const LAYOUT_2_ROWS = 'two_rows';
    const LAYOUT_3_ROWS = 'three_rows';

    const FIELD_CARD_NUMBER = 'card_number';
    const FIELD_CARD_EXPIRY = 'card_expiry';
    const FIELD_CARD_CVC = 'card_cvc';

    const LAYOUTS = [
        self::LAYOUT_2_ROWS => [
            [self::FIELD_CARD_NUMBER],
            [self::FIELD_CARD_EXPIRY, self::FIELD_CARD_CVC],
        ],
        self::LAYOUT_3_ROWS => [
            [self::FIELD_CARD_NUMBER],
            [self::FIELD_CARD_EXPIRY],
            [self::FIELD_CARD_CVC],
        ],
    ];

    /** @var string */
    protected $children;

    /** @var string */
    protected $layout;

    /**
     * Return the field TYPE.
     */
    public function getType(): string
    {
        return self::TYPE_CREDIT_CARD_DETAILS;
    }

    public function getChildren(): array
    {
        return $this->children;
    }

    public function getLayout(): string
    {
        return $this->layout;
    }

    public function getLayoutRows(): array
    {
        $id = $this->getIdAttribute();
        $children = $this->getChildren();
        $form = $this->getForm();
        $translator = $form->getTranslator();
        $formAttributes = new FormAttributes(null, null, new CraftSession(), new CraftRequest());
        $valueContext = $formAttributes->getFormValueContext();
        $currentPage = $form->getCurrentPage();

        //TODO: make all field names in form of snake case string constants
        $properties = new FieldProperties($children[CreditCardNumberField::FIELD_NAME], $translator);
        $numberField = CreditCardNumberField::createFromProperties($form, $properties, $valueContext, $currentPage);
        $numberField->setAttributes(['id' => $id.'_card_number']);

        $properties = new FieldProperties($children[CreditCardExpiryField::FIELD_NAME], $translator);
        $expiryField = CreditCardExpiryField::createFromProperties($form, $properties, $valueContext, $currentPage);
        $expiryField->setAttributes(['id' => $id.'_card_expiry']);

        $properties = new FieldProperties($children[CreditCardCvcField::FIELD_NAME], $translator);
        $cvcField = CreditCardCvcField::createFromProperties($form, $properties, $valueContext, $currentPage);
        $cvcField->setAttributes(['id' => $id.'_card_cvc']);

        $layout = [];
        $rows = self::LAYOUTS[$this->getLayout()];
        foreach ($rows as $row) {
            $rowLayout = [];
            foreach ($row as $col) {
                $colLayout = '';

                switch ($col) {
                case self::FIELD_CARD_NUMBER:
                    $colLayout = $numberField;

                    break;

                case self::FIELD_CARD_EXPIRY:
                    $colLayout = $expiryField;

                    break;

                case self::FIELD_CARD_CVC:
                    $colLayout = $cvcField;

                    break;
                }
                $rowLayout[] = $colLayout;
            }
            $layout[] = $rowLayout;
        }

        return $layout;
    }

    public function renderCpValue(int $submissionId): string
    {
        return SubmissionHookHandler::renderColumn(SubmissionHookHandler::COLUMN_STATUS);
    }

    public function getValueAsString(bool $optionsAsValues = true): string
    {
        return '';
    }

    /**
     * Outputs the HTML of input.
     */
    protected function getInputHtml(): string
    {
        $handle = $this->getHandle();
        $id = $this->getIdAttribute();
        $value = $this->getValue();

        return "<input type='hidden' name='{$handle}' id='{$id}' value='{$value}'/>";
    }

    protected function getLabelHtml(): string
    {
        if ($this->getLabel()) {
            return parent::getLabelHtml();
        }

        return '';
    }
}

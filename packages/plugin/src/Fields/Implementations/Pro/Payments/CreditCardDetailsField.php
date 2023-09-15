<?php

namespace Solspace\Freeform\Fields\Implementations\Pro\Payments;

use GraphQL\Type\Definition\Type as GQLType;
use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Fields\AbstractField;
use Solspace\Freeform\Fields\Interfaces\ExtraFieldInterface;
use Solspace\Freeform\Fields\Interfaces\PaymentInterface;
use Solspace\Freeform\Library\Attributes\Attributes;
use Solspace\Freeform\Library\Pro\Payments\ElementHookHandlers\SubmissionHookHandler;

#[Type(
    name: 'Credit Card: Details',
    typeShorthand: 'credit-card',
    iconPath: __DIR__.'/../../Icons/text.svg',
)]
class CreditCardDetailsField extends AbstractField implements PaymentInterface, ExtraFieldInterface
{
    public const LAYOUT_2_ROWS = 'two_rows';
    public const LAYOUT_3_ROWS = 'three_rows';

    public const FIELD_CARD_NUMBER = 'card_number';
    public const FIELD_CARD_EXPIRY = 'card_expiry';
    public const FIELD_CARD_CVC = 'card_cvc';

    public const LAYOUTS = [
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
        // $id = $this->getIdAttribute();
        // $children = $this->getChildren();
        // $form = $this->getForm();
        // $currentPage = $form->getCurrentPage();
        //
        // // TODO: make all field names in form of snake case string constants
        // $properties = new FieldProperties($children[CreditCardNumberField::FIELD_NAME]);
        // $numberField = CreditCardNumberField::createFromProperties($form, $properties, $currentPage);
        // $numberField->setAttributes(['id' => $id.'_card_number']);
        //
        // $properties = new FieldProperties($children[CreditCardExpiryField::FIELD_NAME]);
        // $expiryField = CreditCardExpiryField::createFromProperties($form, $properties, $currentPage);
        // $expiryField->setAttributes(['id' => $id.'_card_expiry']);
        //
        // $properties = new FieldProperties($children[CreditCardCvcField::FIELD_NAME]);
        // $cvcField = CreditCardCvcField::createFromProperties($form, $properties, $currentPage);
        // $cvcField->setAttributes(['id' => $id.'_card_cvc']);
        //
        // $layout = [];
        // $rows = self::LAYOUTS[$this->getLayout()];
        // foreach ($rows as $row) {
        //     $rowLayout = [];
        //     foreach ($row as $col) {
        //         $colLayout = '';
        //
        //         switch ($col) {
        //             case self::FIELD_CARD_NUMBER:
        //                 $colLayout = $numberField;
        //
        //                 break;
        //
        //             case self::FIELD_CARD_EXPIRY:
        //                 $colLayout = $expiryField;
        //
        //                 break;
        //
        //             case self::FIELD_CARD_CVC:
        //                 $colLayout = $cvcField;
        //
        //                 break;
        //         }
        //         $rowLayout[] = $colLayout;
        //     }
        //     $layout[] = $rowLayout;
        // }

        return [];
    }

    public function renderCpValue(int $submissionId): string
    {
        return SubmissionHookHandler::renderColumn(SubmissionHookHandler::COLUMN_STATUS);
    }

    public function getValueAsString(): string
    {
        return '';
    }

    public function getContentGqlMutationArgumentType(): array|GQLType
    {
        $description = $this->getContentGqlDescription();
        $description[] = 'Expects a Stripe card token value that represents a credit card\'s details.';

        $description = implode("\n", $description);

        return [
            'name' => $this->getHandle(),
            'type' => $this->getContentGqlType(),
            'description' => trim($description),
        ];
    }

    /**
     * Outputs the HTML of input.
     */
    protected function getInputHtml(): string
    {
        $attributes = (new Attributes())
            ->set('type', 'hidden')
            ->set('name', $this->getHandle())
            ->set('id', $this->getIdAttribute())
            ->set('value', $this->getValue())
        ;

        return '<input'.$attributes.' />';
    }

    protected function getLabelHtml(): string
    {
        if ($this->getLabel()) {
            return parent::getLabelHtml();
        }

        return '';
    }
}

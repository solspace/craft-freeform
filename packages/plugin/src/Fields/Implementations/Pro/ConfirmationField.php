<?php

namespace Solspace\Freeform\Fields\Implementations\Pro;

use GraphQL\Type\Definition\Type as GQLType;
use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Attributes\Property\Implementations\Field\FieldTransformer;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\TextField;
use Solspace\Freeform\Fields\Interfaces\ExtraFieldInterface;
use Solspace\Freeform\Library\Exceptions\FreeformException;

#[Type(
    name: 'Confirm',
    typeShorthand: 'confirm',
    iconPath: __DIR__.'/../Icons/confirm.svg',
    previewTemplatePath: __DIR__.'/../PreviewTemplates/text.ejs',
)]
class ConfirmationField extends TextField implements ExtraFieldInterface
{
    #[ValueTransformer(FieldTransformer::class)]
    #[Input\Field(
        label: 'Target Field',
        instructions: 'Select the field that this field should match',
    )]
    protected ?FieldInterface $targetField = null;

    /**
     * Return the field TYPE.
     */
    public function getType(): string
    {
        return self::TYPE_CONFIRMATION;
    }

    public function getTargetField(): ?FieldInterface
    {
        return $this->targetField;
    }

    public function getContentGqlMutationArgumentType(): array|GQLType
    {
        $field = $this->getForm()->getLayout()->getField($this->getTargetField()->getUid());

        $description = $this->getContentGqlDescription();
        $description[] = 'Value must match the "'.$field->getLabel().'" field value.';

        $description = implode("\n", $description);

        return [
            'name' => $this->getHandle(),
            'type' => $this->getContentGqlType(),
            'description' => trim($description),
        ];
    }

    protected function getInputHtml(): string
    {
        try {
            $field = $this->getTargetField();
            if (!$field) {
                return 'no field chosen';
            }

            $attributes = $field
                ->getCompiledAttributes()
                ->clone()
                ->replace(
                    'placeholder',
                    $this->getPlaceholder() ? $this->translate($this->getPlaceholder()) : null
                )
                ->replace('name', $this->getHandle())
                ->replace('id', $this->getIdAttribute())
                ->replace('value', $this->getValue())
            ;

            $output = $field->getInputHtml();
            $output = preg_replace('/<(\w+)[^\/>]*\/?>/', "<$1{$attributes}>", $output);

            if (preg_match('/^<textarea\S?/', $output)) {
                $value = htmlspecialchars($this->getValue(), \ENT_QUOTES, 'UTF-8');
                $output = str_replace('></textarea>', ">{$value}</textarea>", $output);
            }

            return $output;
        } catch (FreeformException $exception) {
            return parent::getInputHtml();
        }
    }
}

<?php

namespace Solspace\Freeform\Fields\Implementations\Pro;

use GraphQL\Type\Definition\Type as GQLType;
use Solspace\Freeform\Attributes\Field\Type;
use Solspace\Freeform\Attributes\Property\Implementations\Field\FieldTransformer;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Attributes\Property\ValueTransformer;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\TextField;
use Solspace\Freeform\Fields\Interfaces\DefaultFieldInterface;
use Solspace\Freeform\Fields\Interfaces\ExtraFieldInterface;
use Solspace\Freeform\Fields\Interfaces\NoStorageInterface;
use Solspace\Freeform\Fields\Interfaces\RememberPostedValueInterface;
use Solspace\Freeform\Library\Attributes\Attributes;
use Solspace\Freeform\Library\Exceptions\FreeformException;

#[Type(
    name: 'Confirm',
    typeShorthand: 'confirm',
    iconPath: __DIR__.'/../Icons/confirm.svg',
    previewTemplatePath: __DIR__.'/../PreviewTemplates/text.ejs',
)]
class ConfirmationField extends TextField implements DefaultFieldInterface, NoStorageInterface, RememberPostedValueInterface, ExtraFieldInterface
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
        $attributes = $this->getAttributes()
            ->getInput()
            ->clone()
            ->setIfEmpty('placeholder', $this->translate($this->getPlaceholder()))
        ;

        try {
            $field = $this->getTargetField();
            if (!$field) {
                return 'no field chosen';
            }

            $output = $field->getInputHtml();
            $output = str_replace('/>', '', $output);

            $output = $this->injectAttribute($output, 'name', $this->getHandle());
            $output = $this->injectAttribute($output, 'id', $this->getIdAttribute());
            $output = $this->injectAttribute($output, 'value', $this->getValue());

            $output = str_replace(' required', '', $output);
            $output .= $this->getRequiredAttribute();
            $output .= $attributes;

            $output .= ' />';

            return $output;
        } catch (FreeformException $exception) {
            return parent::getInputHtml();
        }
    }

    private function injectAttribute(string $string, string $name, mixed $value): string
    {
        $attributes = new Attributes();
        $attributes->set($name, $value);

        if (preg_match('/'.$name.'=[\'"][^\'"]*[\'"]/', $string)) {
            $string = preg_replace(
                '/'.$name.'=[\'"][^\'"]*[\'"]/',
                $attributes,
                $string
            );
        } else {
            $string .= $attributes;
        }

        return $string;
    }
}

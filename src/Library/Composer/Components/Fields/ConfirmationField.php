<?php

namespace Solspace\Freeform\Library\Composer\Components\Fields;

use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\NoStorageInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\RememberPostedValueInterface;
use Solspace\Freeform\Library\Exceptions\FreeformException;

class ConfirmationField extends TextField implements NoStorageInterface, RememberPostedValueInterface
{
    /** @var int */
    protected $targetFieldHash;

    /**
     * Return the field TYPE
     *
     * @return string
     */
    public function getType(): string
    {
        return self::TYPE_CONFIRMATION;
    }

    /**
     * @return int|null
     */
    public function getTargetFieldHash()
    {
        return $this->targetFieldHash;
    }

    /**
     * @return array
     */
    protected function validate(): array
    {
        $errors = parent::validate();

        try {
            $field = $this->getForm()->getLayout()->getFieldByHash($this->getTargetFieldHash());

            $value = $field->getValue();
            if ($field instanceof EmailField) {
                if (count($value) >= 1) {
                    $value = reset($value);
                } else {
                    $value = '';
                }
            }

            if ($value !== $this->getValue()) {
                $errors[] = $this->translate(
                    'This value must match the value for {targetFieldLabel}',
                    ['targetFieldLabel' => $field->getLabel()]
                );
            }
        } catch (FreeformException $exception) {
        }

        return $errors;
    }

    /**
     * @inheritDoc
     */
    protected function getInputHtml(): string
    {
        $attributes = $this->getCustomAttributes();
        $this->addInputAttribute('class', $attributes->getClass());

        try {
            $field = $this->getForm()->getLayout()->getFieldByHash($this->getTargetFieldHash());

            $output = $field->getInputHtml();
            $output = str_replace('/>', '', $output);

            $output = $this->injectAttribute($output, 'name', $this->getHandle());
            $output = $this->injectAttribute($output, 'id', $this->getIdAttribute());
            $output = $this->injectAttribute($output, 'value', $this->getValue(), false);
            $output = $this->injectAttribute(
                $output,
                'placeholder',
                $this->getForm()->getTranslator()->translate(
                    $attributes->getPlaceholder() ?: $this->getPlaceholder()
                )
            );

            $output .= $this->getInputAttributesString();

            $output = str_replace(' required', '', $output);
            $output .= $this->getRequiredAttribute();
            $output .= $attributes->getInputAttributesAsString();

            $output .= ' />';

            return $output;
        } catch (FreeformException $exception) {
            return parent::getInputHtml();
        }
    }

    /**
     * @param string $string
     * @param string $name
     * @param mixed  $value
     * @param bool   $escapeValue
     *
     * @return string
     */
    private function injectAttribute($string, $name, $value, $escapeValue = true): string
    {
        if (preg_match('/' . $name . '=[\'"][^\'"]*[\'"]/', $string)) {
            $string = preg_replace(
                '/' . $name . '=[\'"][^\'"]*[\'"]/',
                $this->getAttributeString($name, $value, $escapeValue),
                $string
            );
        } else {
            $string .= $this->getAttributeString($name, $value, $escapeValue);
        }

        return $string;
    }
}

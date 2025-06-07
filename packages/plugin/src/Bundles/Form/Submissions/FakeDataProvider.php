<?php

namespace Solspace\Freeform\Bundles\Form\Submissions;

use Faker\Factory;
use Faker\Generator;
use Solspace\Freeform\Attributes\Property\Implementations\Options\Option;
use Solspace\Freeform\Fields\Implementations\CheckboxField;
use Solspace\Freeform\Fields\Implementations\EmailField;
use Solspace\Freeform\Fields\Implementations\FileUploadField;
use Solspace\Freeform\Fields\Implementations\NumberField;
use Solspace\Freeform\Fields\Implementations\Pro\ConfirmationField;
use Solspace\Freeform\Fields\Implementations\Pro\DatetimeField;
use Solspace\Freeform\Fields\Implementations\Pro\InvisibleField;
use Solspace\Freeform\Fields\Implementations\Pro\PasswordField;
use Solspace\Freeform\Fields\Implementations\Pro\PhoneField;
use Solspace\Freeform\Fields\Implementations\Pro\RegexField;
use Solspace\Freeform\Fields\Implementations\Pro\SignatureField;
use Solspace\Freeform\Fields\Implementations\Pro\WebsiteField;
use Solspace\Freeform\Fields\Implementations\TextField;
use Solspace\Freeform\Fields\Interfaces\MultiValueInterface;
use Solspace\Freeform\Fields\Interfaces\OptionsInterface;
use Solspace\Freeform\Form\Form;

class FakeDataProvider
{
    private array $instances;

    public function generate(Form $form, ?string $locale)
    {
        $faker = $this->getFaker($locale);

        $values = [];
        foreach ($form->getLayout()->getFields() as $field) {
            $value = null;
            if ($field instanceof CheckboxField) {
                $value = $faker->boolean();
            } elseif ($field instanceof EmailField) {
                $value = $faker->email;
            } elseif ($field instanceof OptionsInterface) {
                if ($field instanceof MultiValueInterface) {
                    $iterator = $field->getOptions()->getIterator();
                    if (!\count($iterator)) {
                        continue;
                    }

                    $value = array_map(
                        fn (Option $option) => $option->getValue(),
                        $faker->randomElements($field->getOptions()->getIterator(), null)
                    );
                } else {
                    $value = $faker->randomElement($field->getOptions()->getIterator())?->getValue();
                }
            } elseif ($field instanceof NumberField) {
                $value = $faker->numberBetween(
                    $field->getMinValue() ?? 0,
                    $field->getMaxValue() ?? 1000,
                );
            } elseif ($field instanceof DatetimeField) {
                $date = $faker->dateTimeBetween('-3 months', '+3 months');

                $chunks = [];
                if ($field->isShowDate()) {
                    $chunks[] = $date->format($field->getDateFormat());
                }

                if ($field->isShowTime()) {
                    $chunks[] = $date->format($field->getTimeFormat());
                }

                if ($chunks) {
                    $value = implode(' ', $chunks);
                }
            } elseif ($field instanceof WebsiteField) {
                $value = $faker->url;
            } elseif ($field instanceof PasswordField) {
                $value = $faker->password;
            } elseif ($field instanceof ConfirmationField) {
                $value = $values[$field->getTargetField()->getHandle()] ?? 'no-value-found';
            } elseif ($field instanceof RegexField) {
                $value = $faker->regexify($field->getPattern());
            } elseif ($field instanceof SignatureField) {
                static $signature;

                if (null === $signature) {
                    $file = $faker->image(
                        null,
                        $field->getWidth(),
                        $field->getHeight(),
                        'signature',
                        true,
                        false
                    );

                    $content = file_get_contents($file);
                    $signature = 'data:image/png;base64,'.base64_encode($content);
                }

                $value = $signature;
            } elseif ($field instanceof FileUploadField) {
                continue;
            } elseif ($field instanceof PhoneField) {
                $value = $faker->phoneNumber;
            } elseif ($field instanceof InvisibleField) {
                continue;
            } elseif ($field instanceof TextField) {
                $handle = strtolower($field->getHandle());
                if (str_contains($handle, 'name')) {
                    if (str_contains($handle, 'first')) {
                        $value = $faker->firstName;
                    } elseif (str_contains($handle, 'last')) {
                        $value = $faker->lastName;
                    } else {
                        $value = $faker->name;
                    }
                } else {
                    $value = $faker->sentence;
                }
            } else {
                $value = $faker->text;
            }

            $values[$field->getHandle()] = $value;
        }

        return $values;
    }

    public function getFaker(?string $locale = 'en'): Generator
    {
        if (!isset($this->instances[$locale])) {
            $this->instances[$locale] = Factory::create($locale);
        }

        return $this->instances[$locale];
    }
}

<?php

namespace Solspace\Freeform\Tests\Translations;

use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Attributes\Property\Delimiter;
use Solspace\Freeform\Attributes\Property\Property;
use Solspace\Freeform\Fields\Implementations\Pro\LocationField;
use Solspace\Freeform\Integrations\Other\Google\GooglePlaces\GooglePlaces;
use yii\i18n\PhpMessageSource;

/**
 * @coversNothing
 */
class LocationTranslationsTest extends TestCase
{
    public function testLocationMessagesResolveInEveryShippedLanguage(): void
    {
        $messages = [
            'Location', 'Google Places', 'Address',
            'Google Places is configured but not enabled for this form. Enable it in the Integrations tab, then select it here to use address autocomplete.',
            'Address fields appear after selecting a location.',
            'Start typing your address...', 'Address suggestions',
            'Address search is unavailable. Please enter your address manually.',
            'No matching addresses. You can enter your address manually.',
            'Address suggestions available. Use the arrow keys to choose an address.',
            'Please fill in the required address fields: {fields}.',
            'Please enter an address.',
            'Please choose a complete address from the suggestions.',
        ];
        foreach ([LocationField::class, GooglePlaces::class] as $class) {
            foreach ((new \ReflectionClass($class))->getProperties() as $property) {
                if ($property->getDeclaringClass()->getName() !== $class) {
                    continue;
                }
                foreach ($property->getAttributes(Property::class, \ReflectionAttribute::IS_INSTANCEOF) as $attribute) {
                    $input = $attribute->newInstance();
                    array_push($messages, ...array_filter([$input->label, $input->instructions, $input->emptyOption ?? null]));
                    if (\is_array($input->options ?? null)) {
                        array_push($messages, ...array_values($input->options));
                    }
                }
                foreach ($property->getAttributes(Delimiter::class) as $attribute) {
                    $messages[] = $attribute->newInstance()->name;
                }
            }
        }
        $source = new PhpMessageSource(['basePath' => __DIR__.'/../../translations', 'sourceLanguage' => 'en', 'forceTranslation' => true]);
        foreach (['en', 'de', 'fr', 'it', 'nl'] as $language) {
            foreach (array_unique($messages) as $message) {
                $translated = $source->translate('freeform', $message, $language);
                self::assertIsString($translated, $language.': '.$message);
                self::assertNotSame('', $translated, $language.': '.$message);
                preg_match_all('/\{[A-Za-z_]\w*\}/', $message, $expected);
                preg_match_all('/\{[A-Za-z_]\w*\}/', $translated, $actual);
                self::assertSame($expected[0], $actual[0], $language.': '.$message);
            }
        }
    }
}

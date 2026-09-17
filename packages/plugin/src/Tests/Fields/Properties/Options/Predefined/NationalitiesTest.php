<?php

namespace Solspace\Freeform\Tests\Fields\Properties\Options\Predefined;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Fields\Properties\Options\Elements\Types\OptionTypesProvider;
use Solspace\Freeform\Fields\Properties\Options\Predefined\Types\Nationalities\Nationalities;
use Solspace\Freeform\Fields\Properties\Options\Predefined\Types\PredefinedSourceTypeInterface;

#[CoversClass(Nationalities::class)]
class NationalitiesTest extends TestCase
{
    public function testTypeIsRegistered(): void
    {
        $types = (new OptionTypesProvider())->getPredefinedTypes();

        $this->assertContainsOnlyInstancesOf(PredefinedSourceTypeInterface::class, $types);
        $this->assertNotEmpty(array_filter($types, static fn ($type) => $type instanceof Nationalities));
    }

    public function testCountryCodesAreUniqueAndAmbiguousLabelsAreExplicit(): void
    {
        $nationalities = new Nationalities();

        $labelProperty = new \ReflectionProperty($nationalities, 'label');
        $labelProperty->setValue($nationalities, PredefinedSourceTypeInterface::DISPLAY_FULL);

        $options = $nationalities->generateOptions();
        $values = array_column($options->toArray(), 'value');

        $this->assertCount(196, $options);
        $this->assertSame($values, array_unique($values));
        $this->assertSame(
            [],
            array_filter($values, static fn ($value) => !preg_match('/^[A-Z]{2}$/', $value))
        );
        $this->assertSame('Congolese (DR Congo)', $options->getOption('CD')->getLabel());
        $this->assertSame('Congolese (Republic of the Congo)', $options->getOption('CG')->getLabel());
        $this->assertSame('Dominican (Dominica)', $options->getOption('DM')->getLabel());
        $this->assertSame('Dominican (Dominican Republic)', $options->getOption('DO')->getLabel());
    }

    public function testEveryNationalityHasTranslations(): void
    {
        $nationalities = json_decode(
            file_get_contents(
                \dirname(__DIR__, 5).'/Fields/Properties/Options/Predefined/Types/Nationalities/nationalities.json'
            ),
            true
        );

        foreach (['en', 'de', 'fr', 'it', 'nl'] as $language) {
            $translations = require \dirname(__DIR__, 5)."/translations/{$language}/freeform.php";

            foreach ($nationalities as $nationality) {
                $key = "Nationality: {$nationality}";

                $this->assertArrayHasKey($key, $translations, "Missing {$language} translation for {$nationality}");
                $this->assertNotSame('', $translations[$key]);
            }
        }
    }
}

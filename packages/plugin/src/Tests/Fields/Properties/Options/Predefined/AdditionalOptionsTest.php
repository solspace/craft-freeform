<?php

namespace Solspace\Freeform\Tests\Fields\Properties\Options\Predefined;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Attributes\Property\Property;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Fields\Properties\Options\Elements\Types\OptionTypesProvider;
use Solspace\Freeform\Fields\Properties\Options\Predefined\Predefined;
use Solspace\Freeform\Fields\Properties\Options\Predefined\TranslatedOptions;
use Solspace\Freeform\Fields\Properties\Options\Predefined\Types\AgeRanges\AgeRanges;
use Solspace\Freeform\Fields\Properties\Options\Predefined\Types\CompanySizes\CompanySizes;
use Solspace\Freeform\Fields\Properties\Options\Predefined\Types\Continents\Continents;
use Solspace\Freeform\Fields\Properties\Options\Predefined\Types\EmploymentStatuses\EmploymentStatuses;
use Solspace\Freeform\Fields\Properties\Options\Predefined\Types\Industries\Industries;
use Solspace\Freeform\Fields\Properties\Options\Predefined\Types\RegionalSubdivisions\RegionalSubdivisions;
use Solspace\Freeform\Fields\Properties\Options\Predefined\Types\SurveyScales\SurveyScales;
use Solspace\Freeform\Fields\Properties\Options\Predefined\Types\TimeIntervals\TimeIntervals;
use Solspace\Freeform\Library\Translations\TranslationTable;

#[CoversClass(TranslatedOptions::class)]
#[CoversClass(AgeRanges::class)]
#[CoversClass(CompanySizes::class)]
#[CoversClass(Continents::class)]
#[CoversClass(EmploymentStatuses::class)]
#[CoversClass(Industries::class)]
#[CoversClass(RegionalSubdivisions::class)]
#[CoversClass(SurveyScales::class)]
class AdditionalOptionsTest extends TestCase
{
    public function testAllNewTypesAreRegistered(): void
    {
        $registered = array_map(static fn ($type) => $type::class, (new OptionTypesProvider())->getPredefinedTypes());

        foreach (self::provideLists() as [$class]) {
            $this->assertContains($class, $registered);
        }

        $this->assertContains(TimeIntervals::class, $registered);
        $this->assertSame($registered, array_values(array_unique($registered)));
    }

    #[DataProvider('provideLists')]
    public function testListsHaveUniqueStableValuesAndCompleteTranslations(string $class, array $settings, int $count): void
    {
        $source = new $class();
        foreach ($settings + ['label' => TranslatedOptions::DISPLAY_FULL] as $key => $value) {
            (new \ReflectionProperty($source, $key))->setValue($source, $value);
        }

        $options = $source->generateOptions()->toArray();
        $values = array_column($options, 'value');
        $this->assertCount($count, $options);
        $this->assertSame($values, array_values(array_unique($values)));
        $this->assertNotContains('', $values);

        foreach (['en', 'de', 'fr', 'it', 'nl'] as $language) {
            $translations = require \dirname(__DIR__, 5)."/translations/{$language}/freeform.php";
            foreach ($options as $option) {
                $this->assertArrayHasKey($option['label'], $translations, "Missing {$language} translation for {$option['label']}");
                $this->assertNotSame('', $translations[$option['label']]);
            }
        }

        // Changing label presentation must not change default stored identifiers.
        (new \ReflectionProperty($source, 'label'))->setValue($source, TranslatedOptions::DISPLAY_FULL_TRANSLATED);
        $this->assertSame($values, array_column($source->generateOptions()->toArray(), 'value'));

        (new \ReflectionProperty($source, 'value'))->setValue($source, TranslatedOptions::DISPLAY_FULL);
        $this->assertSame(array_column($options, 'label'), array_column($source->generateOptions()->toArray(), 'value'));
    }

    public function testSurveyScoresRunFromLowToHigh(): void
    {
        $source = new SurveyScales();
        (new \ReflectionProperty($source, 'label'))->setValue($source, TranslatedOptions::DISPLAY_FULL);
        foreach ([
            'agreement' => ['Strongly disagree', 'Strongly agree'],
            'satisfaction' => ['Very dissatisfied', 'Very satisfied'],
            'frequency' => ['Never', 'Always'],
            'importance' => ['Not at all important', 'Extremely important'],
            'likelihood' => ['Very unlikely', 'Very likely'],
        ] as $scale => [$first, $last]) {
            (new \ReflectionProperty($source, 'scale'))->setValue($source, $scale);
            $options = $source->generateOptions();
            $this->assertSame(['1', '2', '3', '4', '5'], array_column($options->toArray(), 'value'));
            $this->assertSame($first, $options->getOption('1')->getLabel());
            $this->assertSame($last, $options->getOption('5')->getLabel());
        }
    }

    public function testRegionalValuesAreQualifiedAndCountriesDoNotLeakBetweenCalls(): void
    {
        $source = new RegionalSubdivisions();
        (new \ReflectionProperty($source, 'label'))->setValue($source, TranslatedOptions::DISPLAY_FULL);
        foreach (['AU', 'DE', 'FR', 'IT', 'NL', 'GB', 'AU'] as $country) {
            (new \ReflectionProperty($source, 'country'))->setValue($source, $country);
            foreach ($source->generateOptions() as $option) {
                $this->assertStringStartsWith($country.'-', $option->getValue());
            }
        }

        (new \ReflectionProperty($source, 'country'))->setValue($source, 'FR');
        $options = $source->generateOptions();
        $this->assertSame('Corsica', $options->getOption('FR-20R')->getLabel());
        foreach (['FR-971', 'FR-972', 'FR-973', 'FR-974', 'FR-976'] as $code) {
            $this->assertNotNull($options->getOption($code));
        }

        (new \ReflectionProperty($source, 'country'))->setValue($source, 'unsupported');
        $this->assertCount(0, $source->generateOptions());
    }

    #[DataProvider('provideLists')]
    public function testBuilderSettingsRoundTripThroughConfiguration(string $class, array $settings, int $count): void
    {
        // These simple input attributes do not use the provider's injected services.
        $propertyProvider = $this->getMockBuilder(PropertyProvider::class)
            ->disableOriginalConstructor()
            ->onlyMethods([])
            ->getMock()
        ;

        $properties = $propertyProvider->getEditableProperties(new $class());
        $this->assertNotNull($properties->get('label'));
        $this->assertNotNull($properties->get('value'));
        $config = [
            'source' => 'predefined',
            'typeClass' => $class,
            'properties' => $settings + ['label' => TranslatedOptions::DISPLAY_FULL, 'value' => TranslatedOptions::DISPLAY_ABBREVIATED],
            'emptyOption' => 'Please select...',
        ];
        $original = new Predefined($config, $propertyProvider);
        $saved = json_decode(json_encode($original->toArray(), \JSON_THROW_ON_ERROR), true, 512, \JSON_THROW_ON_ERROR);
        $restored = new Predefined($saved, $propertyProvider);
        $table = new TranslationTable();
        $options = $restored->getOptions($table)->toArray();

        $this->assertCount($count + 1, $options);
        $this->assertSame(['value' => '', 'label' => 'Please select...'], $options[0]);
        $this->assertSame($original->getOptions($table)->toArray(), $options);
        foreach ($config as $key => $value) {
            $this->assertSame($value, $saved[$key]);
        }
    }

    public static function provideLists(): iterable
    {
        yield 'age ranges' => [AgeRanges::class, [], 8];

        yield 'company sizes' => [CompanySizes::class, [], 8];

        yield 'continents' => [Continents::class, [], 7];

        yield 'employment statuses' => [EmploymentStatuses::class, [], 10];

        yield 'industries' => [Industries::class, [], 20];

        foreach (['AU' => 8, 'DE' => 16, 'FR' => 18, 'IT' => 20, 'NL' => 12, 'GB' => 4] as $country => $count) {
            yield $country => [RegionalSubdivisions::class, ['country' => $country], $count];
        }

        foreach (['agreement', 'satisfaction', 'frequency', 'importance', 'likelihood'] as $scale) {
            yield $scale => [SurveyScales::class, ['scale' => $scale], 5];
        }
    }

    public function testNewBuilderLabelsAndSettingsHaveTranslations(): void
    {
        $classes = array_unique(array_column(iterator_to_array(self::provideLists()), 0));
        $classes[] = TimeIntervals::class;
        $keys = [];
        foreach ($classes as $class) {
            $keys[] = (new $class())->getName();
            foreach ((new \ReflectionClass($class))->getProperties() as $property) {
                foreach ($property->getAttributes(Property::class, \ReflectionAttribute::IS_INSTANCEOF) as $attribute) {
                    $input = $attribute->newInstance();
                    $keys[] = $input->label;
                    if ($input->instructions) {
                        $keys[] = $input->instructions;
                    }
                    foreach ($input->options ?? [] as $label) {
                        $keys[] = $label;
                    }
                }
            }
        }

        foreach (['en', 'de', 'fr', 'it', 'nl'] as $language) {
            $translations = require \dirname(__DIR__, 5)."/translations/{$language}/freeform.php";
            foreach (array_unique($keys) as $key) {
                $this->assertArrayHasKey($key, $translations, "Missing {$language} setting translation: {$key}");
                $this->assertNotSame('', $translations[$key]);
            }
        }
    }
}

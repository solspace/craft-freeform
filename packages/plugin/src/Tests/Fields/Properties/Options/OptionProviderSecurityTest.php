<?php

namespace Solspace\Freeform\Tests\Fields\Properties\Options;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Attributes\Property\Input;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Fields\Properties\Options\Elements\Types\BaseOptionProvider;
use Solspace\Freeform\Fields\Properties\Options\Elements\Types\OptionTypesProvider;
use Solspace\Freeform\Fields\Properties\Options\Elements\Types\Users\Users;
use Solspace\Freeform\Fields\Properties\Options\OptionsConfiguration;
use Solspace\Freeform\Fields\Properties\Options\Predefined\Predefined;
use Solspace\Freeform\Fields\Properties\Options\Predefined\Types\Months\Months;
use Solspace\Freeform\Library\Translations\TranslationTable;

#[CoversClass(BaseOptionProvider::class)]
#[CoversClass(OptionTypesProvider::class)]
#[CoversClass(OptionsConfiguration::class)]
#[CoversClass(PropertyProvider::class)]
class OptionProviderSecurityTest extends TestCase
{
    public function testProviderLookupUsesTheSelectedRegistry(): void
    {
        $registry = new OptionTypesProvider();

        self::assertInstanceOf(Months::class, $registry->getType('predefined', Months::class));
        self::assertNull($registry->getType('elements', Months::class));
        self::assertNull($registry->getType('predefined', \stdClass::class));

        $propertyProvider = $this->createMock(PropertyProvider::class);
        $propertyProvider->expects(self::never())->method('setStoredObjectProperties');
        $configuration = new Predefined(['typeClass' => \stdClass::class], $propertyProvider);
        self::assertSame([], $configuration->getOptions(new TranslationTable())->toArray());
    }

    public function testOptionPropertyBindingLeavesInternalStateAlone(): void
    {
        $provider = (new \ReflectionClass(PropertyProvider::class))->newInstanceWithoutConstructor();
        $optionType = new class {
            #[Input\Text]
            public string $label = 'default';

            public string $internal = 'keep me';
        };

        $provider->setStoredObjectProperties($optionType, ['label' => 'configured', 'internal' => 'changed'], onlyConfigurable: true);

        self::assertSame('configured', $optionType->label);
        self::assertSame('keep me', $optionType->internal);
    }

    public function testOrderUsesOneIdentifierAndAStandardDirectionForSavedAndTranslatedSettings(): void
    {
        $provider = new class extends Users {
            public function order(TranslationTable $translations, string $column, string $direction): array
            {
                return $this->getQueryOrder($translations, $column, $direction);
            }
        };

        self::assertSame(['customField' => \SORT_DESC], $provider->order(new TranslationTable(), 'customField', 'desc'));
        self::assertSame(['id' => \SORT_ASC], $provider->order(new TranslationTable(), 'invalid column', 'invalid direction'));

        $translations = new TranslationTable((object) ['optionConfiguration' => (object) ['properties' => (object) [
            'orderBy' => 'invalid column',
            'sort' => 'invalid direction',
        ]]]);
        self::assertSame(['id' => \SORT_ASC], $provider->order($translations, 'username', 'desc'));
    }
}

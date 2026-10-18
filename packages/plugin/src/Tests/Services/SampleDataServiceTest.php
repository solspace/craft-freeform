<?php

namespace Solspace\Freeform\Tests\Services;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Services\SampleDataService;

#[CoversClass(SampleDataService::class)]
class SampleDataServiceTest extends TestCase
{
    public function testCatalogContainsCommonGeneratorsAndOnlyBoundedStrings(): void
    {
        $catalog = (new SampleDataService())->getCatalog('en-US');
        $byId = array_column($catalog, null, 'id');
        foreach (['firstName', 'lastName', 'name', 'email', 'phoneNumber', 'company', 'streetAddress', 'city', 'postcode', 'sentence'] as $id) {
            self::assertArrayHasKey($id, $byId);
        }
        self::assertGreaterThan(60, \count($catalog));
        foreach ($catalog as $item) {
            self::assertIsString($item['value']);
            self::assertLessThanOrEqual(500, mb_strlen($item['value']));
            self::assertNotEmpty($item['label']);
        }
        foreach (['file', 'image', 'randomHtml', 'dateTime', 'randomElements', 'seed', 'addProvider'] as $id) {
            self::assertArrayNotHasKey($id, $byId);
        }
    }

    public function testOtherLocalesProduceUsableSamples(): void
    {
        foreach (['fr-FR', 'de-DE', 'nl-NL', 'it-IT'] as $locale) {
            $byId = array_column((new SampleDataService())->getCatalog($locale), null, 'id');
            self::assertNotEmpty($byId['firstName']['value']);
            self::assertNotEmpty($byId['company']['value']);
        }
    }
}

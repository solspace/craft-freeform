<?php

namespace Solspace\Freeform\Tests\Services;

use craft\db\Query;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Bundles\Translations\TranslationProvider;
use Solspace\Freeform\Services\FormsService;

#[CoversClass(FormsService::class)]
class FormsServiceTest extends TestCase
{
    public function testFormCacheKeysIncludeSiteAndUniqueId(): void
    {
        $service = new FormsService(
            null,
            $this->createMock(PropertyProvider::class),
            $this->createMock(TranslationProvider::class),
        );

        $method = new \ReflectionMethod(FormsService::class, 'getFormCacheKey');

        $this->assertSame('123:irish-site:foo', $method->invoke($service, '123', 'irish-site', 'foo'));
        $this->assertSame('123:dutch-site:bar', $method->invoke($service, '123', 'dutch-site', 'bar'));
        $this->assertSame('contact:irish-site:foo', $method->invoke($service, 'contact', 'irish-site', 'foo'));
    }

    public function testFormCacheKeysOmitEmptyParts(): void
    {
        $service = new FormsService(
            null,
            $this->createMock(PropertyProvider::class),
            $this->createMock(TranslationProvider::class),
        );

        $method = new \ReflectionMethod(FormsService::class, 'getFormCacheKey');

        $this->assertSame('123', $method->invoke($service, '123'));
        $this->assertSame('123:dutch-site', $method->invoke($service, '123', 'dutch-site'));
    }

    public function testSiteFilterIsAppendedToExistingQueryConditions(): void
    {
        $service = new FormsService(
            null,
            $this->createMock(PropertyProvider::class),
            $this->createMock(TranslationProvider::class),
        );

        $query = $service->getFormQuery();
        $query->where(['forms.id' => 42]);

        $method = new \ReflectionMethod(FormsService::class, 'attachSitesToQuery');
        $method->invoke($service, $query, 'dutch-site');

        $this->assertSame('and', $query->where[0]);
        $this->assertSame(['forms.id' => 42], $query->where[1]);

        $siteFilter = $query->where[2];
        $this->assertSame('or', $siteFilter[0]);
        $this->assertSame(['in', 'sites.[[handle]]', ['dutch-site']], $siteFilter[1]);

        $this->assertSame('not', $siteFilter[2][0]);
        $this->assertSame('exists', $siteFilter[2][1][0]);
        $this->assertInstanceOf(Query::class, $siteFilter[2][1][1]);
    }
}

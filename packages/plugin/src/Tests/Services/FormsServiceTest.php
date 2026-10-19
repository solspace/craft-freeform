<?php

namespace Solspace\Freeform\Tests\Services;

use craft\db\Query;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Bundles\Translations\TranslationProvider;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\Settings\Settings as DefaultSettings;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\Categories\Settings\SubCategories\General;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\ConfigItems\SelectItem;
use Solspace\Freeform\Library\DataObjects\Form\Defaults\Defaults;
use Solspace\Freeform\Library\DataObjects\FormTemplate;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Services\FormsService;
use Solspace\Freeform\Services\SettingsService;

#[CoversClass(FormsService::class)]
class FormsServiceTest extends TestCase
{
    #[DataProvider('defaultFormattingTemplateProvider')]
    public function testDefaultFormattingTemplateUsesBuilderDefaults(
        string $configured,
        bool $includeSamples,
        array $samples,
        array $custom,
        string $expected,
    ): void {
        $general = (new \ReflectionClass(General::class))->newInstanceWithoutConstructor();
        $general->formattingTemplate = new SelectItem(['value' => $configured]);
        $defaultSettings = (new \ReflectionClass(DefaultSettings::class))->newInstanceWithoutConstructor();
        $defaultSettings->general = $general;
        $defaults = (new \ReflectionClass(Defaults::class))->newInstanceWithoutConstructor();
        $defaults->settings = $defaultSettings;
        $defaults->includeSampleTemplates = $includeSamples;
        $model = (new \ReflectionClass(Settings::class))->newInstanceWithoutConstructor();
        $model->formattingTemplate = 'basic-light/index.twig';
        $model->defaults = $defaults;

        $template = function (string $fileName): FormTemplate {
            $template = $this->createMock(FormTemplate::class);
            $template->method('getFileName')->willReturn($fileName);

            return $template;
        };
        $settings = $this->createMock(SettingsService::class);
        $settings->method('getSettingsModel')->willReturn($model);
        $settings->method('getSolspaceFormTemplates')->willReturn(array_map($template, $samples));
        $settings->method('getCustomFormTemplates')->willReturn(array_map($template, $custom));
        $service = $this->getMockBuilder(FormsService::class)
            ->setConstructorArgs([
                null,
                $this->createMock(PropertyProvider::class),
                $this->createMock(TranslationProvider::class),
            ])
            ->onlyMethods(['getSettingsService'])
            ->getMock()
        ;
        $service->method('getSettingsService')->willReturn($settings);

        self::assertSame($expected, $service->getDefaultFormattingTemplate());
    }

    public static function defaultFormattingTemplateProvider(): array
    {
        return [
            'configured sample overrides legacy Basic Light' => [
                'tailwind-4-light/index.twig', true,
                ['basic-light/index.twig', 'tailwind-4-light/index.twig'], [],
                'tailwind-4-light/index.twig',
            ],
            'configured custom template overrides legacy Basic Light' => [
                'insurance.twig', true, ['basic-light/index.twig'], ['insurance.twig'], 'insurance.twig',
            ],
            'custom template with samples disabled' => [
                'insurance.twig', false, ['basic-light/index.twig'], ['insurance.twig'], 'insurance.twig',
            ],
            'explicitly no formatting template' => [
                '', true, ['basic-light/index.twig'], [], '',
            ],
            'missing configured template uses available fallback' => [
                'missing.twig', true, ['basic-light/index.twig'], ['insurance.twig'], 'basic-light/index.twig',
            ],
            'disabled samples are excluded from fallback' => [
                'tailwind-4-light/index.twig', false,
                ['basic-light/index.twig', 'tailwind-4-light/index.twig'], ['insurance.twig'], 'insurance.twig',
            ],
            'no available templates retains fallback' => [
                'missing.twig', false, [], [], 'flexbox.html',
            ],
        ];
    }

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

    #[DataProvider('uniqueNameAndHandleProvider')]
    public function testGetUniqueNameAndHandleMirrorsTrailingNumberOntoName(
        string $name,
        string $handle,
        string $resolvedHandle,
        array $expected,
    ): void {
        $service = $this->getMockBuilder(FormsService::class)
            ->setConstructorArgs([
                null,
                $this->createMock(PropertyProvider::class),
                $this->createMock(TranslationProvider::class),
            ])
            ->onlyMethods(['getUniqueHandle'])
            ->getMock()
        ;

        $service->method('getUniqueHandle')->willReturn($resolvedHandle);

        $this->assertSame($expected, $service->getUniqueNameAndHandle($name, $handle));
    }

    public static function uniqueNameAndHandleProvider(): array
    {
        return [
            'duplicate mirrors the handle number onto the name' => [
                'Brevo Test', 'brevoTest', 'brevoTest1', ['Brevo Test 1', 'brevoTest1'],
            ],
            'no duplicate leaves the name alone' => [
                'Brevo Test', 'brevoTest', 'brevoTest', ['Brevo Test', 'brevoTest'],
            ],
            'a name already ending in a number is replaced, not doubled up' => [
                'Brevo Test 1', 'brevoTest1', 'brevoTest2', ['Brevo Test 2', 'brevoTest2'],
            ],
            'an empty name stays empty' => [
                '', 'brevoTest', 'brevoTest1', ['', 'brevoTest1'],
            ],
        ];
    }
}

<?php

namespace Solspace\Freeform\Tests\Library\Integrations\Links;

use craft\fields\data\LinkData;
use craft\fields\linktypes\BaseLinkType;
use CraftCms\Cms\Field\LinkTypes;
use CraftCms\Cms\Form\Controls\Choice;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Integrations\LinkFields\LinkFieldsBundle;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Integrations\Links\CraftFormLink;
use Solspace\Freeform\Library\Integrations\Links\FormLinkProvider;
use Solspace\Freeform\Library\Integrations\Links\HyperFormLink;
use Solspace\Freeform\Library\Integrations\Links\LinkitFormLink;
use Solspace\Freeform\Tests\Helpers\UsesCraft6Container;
use verbb\hyper\base\Link;
use yii\di\Container;

#[CoversClass(CraftFormLink::class)]
#[CoversClass(HyperFormLink::class)]
#[CoversClass(LinkitFormLink::class)]
class FormLinkAdaptersTest extends TestCase
{
    use UsesCraft6Container;

    private mixed $previousContainer;
    private mixed $previousApp;

    protected function setUp(): void
    {
        $this->previousApp = \Craft::$app;
        \Craft::$app = new class {
            public function getVersion(): string
            {
                return '6.0.0-alpha.20';
            }
        };
        $this->previousContainer = \Craft::$container;
        \Craft::$container = new Container();
    }

    protected function tearDown(): void
    {
        \Craft::$container = $this->previousContainer;
        \Craft::$app = $this->previousApp;
    }

    public function testNativeSerializationRetainsTheReferenceWithoutInventingAUrl(): void
    {
        if (!class_exists(BaseLinkType::class)) {
            self::markTestSkipped('Craft 5 Link fields are not installed.');
        }

        $form = $this->createMock(Form::class);
        $provider = $this->getMockBuilder(FormLinkProvider::class)->onlyMethods(['getForm'])->getMock();
        $provider->method('getForm')->with('freeform:12')->willReturn($form);
        \Craft::$container->setSingleton(FormLinkProvider::class, $provider);
        $data = new LinkData('freeform:12', new CraftFormLink());
        $data->setLabel('Contact us');
        $data->urlSuffix = '#form';

        self::assertSame('freeform:12', $data->serialize()['value']);
        self::assertSame(FormLinkProvider::TYPE, $data->getType());
        self::assertSame('', $data->getUrl());
        self::assertSame('Contact us', $data->getLabel());
        self::assertSame($form, $provider->fromLink($data));
    }

    public function testNativeValidationRejectsUnavailableFormsAndAcceptsAnExplicitClear(): void
    {
        if (!class_exists(BaseLinkType::class)) {
            self::markTestSkipped('Craft 5 Link fields are not installed.');
        }

        $provider = $this->createMock(FormLinkProvider::class);
        $provider->method('getForm')->willReturn(null);
        \Craft::$container->setSingleton(FormLinkProvider::class, $provider);
        $link = new CraftFormLink();
        $error = null;

        self::assertFalse($link->validateValue('freeform:12', $error));
        self::assertNotEmpty($error);
        self::assertTrue($link->validateValue(''));
    }

    public function testNativeCraft6RegistryAndFormSettingsAreAvailable(): void
    {
        new LinkFieldsBundle();
        self::assertSame(CraftFormLink::class, app(LinkTypes::class)->typesById()->get(FormLinkProvider::TYPE));

        $provider = $this->createMock(FormLinkProvider::class);
        $provider->method('getSettingsOptions')->willReturn([['label' => 'Contact', 'value' => 12]]);
        \Craft::$container->setSingleton(FormLinkProvider::class, $provider);
        $link = new CraftFormLink();
        $link->forms = [12];
        $fields = $link->settingsNodes('typeSettings.freeform-form');
        self::assertCount(1, $fields);
        self::assertInstanceOf(Choice::class, $fields[0]->getControl());
        self::assertSame([['label' => 'Contact', 'value' => 12]], $fields[0]->getControl()->props()['options']);
        self::assertSame([12], $link->getSettings()['forms']);
    }

    public function testHyperFormRemainsInCollectionsDespiteHavingNoUrl(): void
    {
        if (!class_exists(Link::class)) {
            self::markTestSkipped('Hyper is not installed.');
        }

        $form = $this->createMock(Form::class);
        $provider = $this->createMock(FormLinkProvider::class);
        $provider->method('getForm')->willReturnCallback(static fn ($value) => 'freeform:12' === $value ? $form : null);
        \Craft::$container->setSingleton(FormLinkProvider::class, $provider);
        $link = (new \ReflectionClass(HyperFormLink::class))->newInstanceWithoutConstructor();
        $link->linkValue = 'freeform:12';
        $link->urlSuffix = '#form';

        self::assertSame($form, $link->getForm());
        self::assertFalse($link->isEmpty());
        self::assertNull($link->getLinkUrl());
        self::assertNull($link->getUrl());
        self::assertNull($link->getLink());

        $link->linkValue = '';
        self::assertTrue($link->isEmpty());
        self::assertNull($link->getForm());
    }

    public function testLinkitExposesTheFormAndNeverRendersAnEmptyAnchor(): void
    {
        if (!class_exists(\presseddigital\linkit\base\Link::class)) {
            self::markTestSkipped('Linkit is not installed.');
        }

        $form = $this->createMock(Form::class);
        $provider = $this->createMock(FormLinkProvider::class);
        $provider->method('getForm')->willReturn($form);
        \Craft::$container->setSingleton(FormLinkProvider::class, $provider);
        $link = new LinkitFormLink(['value' => 'freeform:12']);

        self::assertSame($form, $link->getForm());
        self::assertSame('', $link->getUrl());
        self::assertSame('', $link->getLink());
        self::assertSame('', $link->getLinkPreview());
    }
}

<?php

namespace Solspace\Freeform\Tests\Library\Integrations;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Integrations\Content\ContentIntegrationsBundle;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Integrations\Links\FormLinkProvider;
use Solspace\Freeform\Library\Integrations\Navigation\FormNode;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Services\SettingsService;
use verbb\navigation\base\NodeType;
use verbb\navigation\elements\Node;
use yii\di\Container;

#[CoversClass(FormNode::class)]
#[CoversClass(ContentIntegrationsBundle::class)]
class FormNodeTest extends TestCase
{
    private mixed $previousContainer;
    private mixed $previousApp;
    private mixed $previousYiiApp;
    private Settings $settings;

    protected function setUp(): void
    {
        $this->previousContainer = \Craft::$container;
        $this->previousApp = \Craft::$app;
        $this->previousYiiApp = \Yii::$app;
        if (!class_exists(NodeType::class)) {
            self::markTestSkipped('Navigation is not installed.');
        }

        \Craft::$container = new Container();
        \Craft::$app = null;
        $this->settings = (new \ReflectionClass(Settings::class))->newInstanceWithoutConstructor();
        $service = $this->createMock(SettingsService::class);
        $service->method('getSettingsModel')->willReturn($this->settings);
        $plugin = (new \ReflectionClass(Freeform::class))->newInstanceWithoutConstructor();
        $plugin->setComponents(['settings' => $service]);
        \Yii::$app = (object) ['loadedModules' => [Freeform::class => $plugin]];
    }

    protected function tearDown(): void
    {
        \Craft::$container = $this->previousContainer;
        \Craft::$app = $this->previousApp;
        \Yii::$app = $this->previousYiiApp;
    }

    public function testFormReferenceUsesTheNodesSiteAndIsAcceptedByTheTwigLinkHelper(): void
    {
        $sites = new class {
            public function getSiteById(int $id): object
            {
                return (object) ['handle' => 2 === $id ? 'french' : 'english'];
            }
        };
        \Craft::$app = new class($sites) {
            public function __construct(private object $sites) {}

            public function getSites(): object
            {
                return $this->sites;
            }
        };
        $form = $this->createMock(Form::class);
        $form->method('getName')->willReturn('Contact');
        $provider = $this->createMock(FormLinkProvider::class);
        $provider->method('getForm')->with('freeform:12', '*', 'french')->willReturn($form);
        \Craft::$container->setSingleton(FormLinkProvider::class, $provider);
        [$type, $node] = $this->node('freeform:12');
        $node->siteId = 2;

        self::assertSame($form, $type->getForm());
        self::assertSame('Contact', $type->getDefaultTitle());
        self::assertSame($form, (new FormLinkProvider())->fromLink($node));
    }

    public function testUnavailableSelectionsReportAnErrorInsteadOfBeingSilentlyRemoved(): void
    {
        $provider = $this->createMock(FormLinkProvider::class);
        $provider->method('getForm')->willReturn(null);
        \Craft::$container->setSingleton(FormLinkProvider::class, $provider);
        [$type, $node] = $this->node('freeform:999');

        $type->validateForm();

        self::assertTrue($node->hasErrors('data.freeformForm'));
        self::assertSame('freeform:999', $node->data[FormNode::DATA_KEY]);
        self::assertNull($type->getForm());
    }

    public function testTheReferenceHasNoUrlAndSavingClearsAUrlSuffix(): void
    {
        [$type, $node] = $this->node('freeform:12');
        $node->urlSuffix = '#contact';

        self::assertFalse(FormNode::hasUrl());
        self::assertFalse(FormNode::hasNewWindow());
        self::assertNull($type->getUrl());
        self::assertTrue($type->beforeSaveNode(false));
        self::assertNull($node->urlSuffix);
    }

    public function testDisabledIntegrationRejectsNewNodesAndPreservesExistingSelections(): void
    {
        $this->settings->externalIntegrations = ['navigation' => false];
        $form = $this->createMock(Form::class);
        $provider = $this->createMock(FormLinkProvider::class);
        $provider->method('getForm')->willReturn($form);
        \Craft::$container->setSingleton(FormLinkProvider::class, $provider);
        [$type, $node] = $this->node('freeform:12');

        $type->validateForm();
        self::assertTrue($node->hasErrors('data.freeformForm'));

        $node->clearErrors();
        $node->id = 123;
        $type->validateForm();
        self::assertFalse($node->hasErrors());
        self::assertSame('freeform:12', $node->data[FormNode::DATA_KEY]);
        self::assertSame($form, $type->getForm());
    }

    public function testCraftModelValidationRejectsAnEmptySelectionAndAcceptsAnAvailableForm(): void
    {
        $form = $this->createMock(Form::class);
        $provider = $this->createMock(FormLinkProvider::class);
        $provider->method('getForm')->willReturnCallback(static fn ($value) => 'freeform:12' === $value ? $form : null);
        \Craft::$container->setSingleton(FormLinkProvider::class, $provider);
        [, $node] = $this->node('');
        $bundle = (new \ReflectionClass(ContentIntegrationsBundle::class))->newInstanceWithoutConstructor();
        $node->on(Node::EVENT_DEFINE_RULES, [$bundle, 'defineNodeRules']);

        self::assertFalse($node->validate(['data']));
        self::assertTrue($node->hasErrors('data.freeformForm'));

        $node->data = [FormNode::DATA_KEY => 'freeform:12'];
        self::assertTrue($node->validate(['data']));
        self::assertFalse($node->hasErrors());
    }

    public function testAnOrdinaryNavigationNodeDoesNotResolveToAForm(): void
    {
        $node = $this->getMockBuilder(Node::class)->disableOriginalConstructor()->onlyMethods(['nodeType'])->getMock();
        $node->method('nodeType')->willReturn(null);

        self::assertNull((new FormLinkProvider())->fromLink($node));
    }

    private function node(string $reference): array
    {
        $type = new FormNode();
        $node = $this->getMockBuilder(Node::class)->disableOriginalConstructor()->onlyMethods(['nodeType', 'defineRules', 'defineBehaviors', 'afterValidate'])->getMock();
        $node->method('defineRules')->willReturn([]);
        $node->method('defineBehaviors')->willReturn([]);
        $node->data = [FormNode::DATA_KEY => $reference];
        $node->siteId = null;
        $node->method('nodeType')->willReturn($type);
        $type->node = $node;

        return [$type, $node];
    }
}

<?php

namespace Solspace\Freeform\Tests\Controllers;

use craft\web\Request;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Attributes\Form\Type;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionsGeneratorInterface;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Bundles\Fields\ImplementationProvider;
use Solspace\Freeform\Bundles\Form\Limiting\LimitedUsers\LimitedUserChecker;
use Solspace\Freeform\Bundles\Form\Limiting\LimitedUsers\LimitedUserSettingsProvider;
use Solspace\Freeform\Bundles\Form\Types\Surveys\Survey;
use Solspace\Freeform\Bundles\Permissions\PermissionsProvider;
use Solspace\Freeform\Bundles\Settings\DefaultsProvider;
use Solspace\Freeform\Bundles\Transformers\Builder\Form\FormTransformer;
use Solspace\Freeform\controllers\api\forms\ModalController;
use Solspace\Freeform\controllers\api\FormsController;
use Solspace\Freeform\Events\Forms\PersistFormEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Form\Types\Regular;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\DataObjects\FormModal\CreateFormModal;
use Solspace\Freeform\Services\Form\TypesService;
use Solspace\Freeform\Tests\Helpers\UsesCraft6Container;
use yii\base\Event;
use yii\di\Container;
use yii\web\Response;

#[CoversClass(ModalController::class)]
#[CoversClass(CreateFormModal::class)]
class FormModalControllerTest extends TestCase
{
    use UsesCraft6Container;

    private mixed $previousApp;
    private mixed $previousYiiApp;
    private mixed $previousContainer;

    protected function setUp(): void
    {
        $this->previousApp = \Craft::$app;
        $this->previousYiiApp = \Yii::$app;
        $this->previousContainer = \Craft::$container;
    }

    protected function tearDown(): void
    {
        \Craft::$app = $this->previousApp;
        \Yii::$app = $this->previousYiiApp;
        \Craft::$container = $this->previousContainer;
    }

    #[TestWith([[], true])]
    #[TestWith([['settings.tab.general.type' => true], true])]
    #[TestWith([['settings.tab.general.type' => false], false])]
    #[TestWith([['settings.tab.general' => false], false])]
    #[TestWith([['settings.tab' => false], false])]
    #[TestWith([[], true, Survey::class, false])]
    #[TestWith([[], true, Regular::class, true])]
    #[TestWith([[], true, Survey::class, true])]
    #[TestWith([[], true, '', false])]
    public function testQuickSetupOnlyReturnsTheFormTypeSelectorWhenAllowed(array $settings, bool $visible, string $defaultType = Regular::class, bool $locked = false): void
    {
        $checker = $this->checker($settings);
        $options = $this->createMock(OptionsGeneratorInterface::class);
        $options->method('fetchOptions')->willReturn((new OptionCollection())->add(Regular::class, 'Regular')->add(Survey::class, 'Surveys & Polls'));
        $container = $this->createMock(Container::class);
        $container->method('get')->willReturn($options);
        \Craft::$container = $container;
        \Craft::$app = (object) ['language' => 'en'];
        $provider = new PropertyProvider(
            $this->createMock(ImplementationProvider::class),
            $this->defaults($defaultType, $locked),
            $checker,
        );
        $controller = (new \ReflectionClass(ModalController::class))->newInstanceWithoutConstructor();
        (new \ReflectionProperty(ModalController::class, 'propertyProvider'))->setValue($controller, $provider);

        $properties = (new \ReflectionMethod(ModalController::class, 'get'))->invoke($controller);
        $handles = array_column($properties, 'handle');
        self::assertTrue(array_is_list($properties));
        self::assertSame($visible, \in_array('type', $handles, true));
        self::assertContains('name', $handles);
        self::assertContains('formattingTemplate', $handles);
        self::assertContains('storeData', $handles);
        if ($visible) {
            $type = $properties[array_search('type', $handles, true)];
            self::assertSame($defaultType ?: Regular::class, $type->value);
            self::assertSame($locked, (bool) $type->disabled);
        }
    }

    #[TestWith([['settings.tab.general.type' => false], Survey::class, false])]
    #[TestWith([['settings.tab.general' => false], Survey::class, false])]
    #[TestWith([['settings.tab' => false], Survey::class, false])]
    #[TestWith([['settings.tab.general.type' => false], Regular::class, true])]
    #[TestWith([['settings.tab.general.type' => false], null, true])]
    #[TestWith([['settings.tab.general.type' => true], Survey::class, true])]
    #[TestWith([[], Survey::class, true])]
    #[TestWith([[], 'Unregistered\Form', false])]
    #[TestWith([[], ['invalid'], false])]
    #[TestWith([[], Survey::class, false, Regular::class, true])]
    #[TestWith([[], Regular::class, false, Survey::class, true])]
    #[TestWith([[], Survey::class, true, Survey::class, true])]
    #[TestWith([[], null, true, Survey::class, true])]
    #[TestWith([[], null, true, Regular::class, true])]
    #[TestWith([[], null, true, Survey::class, false])]
    #[TestWith([[], Regular::class, true, Survey::class, false])]
    #[TestWith([[], null, true, '', true])]
    #[TestWith([['settings.tab.general.type' => false], null, true, Survey::class, true])]
    #[TestWith([['settings.tab.general.type' => false], Survey::class, true, Survey::class, false])]
    #[TestWith([['settings.tab.general.type' => false], Regular::class, false, Survey::class, false])]
    public function testQuickSetupValidatesTheFormTypeBeforePersistence(array $settings, mixed $type, bool $accepted, string $defaultType = Regular::class, bool $locked = false): void
    {
        $input = ['name' => 'Quick setup QA', 'handle' => 'quickSetupQa', 'storeData' => true, 'sites' => [1]];
        if (null !== $type) {
            $input['type'] = $type;
        }
        $request = $this->createMock(Request::class);
        $request->method('getIsConsoleRequest')->willReturn(true);
        $request->method('getRawBody')->willReturn(json_encode($input));
        \Craft::$app = (object) ['request' => $request];
        $types = $this->createMock(TypesService::class);
        $registered = [];
        foreach ([Regular::class, Survey::class] as $class) {
            $definition = new Type();
            $definition->class = $class;
            $registered[] = $definition;
        }
        $types->method('getTypes')->willReturn($registered);
        $plugin = (new \ReflectionClass(Freeform::class))->newInstanceWithoutConstructor();
        $plugin->handle = 'freeform';
        $plugin->setComponents(['formTypes' => $types]);
        app()->instance(Freeform::class, $plugin);
        \Yii::$app = (object) ['loadedModules' => [Freeform::class => $plugin]];
        $form = $this->createMock(Form::class);
        $transformed = (object) ['id' => 42];
        $transformer = $this->createMock(FormTransformer::class);
        $transformer->expects($accepted ? self::once() : self::never())->method('transform')->with($form)->willReturn($transformed);
        $controller = (new \ReflectionClass(ModalController::class))->newInstanceWithoutConstructor();
        $controller->request = $request;
        $controller->response = (new \ReflectionClass(Response::class))->newInstanceWithoutConstructor();
        (new \ReflectionProperty(ModalController::class, 'checker'))->setValue($controller, $this->checker($settings));
        (new \ReflectionProperty(ModalController::class, 'defaults'))->setValue($controller, $this->defaults($defaultType, $locked));
        (new \ReflectionProperty(ModalController::class, 'formTransformer'))->setValue($controller, $transformer);
        $payloads = [];
        $handler = static function (PersistFormEvent $event) use (&$payloads, $form) {
            $payloads[] = $event->getPayload();
            $event->setForm($form);
        };
        Event::on(FormsController::class, FormsController::EVENT_CREATE_FORM, $handler);

        try {
            $result = (new \ReflectionMethod(ModalController::class, 'post'))->invoke($controller);
        } finally {
            Event::off(FormsController::class, FormsController::EVENT_CREATE_FORM, $handler);
        }

        self::assertSame($accepted ? 201 : 400, $controller->response->statusCode);
        self::assertSame($accepted ? $transformed : ['message' => 'Choose an available form type.'], $result);
        self::assertCount($accepted ? 1 : 0, $payloads);
        if ($accepted) {
            self::assertSame($type ?? ($defaultType ?: Regular::class), $payloads[0]->form->type);
            self::assertSame($type ?? ($defaultType ?: Regular::class), $payloads[0]->form->settings->general->type);
        }
    }

    private function defaults(string $type, bool $locked): DefaultsProvider
    {
        $defaults = $this->createMock(DefaultsProvider::class);
        $defaults->method('getValue')->willReturnMap([
            ['settings.general.formType', null, $type],
            ['settings.general.formattingTemplate', null, 'light.twig'],
            ['settings.dataStorage.storeData', null, true],
        ]);
        $defaults->method('isLocked')->willReturnCallback(static fn (string $path) => 'settings.general.formType' === $path && $locked);

        return $defaults;
    }

    private function checker(array $settings): LimitedUserChecker
    {
        $permissions = $this->createMock(PermissionsProvider::class);
        $permissions->method('isConsole')->willReturn(false);
        $permissions->method('permissionsEnabled')->willReturn(true);
        $provider = $this->createMock(LimitedUserSettingsProvider::class);
        $provider->method('getSettings')->willReturn($settings);

        return new LimitedUserChecker($permissions, $provider);
    }
}

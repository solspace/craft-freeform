<?php

namespace Solspace\Freeform\Tests\Bundles\Form\Types;

use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Bundles\Form\Types\Pages\Page;
use Solspace\Freeform\Bundles\Form\Types\Pages\PagesBundle;
use Solspace\Freeform\Bundles\Form\Types\Surveys\Survey;
use Solspace\Freeform\Bundles\Translations\TranslationProvider;
use Solspace\Freeform\Events\Forms\Types\RegisterFormTypeEvent;
use Solspace\Freeform\Form\Settings\Implementations\GeneralSettings;
use Solspace\Freeform\Form\Settings\Implementations\Options\FormTypeOptions;
use Solspace\Freeform\Form\Types\Regular;
use Solspace\Freeform\Services\Form\TypesService;
use Solspace\Freeform\Services\FormsService;
use yii\base\Event;

/**
 * @coversNothing
 */
class PageTypeTest extends TestCase
{
    private PagesBundle $bundle;

    protected function setUp(): void
    {
        $this->bundle = new PagesBundle();
    }

    protected function tearDown(): void
    {
        Event::off(TypesService::class, TypesService::EVENT_REGISTER_FORM_TYPES, [$this->bundle, 'registerFormTypes']);
    }

    public function testPageIsAvailableAlongsideExistingTypesWithoutChangingTheDefault(): void
    {
        $types = new TypesService();
        $types->on(TypesService::EVENT_REGISTER_FORM_TYPES, static function (RegisterFormTypeEvent $event) {
            $event->addType(Survey::class);
        });
        $options = (new FormTypeOptions($types))->fetchOptions(null)->toArray();

        self::assertContains(['value' => Page::class, 'label' => 'Page'], $options);
        self::assertContains(['value' => Regular::class, 'label' => 'Regular'], $options);
        self::assertContains(['value' => Survey::class, 'label' => 'Surveys & Polls'], $options);
        self::assertSame(Regular::class, (new GeneralSettings())->type);
        self::assertNotContains(Regular::class, array_column($types->getTypes(false), 'class'));
        self::assertContains(Page::class, array_column($types->getTypes(false), 'class'));
    }

    public function testPageIsAProFeature(): void
    {
        self::assertTrue(PagesBundle::isProOnly());
    }

    public function testStoredPageLoadsWithItsTypeAndSettingsIntact(): void
    {
        $properties = $this->createMock(PropertyProvider::class);
        $properties->method('setStoredObjectProperties')->willReturnCallback(static function (object $object, array $values): void {
            foreach ($values as $key => $value) {
                $object->{$key} = $value;
            }
        });
        $service = new FormsService(null, $properties, $this->createMock(TranslationProvider::class));
        $form = (new \ReflectionMethod(FormsService::class, 'createForm'))->invoke($service, [
            'id' => 15,
            'uid' => 'page-form',
            'type' => Page::class,
            'metadata' => json_encode([
                'general' => ['type' => Page::class, 'name' => 'Landing page', 'handle' => 'landingPage'],
                'behavior' => ['ajax' => false],
            ]),
        ]);

        self::assertInstanceOf(Page::class, $form);
        self::assertSame('Page', $form->getType());
        self::assertSame(Page::class, $form->getSettings()->getGeneral()->type);
        self::assertSame('Landing page', $form->getSettings()->getGeneral()->name);
        self::assertFalse($form->getSettings()->getBehavior()->ajax);
    }
}

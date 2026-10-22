<?php

namespace Solspace\Freeform\Tests\Services;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Form\Settings\Implementations\GeneralSettings;
use Solspace\Freeform\Form\Settings\Settings;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Services\FormIconService;
use Solspace\Freeform\Tests\Helpers\UsesCraft6Container;
use Solspace\Freeform\Variables\FreeformVariable;
use Twig\Environment;
use Twig\Loader\ArrayLoader;
use Twig\Markup;

#[CoversClass(Form::class)]
#[CoversClass(FormIconService::class)]
#[CoversClass(FreeformVariable::class)]
class FormIconPropertiesTest extends TestCase
{
    use UsesCraft6Container;

    private mixed $previousYiiApp;
    private mixed $previousCraftApp;

    protected function setUp(): void
    {
        $this->previousYiiApp = \Yii::$app;
        $this->previousCraftApp = \Craft::$app;
        \Craft::$app = (object) ['charset' => 'UTF-8'];
    }

    protected function tearDown(): void
    {
        \Yii::$app = $this->previousYiiApp;
        \Craft::$app = $this->previousCraftApp;
    }

    public function testTwigPropertiesRenderSafeSvgLazilyAndShareTheHelperCache(): void
    {
        $icons = $this->icons();
        $icons->expects(self::once())->method('renderIcon')->with('envelope')->willReturn('<svg data-icon="envelope"/>');
        $first = $this->form('envelope');
        $second = $this->form('envelope');
        $twig = new Environment(new ArrayLoader([
            'name' => '{{ form.icon }}',
            'svg' => '{% for form in forms %}{% if form.iconSvg %}<span aria-hidden="true">{{ form.iconSvg }}</span>{% endif %}{% endfor %}',
        ]), ['autoescape' => 'html', 'strict_variables' => true]);

        self::assertSame('envelope', $twig->render('name', ['form' => $first]));
        self::assertSame(
            str_repeat('<span aria-hidden="true"><svg data-icon="envelope"/></span>', 2),
            $twig->render('svg', ['forms' => [$first, $second]])
        );
        self::assertInstanceOf(Markup::class, $first->getIconSvg());
        self::assertSame('<svg data-icon="envelope"/>', (string) (new FreeformVariable())->formIcon('envelope'));
    }

    public function testReadingOnlyTheIconNameDoesNotResolveSvg(): void
    {
        $icons = $this->icons();
        $icons->expects(self::never())->method('renderIcon');
        self::assertSame('envelope', $this->form('envelope')->getIcon());
    }

    #[TestWith(['', true])]
    #[TestWith(['../icon', true])]
    #[TestWith(['<svg/>', true])]
    #[TestWith(['envelope', false])]
    public function testUnavailableOrInvalidIconsReturnNull(string $name, bool $supported): void
    {
        $icons = $this->icons($supported);
        $icons->expects(self::never())->method('renderIcon');
        $form = $this->form($name);
        self::assertSame($name, $form->getIcon());
        self::assertNull($form->getIconSvg());
    }

    public function testMissingIconsAreCachedAcrossForms(): void
    {
        $icons = $this->icons();
        $icons->expects(self::once())->method('renderIcon')->with('missing')->willReturn(null);
        self::assertNull($this->form('missing')->getIconSvg());
        self::assertNull($this->form('missing')->getIconSvg());
    }

    private function icons(bool $supported = true): FormIconService
    {
        $icons = $this->getMockBuilder(FormIconService::class)->onlyMethods(['isSupported', 'renderIcon'])->getMock();
        $icons->method('isSupported')->willReturn($supported);
        $plugin = $this->getMockBuilder(Freeform::class)->disableOriginalConstructor()->onlyMethods([])->getMock();
        $plugin->handle = 'freeform';
        $plugin->setComponents(['formIcons' => $icons]);
        app()->instance(Freeform::class, $plugin);
        \Yii::$app = (object) ['loadedModules' => [Freeform::class => $plugin]];

        return $icons;
    }

    private function form(string $icon): Form
    {
        $general = new GeneralSettings();
        $general->icon = $icon;
        $settings = $this->createMock(Settings::class);
        $settings->method('getGeneral')->willReturn($general);
        $form = $this->getMockBuilder(Form::class)->disableOriginalConstructor()->onlyMethods(['getSettings'])->getMock();
        $form->method('getSettings')->willReturn($settings);

        return $form;
    }
}

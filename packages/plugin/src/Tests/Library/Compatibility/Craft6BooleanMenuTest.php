<?php

namespace Solspace\Freeform\Tests\Library\Compatibility;

use CraftCms\Cms\Translation\I18N;
use CraftCms\Cms\View\InputNamespace;
use Illuminate\Container\Container;
use Illuminate\Support\Facades\Facade;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Library\Resources\Craft6BooleanMenu;

/**
 * @coversNothing
 */
class Craft6BooleanMenuTest extends TestCase
{
    private Container $previousContainer;
    private mixed $previousFacadeApp;
    private array $previousServer;

    protected function setUp(): void
    {
        $this->previousContainer = Container::getInstance();
        $this->previousFacadeApp = Facade::getFacadeApplication();
        $this->previousServer = $_SERVER;
        Container::setInstance(new Container());
        Facade::setFacadeApplication(app());
        Facade::clearResolvedInstances();
        app()->instance(InputNamespace::class, new InputNamespace());
        $translations = $this->createMock(I18N::class);
        $translations->method('translate')->willReturnCallback(static fn ($text): string => $text);
        app()->instance(I18N::class, $translations);
        $_SERVER['FREEFORM_BOOL_ON'] = 'true';
        $_SERVER['FREEFORM_BOOL_OFF'] = 'false';
        $_SERVER['FREEFORM_NON_BOOL'] = 'not a boolean';
    }

    protected function tearDown(): void
    {
        $_SERVER = $this->previousServer;
        Facade::clearResolvedInstances();
        Facade::setFacadeApplication($this->previousFacadeApp);
        Container::setInstance($this->previousContainer);
    }

    public function testNativeComboboxUsesEnabledDisabledAndRetainsEnvStatusHints(): void
    {
        $dom = $this->render(['value' => '$FREEFORM_BOOL_OFF', 'includeEnvVars' => true]);
        $combobox = $dom->getElementsByTagName('craft-combobox')->item(0);
        self::assertSame('$FREEFORM_BOOL_OFF', $combobox->getAttribute('model-value'));
        self::assertTrue($combobox->hasAttribute('requireoptionmatch'));
        self::assertFalse($combobox->hasAttribute('name'), 'Only the hidden select should submit the setting.');
        $options = json_decode($combobox->getAttribute('options'), true, flags: \JSON_THROW_ON_ERROR);
        self::assertSame(['Enabled', 'Disabled'], array_column(\array_slice($options, 0, 2), 'label'));
        $envOptions = array_column($options[2]['options'], null, 'value');
        self::assertSame('Enabled', $envOptions['$FREEFORM_BOOL_ON']['data']['hint']);
        self::assertSame('Disabled', $envOptions['$FREEFORM_BOOL_OFF']['data']['hint']);
        self::assertSame('empty', $envOptions['$FREEFORM_BOOL_OFF']['data']['indicator']['variant']);
        self::assertArrayNotHasKey('$FREEFORM_NON_BOOL', $envOptions);
        self::assertSame('empty', $dom->getElementsByTagName('craft-indicator')->item(0)->getAttribute('variant'));
    }

    public function testFormAndDependentFieldOwnerRetainsItsNameAndSelectedValue(): void
    {
        $dom = $this->render(['value' => 'true', 'toggle' => 'spam-features']);
        $select = $dom->getElementsByTagName('select')->item(0);
        self::assertSame('settings[enabled]', $select->getAttribute('name'));
        self::assertSame('enabled-value', $select->getAttribute('id'));
        self::assertSame('spam-features', $select->getAttribute('data-target'));
        self::assertSame('true', $select->getAttribute('data-boolean'));
        self::assertTrue($select->hasAttribute('hidden'));
        self::assertSame('1', $dom->getElementsByTagName('option')->item(0)->getAttribute('value'));
        self::assertTrue($dom->getElementsByTagName('option')->item(0)->hasAttribute('selected'));
        self::assertSame('success', $dom->getElementsByTagName('craft-indicator')->item(0)->getAttribute('variant'));
    }

    public function testMissingEnvReferenceIsPreservedAndReadOnlyControlsDoNotSubmit(): void
    {
        $dom = $this->render(['value' => '$FREEFORM_MISSING_FLAG', 'disabled' => true]);
        self::assertSame('$FREEFORM_MISSING_FLAG', $dom->getElementsByTagName('craft-combobox')->item(0)->getAttribute('model-value'));
        self::assertTrue($dom->getElementsByTagName('craft-combobox')->item(0)->hasAttribute('disabled'));
        self::assertTrue($dom->getElementsByTagName('select')->item(0)->hasAttribute('disabled'));
        self::assertTrue($dom->getElementsByTagName('option')->item(2)->hasAttribute('selected'));
    }

    public function testNamespacedFormKeepsTheCorrectFieldName(): void
    {
        app(InputNamespace::class)->set('slideout');
        $dom = $this->render([]);
        self::assertSame('slideout[settings][enabled]', $dom->getElementsByTagName('select')->item(0)->getAttribute('name'));
        self::assertSame('slideout-enabled', $dom->getElementsByTagName('craft-combobox')->item(0)->getAttribute('id'));
    }

    private function render(array $config): \DOMDocument
    {
        $html = Craft6BooleanMenu::render($config + ['id' => 'enabled', 'name' => 'settings[enabled]', 'label' => 'Enabled']);
        $dom = new \DOMDocument();
        @$dom->loadHTML($html);

        return $dom;
    }
}

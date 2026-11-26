<?php

namespace Solspace\Freeform\Tests\Bundles\Mcp;

use craft\events\RegisterComponentTypesEvent;
use craft\mcp\attributes\PublicMcp;
use craft\mcp\CapabilityRegistry;
use craft\services\Mcp;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Mcp\McpRegistration;
use yii\base\Event;

/**
 * @coversNothing
 */
class CapabilityRegistrationTest extends TestCase
{
    public function testRegistersPrivateToolsAndStructuredWriteInputs(): void
    {
        McpRegistration::register();
        $event = new RegisterComponentTypesEvent();
        Event::trigger(Mcp::class, Mcp::EVENT_REGISTER_CAPABILITY_TYPES, $event);

        $tools = (new CapabilityRegistry($event->types))->definitions()->getTools();
        self::assertCount(16, $tools);
        self::assertSame(
            ['handle', 'type', 'label'],
            $tools['freeform.forms.create']->tool->inputSchema['properties']['fields']['items']['required'],
        );
        $fieldSchema = $tools['freeform.forms.create']->tool->inputSchema['properties']['fields']['items']['properties'];
        self::assertSame(3, $fieldSchema['maxStars']['minimum']);
        self::assertSame(10, $fieldSchema['maxStars']['maximum']);
        self::assertSame(['full', 'half', 'third', 'quarter'], $fieldSchema['width']['enum']);
        self::assertSame(1, $fieldSchema['page']['minimum']);
        self::assertSame(['type', 'handle'], $fieldSchema['optionSource']['required']);
        self::assertSame($fieldSchema['optionSource'], $tools['freeform.fields.add']->tool->inputSchema['properties']['field']['properties']['optionSource']);
        self::assertTrue($tools['freeform.fields.option-sources']->tool->annotations->readOnlyHint);
        self::assertArrayHasKey('pageLabels', $tools['freeform.forms.create']->tool->inputSchema['properties']);
        self::assertSame(
            ['handle', 'type', 'label'],
            $tools['freeform.fields.add']->tool->inputSchema['properties']['field']['required'],
        );
        $fieldUpdate = $tools['freeform.fields.update']->tool->inputSchema['properties'];
        self::assertArrayHasKey('maxStars', $fieldUpdate);
        self::assertArrayHasKey('placeholder', $fieldUpdate);
        self::assertSame(
            ['key', 'text'],
            $tools['freeform.translations.save']->tool->inputSchema['properties']['translations']['items']['required'],
        );

        self::assertFalse($tools['freeform.fields.request-removal']->tool->annotations->destructiveHint);
        self::assertTrue($tools['freeform.fields.remove']->tool->annotations->destructiveHint);
        self::assertSame(['reviewId'], $tools['freeform.fields.remove']->tool->inputSchema['required']);
        $writes = ['freeform.forms.create', 'freeform.fields.update', 'freeform.fields.add', 'freeform.fields.request-removal', 'freeform.fields.remove', 'freeform.translations.save'];
        foreach ($tools as $name => $reference) {
            $method = new \ReflectionMethod(...$reference->handler);
            self::assertSame([], $method->getAttributes(PublicMcp::class), $name);
            self::assertSame(!\in_array($name, $writes, true), true === $reference->tool->annotations?->readOnlyHint, $name);
        }
    }
}

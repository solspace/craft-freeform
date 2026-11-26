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
        self::assertCount(12, $tools);
        self::assertSame(
            ['handle', 'type', 'label'],
            $tools['freeform.forms.create']->tool->inputSchema['properties']['fields']['items']['required'],
        );
        self::assertSame(
            ['key', 'text'],
            $tools['freeform.translations.save']->tool->inputSchema['properties']['translations']['items']['required'],
        );

        $writes = ['freeform.forms.create', 'freeform.fields.update', 'freeform.translations.save'];
        foreach ($tools as $name => $reference) {
            $method = new \ReflectionMethod(...$reference->handler);
            self::assertSame([], $method->getAttributes(PublicMcp::class), $name);
            self::assertSame(!\in_array($name, $writes, true), true === $reference->tool->annotations?->readOnlyHint, $name);
        }
    }
}

<?php

namespace Solspace\Freeform\Tests\Form\Settings;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Form\Settings\Implementations\Options\FormStatusOptions;
use Solspace\Freeform\Models\StatusModel;
use Solspace\Freeform\Records\StatusRecord;
use Solspace\Freeform\Services\StatusesService;

#[CoversClass(FormStatusOptions::class)]
class FormStatusOptionsTest extends TestCase
{
    private $previousApp;

    protected function setUp(): void
    {
        $this->previousApp = \Craft::$app;
        $this->setCraftVersion('6.0.0-alpha.19');
    }

    protected function tearDown(): void
    {
        \Craft::$app = $this->previousApp;
    }

    public function testStatusChoicesUseConfiguredColorsAndPreserveIdsNamesAndOrder(): void
    {
        $statuses = [
            new StatusModel(['id' => 7, 'name' => 'Open', 'color' => 'emerald']),
            new StatusModel(['id' => 2, 'name' => 'Awaiting review', 'color' => 'amber']),
            new StatusModel(['id' => 9, 'name' => '<Closed>', 'color' => 'indigo']),
        ];
        $service = $this->createMock(StatusesService::class);
        $service->method('getAllStatuses')->willReturn($statuses);
        $options = (new FormStatusOptions($service))->fetchOptions(null)->toArray();
        self::assertSame([
            ['value' => '7', 'label' => 'Open', 'color' => '#10b981'],
            ['value' => '2', 'label' => 'Awaiting review', 'color' => '#f59e0b'],
            ['value' => '9', 'label' => '<Closed>', 'color' => '#6366f1'],
        ], $options);
    }

    public function testEveryCraft6ColorMatchesTheStatusesSettingsPalette(): void
    {
        $this->assertPalette([
            'red' => '#dc2626',
            'orange' => '#fb923c',
            'amber' => '#f59e0b',
            'yellow' => '#eab308',
            'lime' => '#84cc16',
            'green' => '#16a34a',
            'emerald' => '#10b981',
            'teal' => '#11a697',
            'cyan' => '#06b6d4',
            'sky' => '#0ea5e9',
            'blue' => '#2563eb',
            'indigo' => '#6366f1',
            'violet' => '#8b5cf6',
            'purple' => '#a855f7',
            'fuchsia' => '#d946ef',
            'pink' => '#ec4899',
            'rose' => '#f43f5e',
            'white' => '#ffffff',
            'gray' => '#606d7b',
            'black' => '#000000',
        ]);
    }

    public function testLegacyColorsStillWorkOnUpgradedSites(): void
    {
        foreach (['turquoise' => '#2CE0BD', 'light' => '#CCD1D6', 'grey' => '#98A3AE'] as $color => $hex) {
            self::assertSame($hex, (new StatusModel(['color' => $color]))->getColorHex());
        }
    }

    private function assertPalette(array $palette): void
    {
        self::assertSame(array_keys($palette), StatusRecord::getAllowedColors());
        self::assertSame($palette, (new StatusModel())->getColorPalette());
        $statuses = [];
        $expected = [];
        foreach ($palette as $color => $hex) {
            $id = \count($statuses) + 1;
            $statuses[] = new StatusModel(['id' => $id, 'name' => $color, 'color' => $color]);
            $expected[] = ['value' => (string) $id, 'label' => $color, 'color' => $hex];
        }

        $service = $this->createMock(StatusesService::class);
        $service->method('getAllStatuses')->willReturn($statuses);
        self::assertSame($expected, (new FormStatusOptions($service))->fetchOptions(null)->toArray());
    }

    private function setCraftVersion(string $version): void
    {
        \Craft::$app = new class($version) {
            public function __construct(private string $version) {}

            public function getVersion(): string
            {
                return $this->version;
            }
        };
    }
}

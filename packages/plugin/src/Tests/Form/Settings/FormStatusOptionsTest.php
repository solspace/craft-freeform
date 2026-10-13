<?php

namespace Solspace\Freeform\Tests\Form\Settings;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Form\Settings\Implementations\Options\FormStatusOptions;
use Solspace\Freeform\Models\StatusModel;
use Solspace\Freeform\Services\StatusesService;

#[CoversClass(FormStatusOptions::class)]
class FormStatusOptionsTest extends TestCase
{
    public function testStatusChoicesUseConfiguredColorsAndPreserveIdsNamesAndOrder(): void
    {
        $statuses = [
            new StatusModel(['id' => 7, 'name' => 'Open', 'color' => 'green']),
            new StatusModel(['id' => 2, 'name' => 'Awaiting review', 'color' => 'orange']),
            new StatusModel(['id' => 9, 'name' => '<Closed>', 'color' => 'purple']),
        ];
        $service = $this->createMock(StatusesService::class);
        $service->method('getAllStatuses')->willReturn($statuses);
        $options = (new FormStatusOptions($service))->fetchOptions(null)->toArray();
        self::assertSame([
            ['value' => '7', 'label' => 'Open', 'color' => '#27AE60'],
            ['value' => '2', 'label' => 'Awaiting review', 'color' => '#F2842D'],
            ['value' => '9', 'label' => '<Closed>', 'color' => '#9B59B6'],
        ], $options);
    }
}

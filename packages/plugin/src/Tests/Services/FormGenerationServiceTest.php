<?php

namespace Solspace\Freeform\Tests\Services;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Attributes\Property\Input\TabularData;
use Solspace\Freeform\Attributes\Property\PropertyCollection;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Bundles\Integrations\Providers\IntegrationClientProvider;
use Solspace\Freeform\Bundles\Transformers\Builder\Form\FormTransformer;
use Solspace\Freeform\Fields\Implementations\Pro\OpinionScaleField;
use Solspace\Freeform\Services\FormGenerationService;
use Solspace\Freeform\Services\FormsService;
use Solspace\Freeform\Services\Integrations\IntegrationsService;

#[CoversClass(FormGenerationService::class)]
class FormGenerationServiceTest extends TestCase
{
    public function testOpinionScaleOptionsUseTabularRows(): void
    {
        $scales = new TabularData(value: []);
        $scales->handle = 'scales';

        $propertyProvider = $this->createMock(PropertyProvider::class);
        $propertyProvider->expects($this->once())
            ->method('getEditableProperties')
            ->with(OpinionScaleField::class)
            ->willReturn((new PropertyCollection())->add($scales))
        ;

        $service = new FormGenerationService(
            $this->createMock(IntegrationsService::class),
            $this->createMock(IntegrationClientProvider::class),
            $propertyProvider,
            $this->createMock(FormTransformer::class),
            $this->createMock(FormsService::class),
        );

        $method = new \ReflectionMethod(FormGenerationService::class, 'mergeFieldProperties');
        $properties = $method->invoke($service, OpinionScaleField::class, [
            'type' => 'OpinionScale',
            'options' => ['Poor', ['value' => '0', 'label' => 'Zero'], ['value' => 1, 'label' => 'Good']],
        ]);

        $this->assertSame([['Poor', 'Poor'], ['0', 'Zero'], ['1', 'Good']], $properties['scales']);
        $this->assertArrayNotHasKey('options', $properties);
    }
}

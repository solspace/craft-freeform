<?php

namespace Solspace\Freeform\Tests\Bundles\Submissions;

use CraftCms\Cms\Element\Events\ElementSourceTableAttributesResolving;
use CraftCms\Cms\Entry\Elements\Entry;
use Illuminate\Support\Facades\Event;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Submissions\CustomSourceFields;
use Solspace\Freeform\Elements\SpamSubmission;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Interfaces\NoStorageInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Form\Layout\FormLayout;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Collections\FieldCollection;
use Solspace\Freeform\Services\FormsService;
use Solspace\Freeform\Tests\Helpers\UsesCraft6Container;

#[CoversClass(CustomSourceFields::class)]
class CustomSourceFieldsTest extends TestCase
{
    use UsesCraft6Container;

    #[TestWith([Submission::class])]
    #[TestWith([SpamSubmission::class])]
    public function testNativeEventAddsOnlyTheSelectedFormsStoredFields(string $elementType): void
    {
        $stored = $this->createStub(FieldInterface::class);
        $stored->method('getId')->willReturn(12);
        $stored->method('getLabel')->willReturn('First Name');
        $other = $this->createStub(FieldInterface::class);
        $other->method('getId')->willReturn(13);
        $other->method('getLabel')->willReturn('Other Form Field');
        $display = $this->createStubForIntersectionOfInterfaces([FieldInterface::class, NoStorageInterface::class]);

        $this->bundle([6 => $this->form([$stored, $display]), 7 => $this->form([$other])]);
        $event = new ElementSourceTableAttributesResolving($elementType, 'form:6', collect([
            'status' => ['label' => 'Status'],
        ]));
        Event::dispatch($event);

        self::assertSame([
            'status' => ['label' => 'Status'],
            'field:12' => ['label' => 'First Name'],
        ], $event->attributes->all());
    }

    #[TestWith([Submission::class, '*'])]
    #[TestWith([Submission::class, 'form:999'])]
    #[TestWith([Submission::class, 'custom:6'])]
    #[TestWith([Entry::class, 'form:6'])]
    public function testUnrelatedAndMissingSourcesAreLeftAlone(string $elementType, string $source): void
    {
        $this->bundle([]);
        $event = new ElementSourceTableAttributesResolving($elementType, $source, collect([
            'status' => ['label' => 'Status'],
        ]));
        Event::dispatch($event);

        self::assertSame(['status' => ['label' => 'Status']], $event->attributes->all());
    }

    private function bundle(array $forms): CustomSourceFields
    {
        $service = $this->createStub(FormsService::class);
        $service->method('getAllForms')->willReturn($forms);
        $plugin = $this->createStub(Freeform::class);
        $plugin->method('__get')->willReturn($service);

        app()->instance(Freeform::class, $plugin);

        return new CustomSourceFields();
    }

    private function form(array $fields): Form
    {
        $layout = $this->createStub(FormLayout::class);
        $layout->method('getFields')->willReturn(new FieldCollection($fields));
        $form = $this->createStub(Form::class);
        $form->method('getLayout')->willReturn($layout);

        return $form;
    }
}

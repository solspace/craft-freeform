<?php

namespace Solspace\Freeform\Tests\Fields;

use PHPUnit\Framework\Attributes\CoversNothing;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Form\Types\Pages\Page;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\Pro\FormSectionField;
use Solspace\Freeform\Fields\Implementations\Pro\GroupField;
use Solspace\Freeform\Fields\Implementations\Pro\LayoutColumnField;
use Solspace\Freeform\Fields\Implementations\Pro\LayoutField;
use Solspace\Freeform\Fields\Implementations\TextField;
use Solspace\Freeform\Form\Layout\Layout;
use Solspace\Freeform\Form\Layout\Row;
use Solspace\Freeform\Library\Collections\FieldCollection;
use Solspace\Freeform\Services\SubmissionsService;
use Twig\Environment;
use Twig\Loader\ArrayLoader;

#[CoversNothing]
class SubmissionFormSectionTest extends TestCase
{
    #[TestWith([false])]
    #[TestWith([true])]
    public function testFormSectionRendersStoredChildValuesWithoutLookingUpAFormValue(bool $nested): void
    {
        $previousApp = \Craft::$app;

        try {
            $templates = [];
            foreach (glob(__DIR__.'/../../templates/submissions/fields/*.twig') as $path) {
                $templates['freeform/submissions/fields/'.basename($path, '.twig')] = file_get_contents($path);
            }
            // Keep Craft's control markup outside this test while exercising the
            // service's actual template lookup and recursive container rendering.
            $templates['_includes/forms'] = '{% macro textField(options) %}<input name="{{ options.name }}" value="{{ options.value }}">{% endmacro %}';
            $templates['freeform/submissions/macros/row'] = '{% macro render(row, submission) %}{% for field in row.allFields %}{{ craft.freeformSubmissions.renderSubmissionField(field, submission) }}{% endfor %}{% endmacro %}';
            $twig = new Environment(new ArrayLoader($templates), ['autoescape' => 'html', 'strict_variables' => true]);
            $service = new SubmissionsService();
            $twig->addGlobal('craft', ['freeformSubmissions' => $service]);
            \Craft::$app = (object) ['view' => new class($twig) {
                public function __construct(private Environment $twig) {}

                public function resolveTemplate(string $path): string
                {
                    return __DIR__.'/../../templates/'.substr($path, \strlen('freeform/')).'.twig';
                }

                public function renderTemplate(string $path, array $variables): string
                {
                    return $this->twig->render($path, $variables);
                }
            }];

            $text = $this->createStub(TextField::class);
            $text->method('getType')->willReturn('text');
            $text->method('getHandle')->willReturn('firstName');
            $text->method('getLabel')->willReturn('First name');
            $text->method('getValue')->willReturn('Saved <name> & value');
            $section = $this->container(FormSectionField::class, 'form-section', 'form', $text);
            $section->expects(self::never())->method('getStepLayout');
            $root = $section;
            if ($nested) {
                $group = $this->container(GroupField::class, 'group', 'details', $section);
                $column = $this->container(LayoutColumnField::class, 'layout-column', 'column', $group);
                $root = $this->container(LayoutField::class, 'layout', 'layout', $column);
            }

            // The reserved "form" handle resolves to the Page form object on a
            // real Submission. The default value template must never handle it.
            $submission = $this->getMockBuilder(Submission::class)->disableOriginalConstructor()
                ->onlyMethods(['getForm', 'getFieldCollection', 'getErrors'])->getMock()
            ;
            $submission->method('getForm')->willReturn($this->createStub(Page::class));
            $submission->method('getFieldCollection')->willReturn(new FieldCollection([$text]));
            $submission->method('getErrors')->willReturn([]);

            $html = (string) $service->renderSubmissionField($root, $submission);
            self::assertStringContainsString('<fieldset class="group">', $html);
            self::assertStringContainsString('<legend>form</legend>', $html);
            self::assertSame(1, substr_count($html, 'name="firstName"'));
            self::assertStringContainsString('value="Saved &lt;name&gt; &amp; value"', $html);
            self::assertStringNotContainsString('type="submit"', $html);
        } finally {
            \Craft::$app = $previousApp;
        }
    }

    private function container(string $class, string $type, string $handle, FieldInterface $child): GroupField
    {
        $row = new Row();
        $row->getAllFields()->add($child);
        $layout = new Layout();
        $layout->getRows()->add($row);
        $field = $this->createMock($class);
        $field->method('getType')->willReturn($type);
        $field->method('getHandle')->willReturn($handle);
        $field->method('getLabel')->willReturn($handle);
        $field->method('getLayout')->willReturn($layout);

        return $field;
    }
}

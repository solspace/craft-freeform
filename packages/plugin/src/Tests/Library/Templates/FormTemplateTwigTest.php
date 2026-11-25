<?php

namespace Solspace\Freeform\Tests\Library\Templates;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Library\Templates\FormTemplateNodeVisitor;
use Solspace\Freeform\Library\Templates\FormTemplateTwig;
use Solspace\Freeform\Library\Templates\TemplateFieldValue;
use Twig\Markup;
use Twig\Sandbox\SecurityError;

#[CoversClass(FormTemplateTwig::class)]
#[CoversClass(FormTemplateNodeVisitor::class)]
#[CoversClass(TemplateFieldValue::class)]
class FormTemplateTwigTest extends TestCase
{
    public function testCommonNotificationTokensRenderWithHtmlEscaping(): void
    {
        $field = $this->createStub(FieldInterface::class);
        $field->method('getLabel')->willReturn('Choice');
        $field->method('getValueAsString')->willReturn('<Example>');
        $field->method('getReadableOutputValue')->willReturn('First choice');
        $field->method('implements')->willReturn(true);
        $variables = [
            'allFields' => [$field],
            'submission' => ['dateCreated' => new \DateTime('2026-11-24 UTC')],
            'loops' => ['fields' => ['all' => new Markup('<p>Fields</p>', 'UTF-8')]],
        ];

        self::assertSame(
            'Nov 24 Choice: First choice / &lt;Example&gt; <p>Fields</p>',
            FormTemplateTwig::render(
                "{{ submission.dateCreated.format('M j') }} {% for field in allFields %}{{ field.label }}: {{ field.implements('options') ? field.labelsAsString : field.valueAsString }} / {{ field }}{% endfor %} {{ loops.fields.all }}",
                $variables,
                true,
            ),
        );
    }

    public function testContextOmitsObjectsAndKeepsScalarData(): void
    {
        self::assertSame('ok/literal', FormTemplateTwig::render(
            '{% if context.object is null and craft is not defined %}{{ context.text }}/{{ context.status }}{% endif %}',
            ['context' => ['object' => new \stdClass(), 'text' => 'ok', 'status' => 'literal']],
        ));
    }

    public function testHtmlAndPlainTextCompileSeparately(): void
    {
        $source = '{{ text }}';
        $variables = ['text' => '<Example>'];

        self::assertSame('<Example>', FormTemplateTwig::render($source, $variables));
        self::assertSame('&lt;Example&gt;', FormTemplateTwig::render($source, $variables, true));
    }

    #[TestWith(["{{ constant('PHP_VERSION') }}"])]
    #[TestWith(["{{ ['name']|map(name => name|upper)|join }}"])]
    #[TestWith(["{% include 'form-example' %}"])]
    #[TestWith(['{% for item in 1..3 %}{{ item }}{% endfor %}'])]
    public function testRestrictedConstructsAreDenied(string $source): void
    {
        $this->expectException(SecurityError::class);

        FormTemplateTwig::render($source, []);
    }
}

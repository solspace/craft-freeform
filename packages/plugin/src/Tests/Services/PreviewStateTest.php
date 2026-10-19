<?php

namespace Solspace\Freeform\Tests\Services;

use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\TestWith;
use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Rules\ConditionValidator;
use Solspace\Freeform\Bundles\Rules\RuleProvider;
use Solspace\Freeform\Bundles\Rules\RuleValidator;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Interfaces\FileUploadInterface;
use Solspace\Freeform\Fields\Interfaces\MultiDimensionalValueInterface;
use Solspace\Freeform\Fields\Interfaces\MultiValueInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Form\Layout\FormLayout;
use Solspace\Freeform\Form\Layout\Page;
use Solspace\Freeform\Library\Collections\FieldCollection;
use Solspace\Freeform\Library\Collections\PageCollection;
use Solspace\Freeform\Library\DataObjects\FormTemplate;
use Solspace\Freeform\Library\Helpers\PreviewState;
use Solspace\Freeform\Library\Rules\Condition;
use Solspace\Freeform\Library\Rules\ConditionCollection;
use Solspace\Freeform\Library\Rules\Types\PageRule;
use Solspace\Freeform\Library\Rules\Types\SubmitFormRule;

#[CoversClass(PreviewState::class)]
class PreviewStateTest extends TestCase
{
    public function testTemplateOverrideResolvesOnlyAnExactBundledIdentifier(): void
    {
        $sample = $this->createMock(FormTemplate::class);
        $sample->method('getFileName')->willReturn('tailwind-4-dark/index.twig');
        self::assertNull(PreviewState::resolveTemplateOverride(null, [$sample]));
        self::assertNull(PreviewState::resolveTemplateOverride('', [$sample]));
        self::assertSame($sample, PreviewState::resolveTemplateOverride('tailwind-4-dark/index.twig', [$sample]));
    }

    #[TestWith(['../tailwind-4-dark/index.twig'])]
    #[TestWith(['/etc/passwd'])]
    #[TestWith(['https://example.com/template.twig'])]
    #[TestWith(['custom/index.twig'])]
    #[TestWith([['tailwind-4-dark/index.twig']])]
    #[TestWith([false])]
    public function testUnknownPathsAndMalformedTemplateOverridesAreRejected(mixed $value): void
    {
        $sample = $this->createMock(FormTemplate::class);
        $sample->method('getFileName')->willReturn('tailwind-4-dark/index.twig');
        $this->expectException(\InvalidArgumentException::class);
        PreviewState::resolveTemplateOverride($value, [$sample]);
    }

    public function testUploadsAndNestedAnswersAreSkippedAndMultipleValuesAreNormalized(): void
    {
        $upload = $this->createMockForIntersectionOfInterfaces([FieldInterface::class, FileUploadInterface::class]);
        $nested = $this->createMockForIntersectionOfInterfaces([FieldInterface::class, MultiDimensionalValueInterface::class]);
        $upload->expects(self::never())->method('setValue');
        $nested->expects(self::never())->method('setValue');
        $multiple = $this->createMockForIntersectionOfInterfaces([FieldInterface::class, MultiValueInterface::class]);
        $multiple->method('getHandle')->willReturn('choices');
        $multiple->expects(self::once())->method('setValue')->with(['one'])->willReturnSelf();
        $layout = $this->createMock(FormLayout::class);
        $layout->method('getFields')->willReturn(new FieldCollection([$upload, $nested, $multiple]));
        $form = $this->createMock(Form::class);
        $form->method('isPreview')->willReturn(true);
        $form->method('getLayout')->willReturn($layout);
        self::assertSame(['choices'], PreviewState::apply($form, ['choices' => 'one', 'action' => 'submit']));
    }

    public function testUntouchedMultipleChoiceFieldsStartWithAnEmptySelection(): void
    {
        $multiple = $this->createMockForIntersectionOfInterfaces([FieldInterface::class, MultiValueInterface::class]);
        $multiple->method('getHandle')->willReturn('choices');
        $multiple->method('getValue')->willReturn(null);
        $multiple->expects(self::once())->method('setValue')->with([])->willReturnSelf();
        $layout = $this->createMock(FormLayout::class);
        $layout->method('getFields')->willReturn(new FieldCollection([$multiple]));
        $form = $this->createMock(Form::class);
        $form->method('isPreview')->willReturn(true);
        $form->method('getLayout')->willReturn($layout);
        self::assertSame(['choices'], PreviewState::apply($form, []));
    }

    #[TestWith([['field' => ['object' => 'bad']]])]
    #[TestWith([['field' => [null]]])]
    #[TestWith([['field' => 1]])]
    #[TestWith([['__proto__' => 'bad']])]
    #[TestWith([null])]
    public function testInvalidMessagesAreRejected(mixed $values): void
    {
        $this->expectException(\InvalidArgumentException::class);
        PreviewState::validateValues($values);
    }

    public function testValuesSupportScalarAndMultipleChoiceAnswers(): void
    {
        $values = ['employment' => 'employed', 'choices' => ['first', 'second'], 'unchecked' => []];
        self::assertSame($values, PreviewState::validateValues($values));
        $this->expectException(\InvalidArgumentException::class);
        PreviewState::validateValues(['field' => str_repeat('x', 10001)]);
    }

    #[TestWith(['basic-dark/index.twig'])]
    #[TestWith(['bootstrap-5-dark/index.twig'])]
    #[TestWith(['tailwind-3-dark/index.twig'])]
    #[TestWith(['tailwind-4-dark/index.twig'])]
    #[TestWith(['daisyui-5-dark/index.twig'])]
    #[TestWith(['conversational/index.twig'])]
    public function testOnlyKnownDarkSamplesGetDarkBackground(string $template): void
    {
        self::assertTrue(PreviewState::isDark($template, false));
        self::assertFalse(PreviewState::isDark($template, true));
        self::assertFalse(PreviewState::isDark('basic-light/index.twig', false));
    }

    #[TestWith(['', false, 1])]
    #[TestWith(['skip', false, 2])]
    #[TestWith(['finish', true, null])]
    #[TestWith(['', false, null, 2])]
    public function testNativePageRulesAndEarlyCompletionUsePreviewAnswers(string $answer, bool $early, ?int $expected, int $current = 0): void
    {
        $field = $this->createMock(FieldInterface::class);
        $field->method('getHandle')->willReturn('route');
        $field->method('getUid')->willReturn('route-uid');
        $value = '';
        $field->method('setValue')->willReturnCallback(static function ($next) use (&$value, $field) {
            $value = $next;

            return $field;
        });
        $field->method('getValue')->willReturnCallback(static function () use (&$value) { return $value; });
        $fields = new FieldCollection([$field]);
        $pages = new PageCollection();
        for ($i = 0; $i < 3; ++$i) {
            $page = $this->createMock(Page::class);
            $page->method('getIndex')->willReturn($i);
            $page->method('getFields')->willReturn(0 === $i ? $fields : new FieldCollection());
            $pages->add($page);
        }
        $layout = $this->createMock(FormLayout::class);
        $layout->method('getFields')->willReturn($fields);
        $layout->method('getPages')->willReturn($pages);
        $form = $this->createMock(Form::class);
        $form->method('isPreview')->willReturn(true);
        $form->method('getLayout')->willReturn($layout);
        $form->method('getPages')->willReturn($pages);
        $form->method('getCurrentPage')->willReturn($pages->getByIndex($current));
        $form->method('getCurrentPageIndex')->willReturn($current);
        $form->expects(self::never())->method('submit');
        $form->expects(self::never())->method('persistState');
        self::assertSame(['route'], PreviewState::apply($form, ['route' => $answer, 'action' => 'freeform/submit', 'unknown' => 'ignored']));

        $jump = (new PageRule(1, 'jump', 'and', new ConditionCollection([
            new Condition('condition', $field, Condition::TYPE_EQUALS, 'skip'),
        ])))->setPage($pages->getByIndex(2));
        $finish = new SubmitFormRule(2, 'finish', 'and', new ConditionCollection([
            new Condition('condition', $field, Condition::TYPE_EQUALS, 'finish'),
        ]));
        $provider = $this->createMock(RuleProvider::class);
        $provider->method('getPageRules')->willReturn([$jump]);
        $provider->method('getSubmitFormRule')->willReturn($early ? $finish : null);
        self::assertSame($expected, PreviewState::nextPage($form, new RuleValidator($provider, new ConditionValidator())));
    }
}

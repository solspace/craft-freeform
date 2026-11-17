<?php

namespace Solspace\Freeform\Tests\Fields;

use PHPUnit\Framework\TestCase;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Bundles\Translations\TranslationProvider;
use Solspace\Freeform\Fields\AbstractField;
use Solspace\Freeform\Fields\Implementations\TextField;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Form\Settings\Settings;
use Solspace\Freeform\Form\Types\Regular;
use Solspace\Freeform\Library\Attributes\FieldAttributesCollection;
use Solspace\Freeform\Library\Translations\TranslationTable;
use Symfony\Component\PropertyAccess\PropertyAccessor;

/**
 * @coversNothing
 */
class FormFieldIdentityTest extends TestCase
{
    public function testRepeatedFormsAndFieldsHaveIndependentLabelAndDescriptionTargets(): void
    {
        $ids = [];
        foreach (['contact', 'contact', 'quote'] as $handle) {
            $field = $this->field($this->form($handle));
            $field->addError('Enter your email.');
            $id = $field->getIdAttribute();
            $ids[] = $id;
            self::assertSame($id, $field->getIdAttribute());
            $html = (string) $field->render();
            self::assertStringContainsString('for="'.$id.'"', $html);
            self::assertStringContainsString('id="'.$id.'"', $html);
            self::assertStringContainsString('id="'.$id.'-instructions"', $html);
            self::assertStringContainsString('id="'.$id.'-error"', $html);
            self::assertStringContainsString('aria-describedby="'.$id.'-instructions '.$id.'-error"', $html);
        }
        self::assertCount(3, array_unique($ids));
    }

    public function testNewPlacementsRotateTheNamespaceAndRestoredContextKeepsIt(): void
    {
        $form = $this->form('contact');
        $form->setPreview();
        $field = $this->field($form);
        $form->registerContext();
        $first = $field->getIdAttribute();
        $properties = $form->getProperties()->toArray();
        $form->registerContext();
        self::assertNotSame($first, $field->getIdAttribute());
        $restored = $this->form('contact');
        $restored->setPreview();
        $restored->getProperties()->merge($properties);
        $restored->registerContext();
        self::assertSame($first, $this->field($restored)->getIdAttribute());
    }

    public function testExplicitPrefixesAndIdsRemainIntactAndLabelsFollowCustomInputIds(): void
    {
        $form = $this->form('contact');
        $form->setProperties(['fieldIdPrefix' => 'custom-']);
        $field = $this->field($form);
        self::assertSame('custom-form-input-email', $field->getIdAttribute());
        $field->setParameters(['id' => 'email']);
        self::assertSame('custom-email', $field->getIdAttribute());
        $form->getProperties()->remove('fieldIdPrefix');
        self::assertSame('email', $field->getIdAttribute());
        (new \ReflectionProperty(AbstractField::class, 'attributes'))->setValue($field, new FieldAttributesCollection(['input' => ['id' => 'integration-email']]));
        self::assertSame('integration-email', $field->getIdAttribute());
        self::assertStringContainsString('for="integration-email"', (string) $field->render());
        $form->setProperties(['fieldIdPrefix' => '']);
        $other = $this->field($form);
        self::assertSame('form-input-email', $other->getIdAttribute());
    }

    private function form(string $handle): Form
    {
        $settings = new Settings([], $this->createStub(PropertyProvider::class));
        $settings->getGeneral()->handle = $handle;

        return new Regular(['id' => 7, 'uid' => 'test-form'], $settings, new PropertyAccessor(), $this->createStub(TranslationProvider::class));
    }

    private function field(Form $form): TextField
    {
        $field = $this->getMockBuilder(TextField::class)->setConstructorArgs([$form])->onlyMethods(['getTranslationTable'])->getMock();
        $field->method('getTranslationTable')->willReturn(new TranslationTable((object) []));
        foreach (['handle' => 'email', 'label' => 'Email', 'instructions' => 'Use your work email.'] as $name => $value) {
            (new \ReflectionProperty(AbstractField::class, $name))->setValue($field, $value);
        }

        return $field;
    }
}

<?php

namespace Solspace\Freeform\Bundles\Backup\Import\FormieV3\Fields;

use Solspace\Freeform\Bundles\Backup\DTO\Field;
use Solspace\Freeform\Bundles\Backup\Import\FormieV3\Fields\Interfaces\FieldProcessorInterface;
use Solspace\Freeform\Bundles\Backup\Import\FormieV3\Fields\Processors\AddressProcessor;
use Solspace\Freeform\Bundles\Backup\Import\FormieV3\Fields\Processors\AgreeProcessor;
use Solspace\Freeform\Bundles\Backup\Import\FormieV3\Fields\Processors\CalculationsProcessor;
use Solspace\Freeform\Bundles\Backup\Import\FormieV3\Fields\Processors\CategoriesProcessor;
use Solspace\Freeform\Bundles\Backup\Import\FormieV3\Fields\Processors\CheckboxesProcessor;
use Solspace\Freeform\Bundles\Backup\Import\FormieV3\Fields\Processors\CheckboxProcessor;
use Solspace\Freeform\Bundles\Backup\Import\FormieV3\Fields\Processors\DateProcessor;
use Solspace\Freeform\Bundles\Backup\Import\FormieV3\Fields\Processors\DropdownProcessor;
use Solspace\Freeform\Bundles\Backup\Import\FormieV3\Fields\Processors\EmailProcessor;
use Solspace\Freeform\Bundles\Backup\Import\FormieV3\Fields\Processors\EntriesProcessor;
use Solspace\Freeform\Bundles\Backup\Import\FormieV3\Fields\Processors\FileUploadProcessor;
use Solspace\Freeform\Bundles\Backup\Import\FormieV3\Fields\Processors\FormsProcessor;
use Solspace\Freeform\Bundles\Backup\Import\FormieV3\Fields\Processors\GroupProcessor;
use Solspace\Freeform\Bundles\Backup\Import\FormieV3\Fields\Processors\HeadingProcessor;
use Solspace\Freeform\Bundles\Backup\Import\FormieV3\Fields\Processors\HiddenProcessor;
use Solspace\Freeform\Bundles\Backup\Import\FormieV3\Fields\Processors\HtmlProcessor;
use Solspace\Freeform\Bundles\Backup\Import\FormieV3\Fields\Processors\MultiLineTextProcessor;
use Solspace\Freeform\Bundles\Backup\Import\FormieV3\Fields\Processors\NameProcessor;
use Solspace\Freeform\Bundles\Backup\Import\FormieV3\Fields\Processors\NumberProcessor;
use Solspace\Freeform\Bundles\Backup\Import\FormieV3\Fields\Processors\PasswordProcessor;
use Solspace\Freeform\Bundles\Backup\Import\FormieV3\Fields\Processors\PaymentProcessor;
use Solspace\Freeform\Bundles\Backup\Import\FormieV3\Fields\Processors\PhoneProcessor;
use Solspace\Freeform\Bundles\Backup\Import\FormieV3\Fields\Processors\ProductsProcessor;
use Solspace\Freeform\Bundles\Backup\Import\FormieV3\Fields\Processors\RadioProcessor;
use Solspace\Freeform\Bundles\Backup\Import\FormieV3\Fields\Processors\RecipientsProcessor;
use Solspace\Freeform\Bundles\Backup\Import\FormieV3\Fields\Processors\RepeaterProcessor;
use Solspace\Freeform\Bundles\Backup\Import\FormieV3\Fields\Processors\SectionProcessor;
use Solspace\Freeform\Bundles\Backup\Import\FormieV3\Fields\Processors\SignatureProcessor;
use Solspace\Freeform\Bundles\Backup\Import\FormieV3\Fields\Processors\SingleLineTextProcessor;
use Solspace\Freeform\Bundles\Backup\Import\FormieV3\Fields\Processors\SubmissionsProcessor;
use Solspace\Freeform\Bundles\Backup\Import\FormieV3\Fields\Processors\SummaryProcessor;
use Solspace\Freeform\Bundles\Backup\Import\FormieV3\Fields\Processors\TableProcessor;
use Solspace\Freeform\Bundles\Backup\Import\FormieV3\Fields\Processors\TagsProcessor;
use Solspace\Freeform\Bundles\Backup\Import\FormieV3\Fields\Processors\UsersProcessor;
use Solspace\Freeform\Bundles\Backup\Import\FormieV3\Fields\Processors\VariantsProcessor;

class FormieFieldMapper
{
    private array $processors;

    public function __construct()
    {
        $this->processors = [
            new SingleLineTextProcessor(),
            new MultiLineTextProcessor(),
            new EmailProcessor(),
            new NumberProcessor(),
            new CheckboxesProcessor(),
            new DropdownProcessor(),
            new RadioProcessor(),
            new CheckboxProcessor(),
            new FileUploadProcessor(),
            new DateProcessor(),
            new TableProcessor(),
            new HtmlProcessor(),
            new HiddenProcessor(),
            new AddressProcessor(),
            new AgreeProcessor(),
            new CalculationsProcessor(),
            new CategoriesProcessor(),
            new EntriesProcessor(),
            new FormsProcessor(),
            new GroupProcessor(),
            new HeadingProcessor(),
            new NameProcessor(),
            new PasswordProcessor(),
            new PaymentProcessor(),
            new PhoneProcessor(),
            new ProductsProcessor(),
            new RecipientsProcessor(),
            new RepeaterProcessor(),
            new SectionProcessor(),
            new SignatureProcessor(),
            new SubmissionsProcessor(),
            new SummaryProcessor(),
            new TagsProcessor(),
            new UsersProcessor(),
            new VariantsProcessor(),
        ];
    }

    public function mapField($formField, string $formUid, int $index): ?Field
    {
        $processor = $this->findProcessor($formField);

        if (!$processor) {
            return null; // Skip unsupported field types
        }

        return $processor->process($formField, $formUid, $index);
    }

    private function findProcessor($formField): ?FieldProcessorInterface
    {
        foreach ($this->processors as $processor) {
            if ($processor->canProcess($formField)) {
                return $processor;
            }
        }

        return null;
    }
}

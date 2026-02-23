<?php

namespace Solspace\Freeform\Bundles\Export;

use craft\base\ElementInterface;
use craft\db\Query;
use craft\elements\db\ElementQueryInterface;
use Solspace\Freeform\Bundles\Backup\DTO\Submission;
use Solspace\Freeform\Bundles\Export\Collections\FieldDescriptorCollection;
use Solspace\Freeform\Bundles\Export\Events\PrepareExportValueEvent;
use Solspace\Freeform\Bundles\Export\Objects\Column;
use Solspace\Freeform\Bundles\Export\Objects\FieldDescriptor;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Integrations\Single\UrlParameterTracking\Records\UrlTrackingParameterRecord;
use Solspace\Freeform\Library\DataObjects\ExportSettings;
use yii\base\Event;

abstract class AbstractSubmissionExport implements SubmissionExportInterface
{
    private const URL_TRACKING_DESCRIPTOR_ID = 'trackingParameters';

    private ?string $timezone;
    private ?FieldDescriptorCollection $resolvedFieldDescriptors = null;

    public function __construct(
        private Form $form,
        private ElementQueryInterface $query,
        private FieldDescriptorCollection $fieldDescriptors,
        private ?ExportSettings $settings = null,
    ) {
        if (null === $settings) {
            $this->settings = new ExportSettings();
        }

        $this->timezone = $this->settings->getTimezone();
    }

    public function getForm(): Form
    {
        return $this->form;
    }

    public function getFieldDescriptors(): FieldDescriptorCollection
    {
        if (null !== $this->resolvedFieldDescriptors) {
            return $this->resolvedFieldDescriptors;
        }

        $this->resolvedFieldDescriptors = new FieldDescriptorCollection($this->fieldDescriptors->all());

        if ($this->getSettings()->isExportTrackedUrlParameters()) {
            $id = self::URL_TRACKING_DESCRIPTOR_ID;
            if (!$this->resolvedFieldDescriptors->has($id)) {
                $this->resolvedFieldDescriptors->add(new FieldDescriptor($id, Freeform::t('URL Parameters')), $id);
            }
        }

        return $this->resolvedFieldDescriptors;
    }

    public function getSettings(): ExportSettings
    {
        return $this->settings;
    }

    public function getQuery(): ElementQueryInterface
    {
        return $this->query;
    }

    /**
     * @return Column[][][]|\Generator
     */
    public function getRowBatch(int $size = 100): \Generator
    {
        $query = $this->getQuery();

        /** @var Submission[] $elements */
        foreach ($query->batch($size) as $elements) {
            $rows = [];
            $trackingValuesBySubmission = $this->getTrackingValuesBySubmission($elements);

            /** @var ElementInterface $element */
            foreach ($elements as $element) {
                $index = 0;
                $columns = [];
                foreach ($this->getFieldDescriptors() as $descriptor) {
                    if (!$descriptor->isUsed()) {
                        continue;
                    }

                    $field = null;
                    if (self::URL_TRACKING_DESCRIPTOR_ID === $descriptor->getId()) {
                        $value = $trackingValuesBySubmission[$element->id] ?? [];
                    } else {
                        $value = $element->{$descriptor->getId()};
                        $field = $value instanceof FieldInterface ? $value : null;
                    }

                    if ($field) {
                        $value = $field->getValue();
                    }

                    $event = new PrepareExportValueEvent($this, $descriptor, $element, $field, $value);
                    Event::trigger($this, self::EVENT_PREPARE_EXPORT_VALUE, $event);

                    $columns[] = new Column(
                        $index++,
                        $descriptor,
                        $field,
                        $event->getValue(),
                    );
                }

                $rows[] = $columns;
            }

            yield $rows;
        }
    }

    private function getTrackingValuesBySubmission(array $elements): array
    {
        if (!$this->getSettings()->isExportTrackedUrlParameters()) {
            return [];
        }

        $submissionIds = [];
        foreach ($elements as $element) {
            if ($element->id) {
                $submissionIds[] = (int) $element->id;
            }
        }

        if (!$submissionIds) {
            return [];
        }

        $rows = (new Query())
            ->select(['submissionId', 'name', 'value'])
            ->from(UrlTrackingParameterRecord::TABLE)
            ->where(['submissionId' => array_values(array_unique($submissionIds))])
            ->orderBy(['name' => \SORT_ASC])
            ->all()
        ;

        $result = [];
        foreach ($rows as $row) {
            $result[(int) $row['submissionId']][$row['name']] = $row['value'];
        }

        return $result;
    }
}

<?php

namespace Solspace\Freeform\Elements\Actions;

use craft\base\ElementAction;
use craft\elements\db\ElementQueryInterface;
use craft\helpers\Json;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Fields\Pro\SignatureField;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\MultipleValueInterface;
use Solspace\Freeform\Library\Composer\Components\Fields\Interfaces\NoStorageInterface;
use Solspace\Freeform\Library\DataExport\ExportDataCSV;
use Solspace\Freeform\Library\Exceptions\FreeformException;

class ExportCSVAction extends ElementAction
{
    /**
     * @inheritdoc
     */
    public function getTriggerLabel(): string
    {
        return Freeform::t('Export to CSV');
    }

    /**
     * @inheritDoc
     */
    public function getTriggerHtml()
    {
        $type = Json::encode(static::class);

        $js = <<<EOT
(function()
{
	var trigger = new Craft.ElementActionTrigger({
		handle: 'Freeform_ExportCSV',
		batch: true,
		type: {$type},
		activate: function(\$selectedItems)
		{
		    var ids = [];
		    \$selectedItems.each(function() {
		        ids.push($(this).data("id"));
		    });
		    
			var form = $('<form method="post" target="_blank" action="">' +
			'<input type="hidden" name="action" value="freeform/submissions/export" />' +
			'<input type="hidden" name="submissionIds" value="' + ids.join(",") + '" />' +
			'<input type="hidden" name="{csrfName}" value="{csrfValue}" />' +
			'<input type="submit" value="Submit" />' +
			'</form>');
			
			form.appendTo('body');
			form.submit();
			form.remove();
		}
	});
})();
EOT;

        $js = str_replace(
            ['{csrfName}', '{csrfValue}'],
            array(\Craft::$app->config->general->csrfTokenName, \Craft::$app->request->getCsrfToken()),
            $js
        );

        \Craft::$app->view->registerJs($js);
    }

    /**
     * Performs the action on any elements that match the given criteria.
     *
     * @param ElementQueryInterface $query
     *
     * @return bool
     * @throws FreeformException
     */
    public function performAction(ElementQueryInterface $query): bool
    {
        /** @var Submission[] $submissions */
        $submissions = $query->all();

        $form = null;
        if ($submissions) {
            $formId = $submissions[0]['formId'];
            $form   = Freeform::getInstance()->forms->getFormById($formId);

            if (!$form) {
                throw new FreeformException(Freeform::t('Form with ID {id} not found', ['id' => $formId]));
            }
        } else {
            throw new FreeformException(Freeform::t('No submissions found'));
        }

        $csvData = [];
        $labels  = ['ID', 'Submission Date'];
        foreach ($submissions as $submission) {
            $rowData   = [];
            $rowData[] = $submission->id;
            $rowData[] = $submission->dateCreated->format('Y-m-d H:i:s');

            foreach ($form->getLayout()->getFields() as $field) {
                if ($field instanceof NoStorageInterface || $field instanceof SignatureField) {
                    continue;
                }

                if (empty($csvData)) {
                    $labels[] = $field->getLabel();
                }

                $columnName = Submission::getFieldColumnName($field->getId());

                $value = $submission->$columnName->getValue();
                if ($field instanceof MultipleValueInterface) {
                    if (is_array($value)) {
                        $value = implode(', ', $value);
                    }
                }

                $rowData[] = $value;
            }

            $csvData[] = $rowData;
        }
        unset($submissions);

        array_unshift($csvData, $labels);

        $fileName = sprintf('%s submissions %s.csv', $form->name, date('Y-m-d H:i', time()));

        $export = new ExportDataCSV('browser', $fileName);
        $export->initialize();

        foreach ($csvData as $csv) {
            $export->addRow($csv);
        }

        $export->finalize();
        exit();
    }
}

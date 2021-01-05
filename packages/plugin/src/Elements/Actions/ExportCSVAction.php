<?php

namespace Solspace\Freeform\Elements\Actions;

use craft\base\ElementAction;
use craft\elements\db\ElementQueryInterface;
use craft\helpers\Json;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Exceptions\FreeformException;
use Solspace\Freeform\Library\Export\ExportCsv;

class ExportCSVAction extends ElementAction
{
    /**
     * {@inheritdoc}
     */
    public function getTriggerLabel(): string
    {
        return Freeform::t('Export to CSV');
    }

    /**
     * {@inheritDoc}
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
            [\Craft::$app->config->general->csrfTokenName, \Craft::$app->request->getCsrfToken()],
            $js
        );

        \Craft::$app->view->registerJs($js);
    }

    /**
     * Performs the action on any elements that match the given criteria.
     *
     * @throws FreeformException
     */
    public function performAction(ElementQueryInterface $query): bool
    {
        /** @var Submission[] $submissions */
        $submissions = $query->all();

        $form = null;
        if ($submissions) {
            $formId = $submissions[0]['formId'];
            $form = Freeform::getInstance()->forms->getFormById($formId);

            if (!$form) {
                throw new FreeformException(Freeform::t('Form with ID {id} not found', ['id' => $formId]));
            }

            $dataReorder = [];
            foreach ($submissions as $submission) {
                $fieldData = [];
                $reordered = [];
                foreach ($submission as $key => $value) {
                    if (preg_match('/^'.Submission::FIELD_COLUMN_PREFIX.'\d+$/', $key)) {
                        $fieldData[$key] = $value;
                    } else {
                        $reordered[$key] = $value;
                    }
                }

                foreach ($form->getForm()->getLayout()->getFields() as $field) {
                    if (!$field->getId()) {
                        continue;
                    }

                    $columnName = Submission::getFieldColumnName($field->getId());
                    if ($field->getId() && isset($fieldData[$columnName])) {
                        $reordered[$columnName] = $fieldData[$columnName];
                    }
                }

                $dataReorder[] = $reordered;
            }

            $submissions = $dataReorder;
        } else {
            throw new FreeformException(Freeform::t('No submissions found'));
        }

        $exporter = new ExportCsv($form->getForm(), $submissions, Freeform::getInstance()->settings->isRemoveNewlines());
        $fileName = sprintf('%s submissions %s.csv', $form->name, date('Y-m-d H:i'));

        Freeform::getInstance()->exportProfiles->outputFile($exporter->export(), $fileName, $exporter->getMimeType());
    }
}

<?php

namespace Solspace\Freeform\Elements\Actions;

use craft\base\ElementAction;
use craft\elements\db\ElementQueryInterface;
use craft\helpers\Json;
use Solspace\Freeform\Bundles\Export\Collections\FieldDescriptorCollection;
use Solspace\Freeform\Bundles\Export\Implementations\Csv\ExportCsv;
use Solspace\Freeform\Bundles\Export\Objects\FieldDescriptor;
use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Exceptions\FreeformException;
use Solspace\Freeform\Resources\Bundles\SubmissionIndexBundle;
use yii\web\BadRequestHttpException;

class ExportCSVAction extends ElementAction
{
    public function getTriggerLabel(): string
    {
        return Freeform::t('Export to CSV');
    }

    public function getTriggerHtml(): ?string
    {
        $type = Json::encode(static::class);
        \Craft::$app->view->registerAssetBundle(SubmissionIndexBundle::class);
        \Craft::$app->view->registerTranslations('freeform', ['Could not export submissions. Please try again.']);

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

                        window.freeform_export_csv(ids);
            		}
            	});
            })();
            EOT;

        \Craft::$app->view->registerJs($js);

        return null;
    }

    public function performAction(ElementQueryInterface $query): bool
    {
        $exportProfilesService = Freeform::getInstance()->exportProfiles;

        try {
            $submission = $exportProfilesService->getSubmissionForExport($query);
        } catch (BadRequestHttpException|FreeformException $exception) {
            $this->setMessage($exception->getMessage());

            return false;
        }

        $descriptors = new FieldDescriptorCollection();

        $form = $submission->getForm();
        foreach ($submission as $key => $value) {
            if (!$value instanceof FieldInterface) {
                $descriptors->add(new FieldDescriptor($key, ucfirst($key)));
            }
        }

        foreach ($form->getLayout()->getFields()->getStorableFields() as $field) {
            $descriptors->add(new FieldDescriptor($field->getId(), $field->getLabel()));
        }

        $exporter = new ExportCsv(
            $form,
            $query,
            $descriptors,
            $exportProfilesService->getExportSettings(),
        );

        $fileName = \sprintf('%s submissions %s.csv', $form->name, date('Y-m-d H:i'));

        Freeform::getInstance()->exportProfiles->outputFile($exporter->export(), $fileName, $exporter->getMimeType());

        return true;
    }
}

<?php

namespace Solspace\Freeform\Bundles\Backup\Export\FormieV3;

use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Bundles\Backup\Collections\FormCollection;
use Solspace\Freeform\Bundles\Backup\Collections\PageCollection;
use Solspace\Freeform\Bundles\Backup\DTO\Form;
use Solspace\Freeform\Bundles\Backup\Export\FormieV3\Fields\FormieFieldMapper;
use Solspace\Freeform\Bundles\Backup\Export\FormieV3\Layout\FormieLayoutBuilder;
use Solspace\Freeform\Bundles\Backup\Export\FormieV3\Notifications\FormieNotificationProcessor;
use Solspace\Freeform\Form\Settings\Implementations\ValueGenerators\RandomColorGenerator;
use Solspace\Freeform\Form\Settings\Settings as FormSettings;
use Solspace\Freeform\Freeform;
use verbb\formie\elements\Form as FormieForm;

class FormProcessor
{
    private FormieFieldMapper $fieldMapper;
    private FormieLayoutBuilder $layoutBuilder;
    private FormieNotificationProcessor $notificationProcessor;

    public function __construct(private PropertyProvider $propertyProvider)
    {
        $this->fieldMapper = new FormieFieldMapper();
        $this->layoutBuilder = new FormieLayoutBuilder($this->fieldMapper);
        $this->notificationProcessor = new FormieNotificationProcessor();
    }

    public function collectForms(?array $ids = null): FormCollection
    {
        $colorGenerator = new RandomColorGenerator();
        $collection = new FormCollection();

        try {
            $forms = FormieForm::find()
                ->where(null !== $ids ? ['uid' => $ids] : null)
                ->all()
            ;

            $defaultStatus = Freeform::getInstance()->statuses->getDefaultStatusId();

            foreach ($forms as $index => $form) {
                try {
                    $exported = new Form();
                    $exported->uid = $form->uid;
                    $exported->name = $form->title ?? 'Untitled '.$form->id;
                    $exported->handle = $form->handle ?? 'untitled-'.$form->id;
                    $exported->order = $form->sortOrder ?? $index;

                    $exported->settings = new FormSettings([], $this->propertyProvider);

                    $this->configureFormSettings($exported, $form, $colorGenerator, $defaultStatus);
                    $exported->notifications = $this->notificationProcessor->processNotifications($form, $exported->uid);
                    $exported->pages = new PageCollection();

                    $this->layoutBuilder->buildFormLayout($form, $exported);

                    $collection->add($exported);
                } catch (\Throwable $formException) {
                    // Continue so one broken Formie form doesn't hide the rest
                    continue;
                }
            }
        } catch (\Throwable $e) {
            return new FormCollection();
        }

        return $collection;
    }

    private function configureFormSettings(Form $exported, FormieForm $form, RandomColorGenerator $colorGenerator, int $defaultStatus): void
    {
        $general = $exported->settings->getGeneral();
        $general->name = $exported->name;
        $general->handle = $exported->handle;
        $general->description = $form->description ?? '';
        $general->submissionTitle = '{{ dateCreated|date("Y-m-d H:i:s") }}';
        $general->color = $form->color ?? $colorGenerator->generateValue($form, null);
        $general->defaultStatus = $defaultStatus;
        $general->storeData = true;
        $general->formattingTemplate = 'flexbox/index.twig';

        $behavior = $exported->settings->getBehavior();
        $behavior->ajax = 'ajax' === ($form->settings->submitMethod ?? 'page');
        $behavior->showProcessingSpinner = true;
        $behavior->showProcessingText = true;
        $behavior->returnUrl = $form->settings->submitActionUrl ?? '';
        $behavior->successBehavior = 'reload';
        $behavior->successMessage = 'Form submitted successfully!';
        $behavior->errorMessage = 'There was an error submitting the form.';
    }
}

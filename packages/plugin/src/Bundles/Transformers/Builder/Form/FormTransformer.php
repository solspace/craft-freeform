<?php

namespace Solspace\Freeform\Bundles\Transformers\Builder\Form;

use Carbon\Carbon;
use Solspace\Freeform\Events\Forms\GenerateLinksEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Services\ChartsService;
use Solspace\Freeform\Services\Form\FieldsService;
use Solspace\Freeform\Services\Form\LayoutsService;
use Solspace\Freeform\Services\SubmissionsService;
use yii\base\Event;

class FormTransformer
{
    public const EVENT_ATTACH_LINKS = 'attach-links';

    public function __construct(
        private FieldsService $fieldsService,
        private LayoutsService $layoutsService,
        private FieldTransformer $fieldTransformer,
        private LayoutTransformer $layoutTransformer,
        private ChartsService $chartsService,
        private SubmissionsService $submissionsService,
    ) {}

    public function transformList(array $forms): array
    {
        $transformed = array_map(
            [$this, 'transformBasic'],
            $forms
        );

        $transformed = $this->decorateWithSubmissionStatistics($transformed);

        return $this->attachLinks($forms, $transformed);
    }

    public function transform(Form $form): object
    {
        $fields = $this->fieldsService->getFields($form);

        $transformed = $this->transformBasic($form);
        $transformed->layout = (object) [
            'fields' => array_map([$this->fieldTransformer, 'transform'], $fields),
            'pages' => array_map(
                [$this->layoutTransformer, 'transformPage'],
                $this->layoutsService->getPages($form),
            ),
            'layouts' => array_map(
                [$this->layoutTransformer, 'transformLayout'],
                $this->layoutsService->getLayouts($form)
            ),
            'rows' => array_map(
                [$this->layoutTransformer, 'transformRow'],
                $this->layoutsService->getRows($form)
            ),
        ];

        return $transformed;
    }

    private function transformBasic(Form $form): object
    {
        $typeClass = $form::class;
        $settings = $form->getSettings();

        // Only forms made in the last hour are considered new
        $isNew = $form->getDateCreated()->greaterThanOrEqualTo(Carbon::now()->subHour());

        return (object) [
            'id' => $form->getId(),
            'uid' => $form->getUid(),
            'type' => $typeClass,
            'name' => $settings->name,
            'handle' => $settings->handle,
            'settings' => $settings->toArray(),
            'isNew' => $isNew,
        ];
    }

    private function decorateWithSubmissionStatistics(array $forms): array
    {
        $formIds = array_map(fn ($form) => $form->id, $forms);

        $chartData = $this->chartsService->getMinimalSubmissionChartData($formIds);
        $submissions = $this->submissionsService->getSubmissionCountByForm();
        $spamSubmissions = $this->submissionsService->getSubmissionCountByForm(true);

        foreach ($forms as $form) {
            $form->chartData = $chartData[$form->id] ?? [];
            $form->counters = [
                'submissions' => $submissions[$form->id] ?? 0,
                'spam' => $spamSubmissions[$form->id] ?? 0,
            ];
        }

        return $forms;
    }

    private function attachLinks(array $forms, array $transformed): array
    {
        foreach ($transformed as $data) {
            $form = array_filter($forms, fn (Form $form) => $form->getId() === $data->id);
            $form = reset($form) ?? new \stdClass();

            $event = new GenerateLinksEvent($form, $data);
            Event::trigger($this, self::EVENT_ATTACH_LINKS, $event);

            $data->links = $event->getLinks();
        }

        return $transformed;
    }
}

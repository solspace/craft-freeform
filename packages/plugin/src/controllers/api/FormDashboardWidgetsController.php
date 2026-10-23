<?php

namespace Solspace\Freeform\controllers\api;

use craft\helpers\StringHelper;
use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Services\FormDashboardWidgetsService;
use Solspace\Freeform\Widgets\QuickFormWidget;
use yii\web\BadRequestHttpException;
use yii\web\Response;

class FormDashboardWidgetsController extends BaseApiController
{
    public function beforeAction($action): bool
    {
        if (!parent::beforeAction($action)) {
            return false;
        }
        $this->requireCpRequest();
        $this->service()->requireAccess($this->siteId());
        $this->response->getHeaders()->set('Cache-Control', 'no-store, private');

        return true;
    }

    public function actionList(): Response
    {
        $siteId = $this->siteId();
        $items = [];
        foreach ($this->service()->getItems($siteId) as $item) {
            try {
                $widget = $this->service()->createWidget($siteId, $item);
                $items[] = array_diff_key($item, ['settings' => true]) + ['title' => $widget->getTitle()];
            } catch (\Throwable) {
                // Settings remain stored if access is temporarily lost.
            }
        }

        return $this->asJson(['items' => $items, 'types' => array_map(static fn ($type, $class) => ['type' => $type, 'name' => $class::displayName()], array_keys(FormDashboardWidgetsService::TYPES), array_values(FormDashboardWidgetsService::TYPES))]);
    }

    public function actionLayout(): Response
    {
        $this->requirePostRequest();
        $placements = $this->request->getBodyParam('placements');
        if (!\is_array($placements) || \count($placements) > 30 || array_filter($placements, static fn ($value) => !\is_array($value))) {
            throw new BadRequestHttpException('Invalid widget layout.');
        }
        $this->service()->updateLayout($this->siteId(), $placements);

        return $this->asJson(['success' => true]);
    }

    public function actionRemove(): Response
    {
        $this->requirePostRequest();
        $uid = $this->request->getRequiredBodyParam('uid');
        if (!\is_string($uid)) {
            throw new BadRequestHttpException('Invalid widget.');
        }
        $this->service()->remove($this->siteId(), $uid);

        return $this->asJson(['success' => true]);
    }

    public function actionBody(string $uid): Response
    {
        $item = $this->service()->getItem($this->siteId(), $uid);
        $widget = $this->service()->createWidget($this->siteId(), $item);

        return $this->renderTemplate('freeform/_widgets/form-card/body', ['title' => $widget->getTitle(), 'html' => $widget->getBodyHtml()]);
    }

    public function actionEditor(): Response
    {
        $service = $this->service();
        $siteId = $this->siteId();
        $uid = (string) $this->request->getParam('uid', '');
        $item = $uid ? $service->getItem($siteId, $uid) : [
            'uid' => StringHelper::UUID(),
            'type' => $this->request->getParam('type'),
            'settings' => ['formIds' => '*'],
            'size' => '2x2',
            'groupUid' => null,
            'beforeId' => null,
        ];
        $error = null;
        if ($this->request->getIsPost()) {
            $settings = $this->request->getBodyParam('settings', []);
            if (!\is_array($settings)) {
                throw new BadRequestHttpException('Invalid widget settings.');
            }
            $item['settings'] = $settings;
            $item['revision'] = bin2hex(random_bytes(8));
            $item['groupUid'] = $this->request->getBodyParam('groupUid') ?: null;

            try {
                $service->save($siteId, $item);

                return $this->renderTemplate('freeform/_widgets/form-card/saved', ['title' => Freeform::t('Widget saved'), 'uid' => $item['uid']]);
            } catch (BadRequestHttpException $exception) {
                $error = $exception->getMessage();
            }
        }
        $widget = $service->createWidget($siteId, $item);
        if (!$widget instanceof QuickFormWidget && ($item['settings']['formIds'] ?? null) === '*') {
            $widget->formIds = '*';
        }
        $formOptions = array_map(static fn ($form) => $form->getName(), $service->getForms($siteId, $item['type']));
        $template = match ($item['type']) {
            'linear' => 'linear-charts',
            'radial' => 'radial-charts',
            'recent' => 'recent',
            'quick-form' => 'quick-form',
        };
        $context = ['settings' => $widget, 'formOptions' => $formOptions, 'formList' => $formOptions, 'dateRangeOptions' => Freeform::getInstance()->widgets->getDateRanges(), 'chartTypes' => $item['type'] === 'linear' ? ['line' => Freeform::t('Line'), 'bar' => Freeform::t('Bar')] : ['doughnut' => Freeform::t('Donut'), 'pie' => Freeform::t('Pie'), 'polarArea' => Freeform::t('Polar Area')]];
        $settingsHtml = $this->getView()->namespaceInputs(fn () => $this->getView()->renderTemplate('freeform/_widgets/'.$template.'/settings', $context), 'settings');
        $groups = ['' => Freeform::t('Other')];
        foreach ($service->getGroups($siteId) as $group) {
            $groups[$group->uid] = $group->label;
        }

        return $this->renderTemplate('freeform/_widgets/form-card/editor', ['title' => $widget::displayName(), 'settingsHtml' => $settingsHtml, 'error' => $error, 'siteId' => $siteId, 'uid' => $uid, 'type' => $item['type'], 'groups' => $groups, 'groupUid' => $item['groupUid']]);
    }

    private function siteId(): int
    {
        $id = filter_var($this->request->getParam('siteId'), \FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
        if (!$id) {
            throw new BadRequestHttpException('Invalid site.');
        }

        return $id;
    }

    private function service(): FormDashboardWidgetsService
    {
        return \Craft::$container->get(FormDashboardWidgetsService::class);
    }
}

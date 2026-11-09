<?php

/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2026, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Widgets\Pro;

use craft\helpers\UrlHelper;
use Solspace\Freeform\Elements\Submission;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Widgets\AbstractWidget;
use Solspace\Freeform\Widgets\ExtraWidgetInterface;
use yii\web\ForbiddenHttpException;

class RecentWidget extends AbstractWidget implements ExtraWidgetInterface
{
    public const DEFAULT_LIMIT = 5;
    public const BROWSE_LIMIT = 100;

    public ?string $title = null;

    public array|string|null $formIds = null;

    public ?int $limit = null;

    public bool $showFilters = true;

    public bool $showPagination = true;

    private ?int $formFilter = null;

    public function getFormFilterOptions(): array
    {
        $service = $this->getFormService();
        $allowed = array_flip($service->getAllowedReadFormIds());
        $configured = '*' === $this->formIds ? $allowed : array_flip((array) $this->formIds);

        return array_intersect_key($service->getAllFormNames(orderByName: true), $allowed, $configured);
    }

    public function setFormFilter(?int $formId): void
    {
        if (null !== $formId && (!$this->showFilters || !\array_key_exists($formId, $this->getFormFilterOptions()))) {
            throw new ForbiddenHttpException('Form is not available in this widget.');
        }

        $this->formFilter = $formId;
    }

    public static function displayName(): string
    {
        return Freeform::getInstance()->name.' '.Freeform::t('Recent');
    }

    public static function icon(): string
    {
        return '@freeform/icon-mask.svg';
    }

    public function init(): void
    {
        parent::init();

        if (null === $this->title) {
            $this->title = self::displayName();
        }

        if (null === $this->formIds) {
            $this->formIds = [];
        }

        if (null === $this->limit) {
            $this->limit = self::DEFAULT_LIMIT;
        }
    }

    public function rules(): array
    {
        return [
            [['formIds'], 'required'],
            [['limit'], 'integer', 'min' => 1, 'max' => self::BROWSE_LIMIT],
            [['showFilters', 'showPagination'], 'boolean'],
        ];
    }

    public function getBodyHtml(): string
    {
        if (!Freeform::getInstance()->isPro()) {
            return Freeform::t(
                "Requires <a href='{link}'>Pro</a> edition",
                ['link' => UrlHelper::cpUrl('plugin-store/freeform')]
            );
        }

        $formOptions = $this->getFormFilterOptions();
        $formIdList = null !== $this->formFilter ? [$this->formFilter] : array_keys($formOptions);

        $pageSize = max(1, min(self::BROWSE_LIMIT, (int) $this->limit));

        $submissions = $formIdList ? Submission::find()
            ->formId($formIdList)
            ->orderBy(['dateCreated' => \SORT_DESC, 'id' => \SORT_DESC])
            ->limit($this->showFilters || $this->showPagination ? self::BROWSE_LIMIT : $pageSize)
            ->all() : [];

        return \Craft::$app->view->renderTemplate(
            'freeform/_widgets/recent/body',
            [
                'submissions' => $submissions,
                'settings' => $this,
                'widgetId' => $this->id,
                'pageSize' => $pageSize,
                'formFilterOptions' => $formOptions,
                'selectedFormId' => $this->formFilter,
                'formNames' => $this->getFormService()->getAllFormNames(),
            ]
        );
    }

    public function getSettingsHtml(): string
    {
        return \Craft::$app->view->renderTemplate(
            'freeform/_widgets/recent/settings',
            [
                'settings' => $this,
                'formOptions' => $this->getFormService()->getAllFormNames(orderByName: true),
            ]
        );
    }
}

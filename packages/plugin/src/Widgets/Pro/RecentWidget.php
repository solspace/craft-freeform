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

class RecentWidget extends AbstractWidget implements ExtraWidgetInterface
{
    public const DEFAULT_LIMIT = 5;
    public const BROWSE_LIMIT = 100;

    public ?string $title = null;

    public array|string|null $formIds = null;

    public ?int $limit = null;

    public bool $showFilters = true;

    public bool $showPagination = true;

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

        $formIdList = $this->formIds;
        if ('*' === $formIdList) {
            $formIdList = $this->getFormService()->getAllFormIds();
        }

        $pageSize = max(1, min(self::BROWSE_LIMIT, (int) $this->limit));

        $submissions = Submission::find()
            ->formId($formIdList)
            ->orderBy(['id' => \SORT_DESC])
            ->limit($this->showFilters || $this->showPagination ? self::BROWSE_LIMIT : $pageSize)
            ->all()
        ;

        return \Craft::$app->view->renderTemplate(
            'freeform/_widgets/recent/body',
            [
                'submissions' => $submissions,
                'settings' => $this,
                'widgetId' => $this->id,
                'pageSize' => $pageSize,
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

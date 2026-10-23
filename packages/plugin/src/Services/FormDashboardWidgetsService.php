<?php

namespace Solspace\Freeform\Services;

use craft\base\Widget;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\FormCardHelper;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Library\Helpers\SitesHelper;
use Solspace\Freeform\Records\FormGroupsRecord;
use Solspace\Freeform\Widgets\Pro\LinearChartsWidget;
use Solspace\Freeform\Widgets\Pro\RadialChartsWidget;
use Solspace\Freeform\Widgets\Pro\RecentWidget;
use Solspace\Freeform\Widgets\QuickFormWidget;
use yii\web\BadRequestHttpException;
use yii\web\ForbiddenHttpException;
use yii\web\NotFoundHttpException;

/** Personal copies of Freeform widgets, independent of Craft's dashboard records. */
class FormDashboardWidgetsService
{
    public const TYPES = [
        'linear' => LinearChartsWidget::class,
        'radial' => RadialChartsWidget::class,
        'recent' => RecentWidget::class,
        'quick-form' => QuickFormWidget::class,
    ];

    private const EXTRA_SIZES = [
        '3x2' => ['linear', 'recent'],
        '3x3' => ['linear', 'recent', 'radial', 'quick-form'],
        '2x3' => ['quick-form', 'recent', 'radial'],
    ];

    public function requireAccess(int $siteId): void
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_FORMS_ACCESS);
        if (!Freeform::getInstance()->isPro() || !\in_array($siteId, SitesHelper::getEditableSiteIds(), true)) {
            throw new ForbiddenHttpException('Widgets are not available for this site.');
        }
    }

    public function getItems(int $siteId): array
    {
        $items = \Craft::$app->getUser()->getIdentity()->getPreference($this->key($siteId));

        return \is_array($items) ? array_values($items) : [];
    }

    public function getItem(int $siteId, string $uid): array
    {
        foreach ($this->getItems($siteId) as $item) {
            if ($item['uid'] === $uid) {
                return $item;
            }
        }

        throw new NotFoundHttpException('Widget not found.');
    }

    public function getForms(int $siteId, string $type): array
    {
        $site = \Craft::$app->getSites()->getSiteById($siteId);
        $forms = Freeform::getInstance()->forms->getAllNonArchivedForms(orderByName: true, sites: SitesHelper::isEnabled() ? $site->handle : null);

        return array_filter($forms, static function ($form) use ($type) {
            $permissions = $type === 'quick-form'
                ? [Freeform::PERMISSION_FORMS_MANAGE, Freeform::PERMISSION_SUBMISSIONS_MANAGE]
                : [Freeform::PERMISSION_SUBMISSIONS_MANAGE];
            foreach ($permissions as $permission) {
                if (PermissionHelper::checkPermission($permission) || PermissionHelper::checkPermission(PermissionHelper::prepareNestedPermission($permission, $form->getId()))) {
                    return true;
                }
            }

            return false;
        });
    }

    public function createWidget(int $siteId, array $item): Widget
    {
        $class = self::TYPES[$item['type']] ?? null;
        if (!$class) {
            throw new BadRequestHttpException('Unknown widget type.');
        }
        $widget = new $class();
        // Only widget settings may be hydrated; never accept a class name or model properties.
        $widget->setAttributes(array_intersect_key($item['settings'] ?? [], array_flip($widget->settingsAttributes())), false);
        $widget->id = -((int) hexdec(substr(hash('sha256', $siteId.'.'.($item['uid'] ?? 'new')), 0, 7)) + 1);
        $allowed = array_map(static fn ($form) => $form->getId(), $this->getForms($siteId, $item['type']));
        if ($widget instanceof QuickFormWidget) {
            if ($widget->formId && !\in_array($widget->formId, $allowed, true)) {
                throw new ForbiddenHttpException('The selected form is no longer available.');
            }
        } else {
            $selected = $widget->formIds === '*' ? $allowed : array_map('intval', (array) $widget->formIds);
            if (array_diff($selected, $allowed)) {
                throw new ForbiddenHttpException('The selected forms are no longer available.');
            }
            $widget->formIds = array_values($selected);
        }

        return $widget;
    }

    public function getGroups(int $siteId): array
    {
        return FormGroupsRecord::find()->where(['siteId' => $siteId])->orderBy(['order' => \SORT_ASC])->all();
    }

    public function save(int $siteId, array $item): array
    {
        $this->validatePlacement($siteId, $item);
        $widget = $this->createWidget($siteId, $item);
        if (!$widget->validate()) {
            throw new BadRequestHttpException(implode(' ', $widget->getFirstErrors()));
        }

        return $this->mutate($siteId, static function ($items) use ($item) {
            $found = false;
            foreach ($items as &$existing) {
                if ($existing['uid'] === $item['uid']) {
                    $existing = $item;
                    $found = true;

                    break;
                }
            }
            unset($existing);
            if (!$found) {
                if (\count($items) >= 30) {
                    throw new BadRequestHttpException('A maximum of 30 widgets can be added.');
                }
                $items[] = $item;
            }

            return $items;
        });
    }

    public function updateLayout(int $siteId, array $placements): array
    {
        return $this->mutate($siteId, function ($items) use ($siteId, $placements) {
            $byUid = array_column($items, null, 'uid');
            $ordered = [];
            foreach ($placements as $placement) {
                $uid = $placement['uid'] ?? '';
                if (!isset($byUid[$uid]) || isset($ordered[$uid])) {
                    throw new BadRequestHttpException('Widget not found in this layout.');
                }
                $updated = array_replace($byUid[$uid], array_intersect_key($placement, array_flip(['size', 'groupUid', 'beforeId'])));
                $this->validatePlacement($siteId, $updated);
                $ordered[$uid] = $updated;
            }

            // A stale tab must not erase widgets added elsewhere.
            return array_values($ordered + $byUid);
        });
    }

    public function remove(int $siteId, string $uid): array
    {
        $this->getItem($siteId, $uid);

        return $this->mutate($siteId, static fn ($items) => array_values(array_filter($items, static fn ($item) => $item['uid'] !== $uid)));
    }

    public function findWidgetById(int $id): ?Widget
    {
        foreach (SitesHelper::getEditableSiteIds() as $siteId) {
            foreach ($this->getItems($siteId) as $item) {
                if (-((int) hexdec(substr(hash('sha256', $siteId.'.'.$item['uid']), 0, 7)) + 1) === $id) {
                    $widget = $this->createWidget($siteId, $item);
                    $this->requireAccess($siteId);

                    return $widget;
                }
            }
        }

        return null;
    }

    private function validatePlacement(int $siteId, array $item): void
    {
        $size = $item['size'] ?? '';
        if (!\is_string($size)) {
            throw new BadRequestHttpException('Invalid widget size.');
        }
        $extraSizeAllowed = \in_array($item['type'] ?? '', self::EXTRA_SIZES[$size] ?? [], true);
        if (!\in_array($size, FormCardHelper::SIZES, true) && !$extraSizeAllowed) {
            throw new BadRequestHttpException('Invalid widget size.');
        }
        $groups = array_map(static fn ($group) => $group->uid, $this->getGroups($siteId));
        if (($item['groupUid'] ?? null) !== null && !\in_array($item['groupUid'], $groups, true)) {
            throw new BadRequestHttpException('The selected group is no longer available.');
        }
        if (($item['beforeId'] ?? null) !== null && (!\is_int($item['beforeId']) || $item['beforeId'] < 1)) {
            throw new BadRequestHttpException('Invalid widget position.');
        }
    }

    private function mutate(int $siteId, callable $callback): array
    {
        $mutex = \Craft::$app->getMutex();
        $lock = $this->key($siteId).'.'.\Craft::$app->getUser()->getId();
        if (!$mutex->acquire($lock, 5)) {
            throw new BadRequestHttpException('The layout is being saved. Please try again.');
        }

        try {
            $items = $callback($this->getItems($siteId));
            \Craft::$app->getUsers()->saveUserPreferences(\Craft::$app->getUser()->getIdentity(), [$this->key($siteId) => $items]);

            return $items;
        } finally {
            $mutex->release($lock);
        }
    }

    private function key(int $siteId): string
    {
        return 'freeform.dashboardWidgets.'.$siteId;
    }
}

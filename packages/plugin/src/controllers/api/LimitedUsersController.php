<?php

namespace Solspace\Freeform\controllers\api;

use Solspace\Freeform\Bundles\Form\Limiting\LimitedUsers\LimitedUsersDefaults;
use Solspace\Freeform\Bundles\Form\Limiting\LimitedUsers\LimitedUsersProvider;
use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Records\LimitedUsersRecord;
use yii\web\NotFoundHttpException;
use yii\web\Response;

class LimitedUsersController extends BaseApiController
{
    public function __construct(
        $id,
        $module,
        $config,
        private LimitedUsersDefaults $limitedUsersDefaults,
        private LimitedUsersProvider $limitedUsersProvider,
    ) {
        PermissionHelper::checkPermission(Freeform::PERMISSION_SETTINGS_ACCESS);

        parent::__construct($id, $module, $config);
    }

    public function actionDelete(int $id): Response
    {
        $record = LimitedUsersRecord::findOne(['id' => $id]);
        if (!$record) {
            throw new NotFoundHttpException('Limited Users set not found');
        }

        $record->delete();

        return $this->asEmptyResponse(204);
    }

    protected function get(): array|object
    {
        $records = LimitedUsersRecord::find()->all();

        return array_map(
            fn (LimitedUsersRecord $record) => [
                'id' => $record->id,
                'name' => $record->name,
                'description' => $record->description,
            ],
            $records
        );
    }

    protected function getOne(int|string $id): null|array|object
    {
        if ('new' === $id) {
            $record = new LimitedUsersRecord();
            $record->name = 'Limited Users';
            $record->description = '';
            $record->settings = '[]';
        } else {
            $record = LimitedUsersRecord::findOne(['id' => $id]);
        }

        if (!$record) {
            throw new NotFoundHttpException('Limited Users set not found');
        }

        $settings = json_decode($record->settings, true);

        $defaults = $this->limitedUsersDefaults->get();

        $items = $this->limitedUsersProvider->applySettings($defaults, $settings);

        return [
            'id' => $record->id,
            'name' => $record->name,
            'description' => $record->description,
            'items' => $items,
        ];
    }

    protected function post(null|int|string $id = null): null|array|object
    {
        if ('new' === $id) {
            $record = new LimitedUsersRecord();
        } else {
            $record = LimitedUsersRecord::findOne(['id' => $id]);
        }

        if (!$record) {
            throw new NotFoundHttpException('Limited Users set not found');
        }

        $items = $this->request->post('items');
        $name = $this->request->post('name', 'Limited Functionality');
        $description = $this->request->post('description', '');

        $data = $this->limitedUsersProvider->compileSettings($items);

        $record->settings = json_encode($data);
        $record->name = $name;
        $record->description = $description;
        $record->save();

        return [
            'id' => $record->id,
        ];
    }
}

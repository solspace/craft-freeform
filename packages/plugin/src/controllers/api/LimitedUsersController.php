<?php

namespace Solspace\Freeform\controllers\api;

use Solspace\Freeform\Bundles\Form\Limiting\LimitedUsers\LimitedUsersDefaults;
use Solspace\Freeform\Bundles\Form\Limiting\LimitedUsers\LimitedUsersProvider;
use Solspace\Freeform\controllers\BaseApiController;
use Solspace\Freeform\Records\LimitedUsersRecord;
use yii\web\NotFoundHttpException;

class LimitedUsersController extends BaseApiController
{
    public function __construct(
        $id,
        $module,
        $config,
        private LimitedUsersDefaults $limitedUsersDefaults,
        private LimitedUsersProvider $limitedUsersProvider,
    ) {
        parent::__construct($id, $module, $config);
    }

    protected function get(): array|object
    {
        $records = LimitedUsersRecord::find()->all();

        return array_map(
            fn (LimitedUsersRecord $record) => [
                'id' => $record->id,
                'name' => $record->name,
            ],
            $records
        );
    }

    protected function getOne(int|string $id): null|array|object
    {
        $record = LimitedUsersRecord::findOne(['id' => $id]);
        if (!$record) {
            throw new NotFoundHttpException('Limited Users set not found');
        }

        $settings = json_decode($record->settings, true);

        $defaults = $this->limitedUsersDefaults->get();

        $items = $this->limitedUsersProvider->applySettings($defaults, $settings);

        return [
            'id' => $record->id,
            'name' => $record->name,
            'items' => $items,
        ];
    }

    protected function post(null|int|string $id = null): null|array|object
    {
        $record = LimitedUsersRecord::findOne(['id' => $id]);
        if (!$record) {
            throw new NotFoundHttpException('Limited Users set not found');
        }

        $items = $this->request->post('items');
        $name = $this->request->post('name', 'Limited Functionality');

        $data = $this->limitedUsersProvider->compileSettings($items);

        $record->settings = json_encode($data);
        $record->name = $name;
        $record->save();

        return null;
    }
}

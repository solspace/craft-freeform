<?php

namespace Solspace\Freeform\controllers\api;

use craft\elements\Asset;
use Solspace\Freeform\controllers\BaseApiController;

class AssetsController extends BaseApiController
{
    protected function get(): array
    {
        $ids = $this->request->get('ids');
        if ($ids) {
            $ids = explode(',', $ids);
        }

        $service = \Craft::$app->getAssets();
        $assets = Asset::find()->id($ids)->all();

        return array_map(
            fn (Asset $asset) => [
                'id' => $asset->id,
                'uid' => $asset->uid,
                'title' => $asset->title,
                'filename' => $asset->filename,
                'url' => $asset->getUrl(),
                'editUrl' => $asset->getCpEditUrl(),
                'thumbUrl' => $service->getThumbUrl($asset, 30, 20),
                'size' => $asset->size,
                'kind' => $asset->kind,
                'dateModified' => $asset->dateModified?->format('c'),
            ],
            $assets
        );
    }
}

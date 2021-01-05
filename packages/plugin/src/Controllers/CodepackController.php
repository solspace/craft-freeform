<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2021, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Controllers;

use Solspace\Commons\Helpers\PermissionHelper;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Codepack\CodePack;
use Solspace\Freeform\Library\Codepack\Exceptions\CodepackException;
use Solspace\Freeform\Library\Codepack\Exceptions\FileObject\FileObjectException;
use Solspace\Freeform\Library\Codepack\Exceptions\Manifest\ManifestNotPresentException;
use Solspace\Freeform\Resources\Bundles\CodepackBundle;
use yii\base\InvalidParamException;
use yii\web\BadRequestHttpException;
use yii\web\ForbiddenHttpException;
use yii\web\Response;

class CodepackController extends BaseController
{
    const FLASH_VAR_KEY = 'codepack_prefix';

    public function init()
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_SETTINGS_ACCESS);

        parent::init();
    }

    /**
     * Show CodePack contents
     * Provide means to prefix the CodePack.
     *
     * @throws ForbiddenHttpException
     * @throws InvalidParamException
     * @throws CodepackException
     */
    public function actionListContents(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_SETTINGS_ACCESS);

        $this->view->registerAssetBundle(CodepackBundle::class);

        $codePack = $this->getCodepack();

        $postInstallPrefix = \Craft::$app->session->getFlash(self::FLASH_VAR_KEY);
        if ($postInstallPrefix) {
            return $this->renderTemplate(
                'freeform/codepack/_post_install',
                [
                    'codePack' => $codePack,
                    'prefix' => CodePack::getCleanPrefix($postInstallPrefix),
                ]
            );
        }

        return $this->renderTemplate(
            'freeform/codepack',
            [
                'codePack' => $codePack,
                'prefix' => 'freeform-demo',
            ]
        );
    }

    /**
     * Perform the install feats.
     *
     * @throws CodepackException
     * @throws ForbiddenHttpException
     * @throws BadRequestHttpException
     * @throws InvalidParamException
     */
    public function actionInstall(): Response
    {
        PermissionHelper::requirePermission(Freeform::PERMISSION_SETTINGS_ACCESS);

        $this->requirePostRequest();

        $codePack = $this->getCodepack();
        $prefix = \Craft::$app->request->post('prefix');

        $prefix = str_replace(['\\', '/'], '', $prefix);

        try {
            $codePack->install($prefix);
        } catch (FileObjectException $exception) {
            return $this->renderTemplate(
                'freeform/codepack',
                [
                    'codePack' => $codePack,
                    'prefix' => $prefix,
                    'exceptionMessage' => $exception->getMessage(),
                ]
            );
        }

        \Craft::$app->session->setFlash('codepack_prefix', $prefix);

        return $this->redirectToPostedUrl();
    }

    /**
     * @throws InvalidParamException
     * @throws CodepackException
     *
     * @return CodePack|Response
     */
    private function getCodepack()
    {
        try {
            $codePack = new CodePack(__DIR__.'/../codepack');
        } catch (ManifestNotPresentException $exception) {
            return $this->renderTemplate('freeform/codepack/_no_codepacks');
        }

        return $codePack;
    }
}

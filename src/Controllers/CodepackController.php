<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2017, Solspace, Inc.
 * @link          https://solspace.com/craft/freeform
 * @license       https://solspace.com/software/license-agreement
 */

namespace Solspace\Freeform\Controllers;

use craft\web\Controller;
use Solspace\Freeform\Library\Codepack\CodePack;
use Solspace\Freeform\Library\Codepack\Exceptions\CodepackException;
use Solspace\Freeform\Library\Codepack\Exceptions\FileObject\FileObjectException;
use Solspace\Freeform\Library\Codepack\Exceptions\Manifest\ManifestNotPresentException;
use Solspace\Freeform\Library\Helpers\PermissionsHelper;
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
        PermissionsHelper::requirePermission(PermissionsHelper::PERMISSION_SETTINGS_ACCESS);
        
        parent::init();
    }

    /**
     * Show CodePack contents
     * Provide means to prefix the CodePack
     *
     * @throws ForbiddenHttpException
     * @throws InvalidParamException
     * @throws CodepackException
     */
    public function actionListContents(): Response
    {
        PermissionsHelper::requirePermission(PermissionsHelper::PERMISSION_SETTINGS_ACCESS);

        $this->view->registerAssetBundle(CodepackBundle::class);

        $codePack = $this->getCodepack();

        $postInstallPrefix = \Craft::$app->session->getFlash(self::FLASH_VAR_KEY);
        if ($postInstallPrefix) {
            return $this->renderTemplate(
                'freeform/codepack/_post_install',
                array(
                    'codePack' => $codePack,
                    'prefix'   => CodePack::getCleanPrefix($postInstallPrefix),
                )
            );
        }

        return $this->renderTemplate(
            'freeform/codepack',
            array(
                'codePack' => $codePack,
                'prefix'   => 'freeform_demo',
            )
        );
    }

    /**
     * Perform the install feats
     *
     * @return Response
     * @throws CodepackException
     * @throws ForbiddenHttpException
     * @throws BadRequestHttpException
     * @throws InvalidParamException
     */
    public function actionInstall(): Response
    {
        PermissionsHelper::requirePermission(PermissionsHelper::PERMISSION_SETTINGS_ACCESS);

        $this->requirePostRequest();

        $codePack = $this->getCodepack();
        $prefix   = \Craft::$app->request->post('prefix');

        $prefix = preg_replace('/[^a-zA-Z_0-9\/]/', '', $prefix);

        try {
            $codePack->install($prefix);
        } catch (FileObjectException $exception) {
            return $this->renderTemplate(
                'freeform/codepack',
                array(
                    'codePack'         => $codePack,
                    'prefix'           => $prefix,
                    'exceptionMessage' => $exception->getMessage(),
                )
            );
        }

        \Craft::$app->session->setFlash('codepack_prefix', $prefix);

        return $this->redirectToPostedUrl();
    }

    /**
     * @return CodePack|Response
     * @throws InvalidParamException
     * @throws CodepackException
     */
    private function getCodepack()
    {
        try {
            $codePack = new CodePack(__DIR__ . '/../codepack');
        } catch (ManifestNotPresentException $exception) {
            return $this->renderTemplate('freeform/codepack/_no_codepacks');
        }

        return $codePack;
    }
}

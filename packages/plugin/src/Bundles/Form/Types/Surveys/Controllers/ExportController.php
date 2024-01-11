<?php

namespace Solspace\Freeform\Bundles\Form\Types\Surveys\Controllers;

use craft\web\Controller;
use JetBrains\PhpStorm\NoReturn;

class ExportController extends Controller
{
    #[NoReturn]
    public function actionPdf(): void
    {
        $images = \Craft::$app->request->post('imageData');

        $pdf = new \TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT);
        $pdf->setAuthor(\Craft::$app->getUser()->getIdentity()->getFullName());
        $pdf->setTitle('Export of data');

        $pdf->setJPEGQuality(75);

        foreach ($images as $image) {
            [$_, $encoded] = explode(',', $image);
            $decoded = base64_decode($encoded);

            $pdf->AddPage();
            $pdf->Image('@'.$decoded, 10, 20, 190);
        }

        $pdf->lastPage();

        $pdf->Output('some_pdf');

        exit;
    }

    public function actionImages(): void
    {
        $images = \Craft::$app->request->post('imageData');

        $zip = new \ZipArchive();

        $tmp = tempnam('.', '');
        $zip->open($tmp, \ZipArchive::CREATE);

        $count = 0;
        foreach ($images as $image) {
            $name = (++$count).'_field.jpg';

            [$_, $encoded] = explode(',', $image);
            $decoded = base64_decode($encoded);

            $zip->addFromString($name, $decoded);
        }

        $zip->close();

        // send the file to the browser as a download
        header('Content-disposition: attachment; filename=download.zip');
        header('Content-type: application/zip');
        readfile($tmp);
    }
}

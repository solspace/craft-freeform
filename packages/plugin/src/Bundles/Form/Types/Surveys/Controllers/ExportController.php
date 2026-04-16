<?php

namespace Solspace\Freeform\Bundles\Form\Types\Surveys\Controllers;

use craft\web\Controller;
use JetBrains\PhpStorm\NoReturn;

class ExportController extends Controller
{
    #[NoReturn]
    public function actionPdf(): void
    {
        $image = \Craft::$app->request->post('image');

        [$_, $encoded] = explode(',', $image);
        $decoded = base64_decode($encoded);

        $tmp = tempnam(sys_get_temp_dir(), 'survey_').'.png';
        file_put_contents($tmp, $decoded);

        $src = imagecreatefrompng($tmp);
        $srcWidth = imagesx($src);
        $srcHeight = imagesy($src);

        $pdf = new \TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT);
        $pdf->setAuthor(\Craft::$app->getUser()->getIdentity()->fullName);
        $pdf->setTitle('Export of data');
        $pdf->setJPEGQuality(80);

        $margins = $pdf->getMargins();
        $pageWidthMm = $pdf->getPageWidth() - $margins['left'] - $margins['right'];
        $pageHeightMm = $pdf->getPageHeight() - $margins['top'] - $margins['bottom'];

        $pxToMm = $pageWidthMm / $srcWidth;

        $sliceHeightPx = (int) round($pageHeightMm / $pxToMm);

        $offset = 0;
        $sliceIndex = 0;

        while ($offset < $srcHeight) {
            ++$sliceIndex;

            $currentSliceHeight = min($sliceHeightPx, $srcHeight - $offset);

            $slice = imagecreatetruecolor($srcWidth, $currentSliceHeight);

            imagealphablending($slice, false);
            imagesavealpha($slice, true);

            $transparent = imagecolorallocatealpha($slice, 0, 0, 0, 127);
            imagefilledrectangle($slice, 0, 0, $srcWidth, $currentSliceHeight, $transparent);

            imagecopy(
                $slice,
                $src,
                0,
                0,
                0,
                $offset,
                $srcWidth,
                $currentSliceHeight
            );

            $slicePath = tempnam(sys_get_temp_dir(), 'slice_').'.png';
            imagepng($slice, $slicePath);
            imagedestroy($slice);

            $pdf->AddPage();
            $pdf->Image(
                $slicePath,
                $margins['left'],
                $margins['top'],
                $pageWidthMm,
                0
            );

            $offset += $currentSliceHeight;
        }

        $pdf->lastPage();

        $filename = 'survey-'.date('Y-m-d-His').'.pdf';
        $pdf->Output($filename, 'D');

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

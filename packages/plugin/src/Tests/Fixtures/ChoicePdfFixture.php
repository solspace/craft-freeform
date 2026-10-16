<?php

namespace Solspace\Freeform\Tests\Fixtures;

/** Synthetic PDF definitions; never retain a customer's uploaded document in fixtures. */
final class ChoicePdfFixture
{
    public static function create(array $objects, string $fields = '[3 0 R]'): string
    {
        $objects = [1 => '<< /Type /Catalog /AcroForm 2 0 R >>', 2 => '<< /Fields '.$fields.' >>'] + $objects;
        ksort($objects);
        $bytes = "%PDF-1.4\n";
        $offsets = [];
        foreach ($objects as $number => $object) {
            $offsets[$number] = \strlen($bytes);
            $bytes .= $number." 0 obj\n".$object."\nendobj\n";
        }
        $xref = \strlen($bytes);
        $count = max(array_keys($objects)) + 1;
        $bytes .= "xref\n0 ".$count."\n0000000000 65535 f \n";
        for ($i = 1; $i < $count; ++$i) {
            $bytes .= isset($offsets[$i]) ? \sprintf("%010d 00000 n \n", $offsets[$i]) : "0000000000 00000 f \n";
        }

        return $bytes."trailer\n<< /Size ".$count." /Root 1 0 R >>\nstartxref\n".$xref."\n%%EOF\n";
    }
}

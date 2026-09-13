<?php
namespace App\Models\admin;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SerialMaster extends Model
{
    use HasFactory;
    protected $table = 'serialmaster';

    protected $fillable = ['module', 'lastnumber', 'moduleTag'];

    public static function generateSerialNumber($module)
    {
        $currentYear = date('Y');
        $lastRecord = self::where('module', $module)->first();
         
        if (!$lastRecord) {
            throw new \Exception("Module not found.");
        }

        $lastNumber = $lastRecord->lastnumber ?? 0;
        $newNumber = $lastNumber + 1;

        $paddedNumber = str_pad($newNumber, 5, '0', STR_PAD_LEFT);
        $serialNumber = $lastRecord->moduleTag . $paddedNumber . $currentYear;

        $lastRecord->update(['lastnumber' => $newNumber]);
        return $serialNumber;
    }
}

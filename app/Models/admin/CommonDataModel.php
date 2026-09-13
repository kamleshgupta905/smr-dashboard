<?php

namespace App\Models\admin;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class CommonDataModel extends Model
{
    use HasFactory;


    protected static function insertSingleTableData($table, $data)
{
    try {
        DB::beginTransaction();

        $lastInsertId = DB::table($table)->insertGetId($data);

        DB::commit();

        self::insertLogData($table, $data, $lastInsertId, 'Insert');

        return $lastInsertId;

    } catch (\Exception $e) {
        DB::rollBack();

        // 🔹 Log full SQL error for debugging
        \Log::error("❌ insertSingleTableData() failed", [
            'table' => $table,
            'data' => $data,
            'error_message' => $e->getMessage(),
            'error_code' => $e->getCode(),
            'trace' => $e->getTraceAsString(),
        ]);

        return 0;
    }
}

    public function contacts()
    {
        return $this->hasMany(ClientContact::class, 'client_id');
    }
    protected static function UpdateSingleTableData($table, $data, $where, $id = null)
    {
        try {
            DB::beginTransaction();
            DB::table($table)->where($where)->update($data);
            DB::commit();
            if ($id != null) {
                self::insertLogData($table, $data, $id, 'Update');
            }
            return true;
        } catch (\Exception $e) {
            DB::rollback();
            return 0;
        }
    }


    protected static function insertMultipleTableData($table, $data)
    {
        try {
            DB::beginTransaction();
            $lastInsertId = DB::table($table)->insert($data);
            DB::commit();
            return 1;
        } catch (\Exception $e) {

            DB::rollback();
            throw $e;
        }
    }


    protected static function insertLogData($table_name, $data_array, $row_id, $action, $member_id = "")
    {

        try {
            DB::beginTransaction();
            $activity_data = array(
                "row_id" => $row_id,
                "table_name" => $table_name,
                "action" => $action,
                "data_array" => json_encode($data_array),
                "user_browser" => getUserBrowserName(),
                "user_platform" => getUserPlatform(),
                "ip_address" => getUserIPAddress()
            );

            if ($member_id) {
                $activity_data = array_merge(
                    array(
                        'member_id' => $member_id,
                    ),
                    $activity_data
                );
            } else {
                $surveysAdmin = session()->get('surveysAdmin');
                $userId = $surveysAdmin['userId'];

                $activity_data = array_merge(
                    array(
                        'user_id' => $userId,
                    ),
                    $activity_data
                );
            }

            $logEntry = LogTable::create($activity_data);
            $lastInsertId = $logEntry->id;
            DB::commit();
            return $lastInsertId;
        } catch (\Exception $e) {
            DB::rollback();
        }
    }

   protected static function deleteTableData($table, $condition)
    {
        try {
            DB::beginTransaction();
    
            DB::table($table)->where($condition)->delete();
    
            DB::commit();
            return true;
    
        } catch (\Exception $e) {
            DB::rollback();
            
            \Log::error("❌ deleteTableData() failed", [
                'table' => $table,
                'condition' => $condition,
                'error' => $e->getMessage(),
            ]);
    
            return false;
        }
    }

}

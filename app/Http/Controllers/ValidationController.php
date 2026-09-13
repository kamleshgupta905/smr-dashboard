<?php

namespace App\Http\Controllers;

use App\Rules\AadharNumber;
use App\Rules\AmountValidationRule;
use App\Rules\RequestValidationRule;
use App\Rules\ShareValidationRule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;
use Illuminate\Database\Eloquent\Model;

class ValidationController extends Controller
{
    public static function inputValidate(Request $request, $modelClass = "", $table = "", $id = 0)
    {

        if ($modelClass != "") {
            if (!is_subclass_of($modelClass, Model::class)) {
                throw new \InvalidArgumentException('Invalid model class provided.');
            }
            $model = new $modelClass();
            $table = $model->getTable();
        }
        $postData = $request->post();
        $request->except('_token');

        $primaryKeyColumnInfo = DB::select("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS  WHERE TABLE_NAME = ? AND COLUMN_KEY = 'PRI' LIMIT 1", [$table]);
        ;
        if (!empty($primaryKeyColumnInfo)) {
            $primaryKey = $primaryKeyColumnInfo[0]->COLUMN_NAME;
        }
        // pre($primaryKey);exit;
        $filleds = [];
        $filledsMsg = [];
        $detail = [];
        foreach ($postData as $filled => $value) {

            $columnName = $filled;
            $method = '';
            if (Schema::hasColumn($table, $columnName)) {
                $queryString = sprintf('SHOW COLUMNS FROM `%s` WHERE Field = ?', $table);
                $queryResult = DB::select($queryString, [$columnName]);
                if (!empty($queryResult)) {
                    $columnInfo = $queryResult[0];
                    $type = $columnInfo->Type;
                    $notNull = $columnInfo->Null;
                    $isUnique = strpos($columnInfo->Key, 'UNI') !== false;
                    // var_dump($value);


                    //    pre($id);
                    //     exit;
                    // $method .= 'extended_ascii';
                    // $filledsMsg[$columnName . '.extended_ascii'] = 'The ' . str_replace("_", " ", $columnName) . ' must not contain extended ASCII characters.';
                    if ($notNull == "NO") {
                        $method .= '|required';
                        $filledsMsg[$columnName . '.required'] = 'The ' . str_replace(["id", "master", "_", "text"], " ", $columnName) . ' field is required.';
                    }

                    // $pattern = '/\((\d+)\)/'; // Regular expression pattern to match the length within parentheses
                    // if (preg_match($pattern, $columnInfo->Type, $matches)) {
                    //     // The length is in $matches[1]
                    //     $fieldLength = (int)$matches[1];
                    //     $method.= '|max:'.$fieldLength;
                    // }

                    if ($isUnique) {
                        $method .= '|unique:' . $table . ',' . $columnName . ',' . $id . ',' . $primaryKey . '';
                        $filledsMsg[$columnName . '.unique'] = str_replace("_", " ", $columnName) . ' already used.';
                    }
                    list($dataType, $length, $unsigned) = self::parseColumnType($type);
                    // pre($method);
                    if ($dataType === "timestamp" || $dataType === "datetime" || $dataType === "date") {
                        $method .= '|date';
                    }
                    // $detail[] = [
                    //     'Field' => $columnInfo->Field,
                    //     'Type' => $type,
                    //     'Null' => $columnInfo->Null,
                    //     'Key' => $columnInfo->Key,
                    //     'Default' => $columnInfo->Default,
                    //     'Extra' => $columnInfo->Extra,
                    // ];
                    $filleds[$columnName] = $method;
                }

            }
        }
        // pre($filleds);exit;
        $validator = Validator::make($request->all(), $filleds, $filledsMsg);

        if ($validator->fails()) {
            return ['msg_status' => 0, 'errors' => $validator->errors()];
        } else {
            return ['msg_status' => 1, 'errors' => $validator->errors()];
        }


        // ...
    }

    // Helper function to parse the column type into three parts
    private static function parseColumnType($type)
    {
        // Use regular expressions to extract the data type, length, and unsigned flag
        $pattern = '/^(\w+)(?:\(([\d,\'\w]+)\))?( unsigned)?$/i';
        preg_match($pattern, $type, $matches);

        $dataType = $matches[1];
        $length = isset($matches[2]) ? $matches[2] : null;
        $enumValues = null;
        $unsigned = isset($matches[3]) ? true : false;

        // Check if the data type is 'enum'
        if ($dataType === 'enum' && $length !== null) {
            // Extract the enum values from the length part (e.g., 'Y','N')
            $enumValues = explode(',', str_replace(['\'', ' '], '', $length));
        }

        return [$dataType, $length, $enumValues, $unsigned];
    }

}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApiSurvey extends Model
{
    protected $table = 'api_surveys';

    protected $fillable = [
        'SurveyId',
        'Name',
        'TotalCompleteRequired',
        'CPI',
        'LOI',
        'IR',
        'LastUpdateTimeStamp',
        'IsSurveyGroupExist',
        'LanguageCode',
        'SurveyEndDate',
        'Device',
        'IndustryId',
        'StudyTypes',
        'IsRecontactSurvey',
        'CollectPII',
        'LanguageId',
        'FieldDays',
        'SurveyCreatedAt',
        'status',
    ];
}
<?php

namespace App\Models\admin;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SupplierBillingDetail extends Model
{
    use HasFactory;
      protected $table = 'supplier_billing_details';

    protected $fillable = [
        'contact_id',
        'legal_name',
        'business_type',
        'pan',
        'gst',
        'reg_address',
        'bill_address',
        'bank',
        'holder',
        'acc',
        'ifsc',
        'upi',
        'payment_mode',
        'currency',
        'terms'
    ];
}

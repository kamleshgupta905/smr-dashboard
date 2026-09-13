<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Controllers\LayoutController;
use App\Models\admin\CommonDataModel;
use App\Models\admin\SerialMaster;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentsController extends Controller
{
    public function index()
    {
        $result['paymentsList'] = DB::table('payments')
            ->join('projects', 'payments.project_id', '=', 'projects.id')
            ->join('vendor', 'payments.vendor_id', '=', 'vendor.id')
            ->select('payments.*', 'projects.name as project_name', 'projects.project_id as pid', 'vendor.email as vendor_email', 'vendor.id as vid')
            ->orderByDesc('payments.id')
            ->get();
            
        $body['bodyView'] = view('admin/payments/payment_list_view', $result);
        return LayoutController::loadAdmin($body);
    }

    public function status(Request $request)
    {
        $remarks = $request->post('remarks');
        $payment_id = $request->post('payment_id');
        $action_type = $request->post('action_type');

        try {
            DB::beginTransaction();
            $paymentData = DB::table('payments')->where('id', $payment_id)->first();

            CommonDataModel::UpdateSingleTableData('payments', ['status' => $action_type, 'date' => now(), 'remarks' => $remarks], ['id' => $payment_id], $payment_id);

            $newPaymentArr = [
                'payment_id' => SerialMaster::generateSerialNumber('PAYMENT'),
                'project_id' => $paymentData->project_id,
                'vendor_id' => $paymentData->vendor_id,
                'amount' => 0
            ];

            CommonDataModel::insertSingleTableData('payments', $newPaymentArr);
            DB::commit();

            return response()->json(['status' => true]);
        } catch (\Exception $e) {
            die($e);
            return response()->json(['status' => false]);
        }
    }
}

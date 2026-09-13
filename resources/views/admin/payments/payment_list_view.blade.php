<style>
    .dt-button {
        color: #fff;
        letter-spacing: 1px;
        font-weight: 700;
        background: #2e3094;
        border: 0;
        border-radius: 5px;
        padding: 2px 10px 2px 10px;
    }

    .status-button {
        color: white;
        background-color: green;
        font-weight: bold;
        padding: 5px 15px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        width: 10rem;
    }

    .status-button.rejected {
        background-color: red;
    }

    .status-button i {
        font-size: 16px;
    }

    /* Modal box styles */
    .modal-box {
        font-family: 'Montserrat', sans-serif;
    }

    .modal-box .show-modal {
        color: #2e3094;
        background-color: #fff;
        font-size: 18px;
        font-weight: 600;
        text-transform: capitalize;
        padding: 10px 15px;
        margin: 80px auto 0;
        border: none;
        box-shadow: 0 0 8px rgba(0, 0, 0, 0.5);
        display: block;
    }

    .modal-box .show-modal:hover,
    .modal-box .show-modal:focus {
        color: #2e3094;
        border: none;
        outline: none;
    }

    .modal-backdrop.in {
        opacity: 0;
    }

    .modal-box .modal-dialog {
        width: 550px;
        margin: 70px auto 0;
    }

    .modal.fade .modal-dialog {
        transform: translateX(100px);
        transition: all 400ms cubic-bezier(.47, 1.64, .41, .8);
    }

    .modal.in .modal-dialog {
        transform: translateX(0);
    }

    .modal-box .modal-dialog .modal-content {
        background: #fff;
        text-align: center;
        border: none;
        border-radius: 20px;
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
    }

    .modal-box .modal-dialog .modal-content .close {
        color: #2e3094;
        font-size: 30px;
        line-height: 15px;
        opacity: 1;
        position: absolute;
        left: auto;
        top: 20px;
        right: 15px;
        z-index: 1;
        transition: all 0.3s;
    }

    .modal-box .modal-dialog .modal-content .close span {
        margin: -2px 0 0 0;
        display: block;
    }

    .modal-content .close:hover {
        color: #2e3094;
    }

    .modal-box .modal-dialog .modal-content .modal-body {
        padding: 0 45px 45px !important;
    }

    .modal-box .modal-dialog .modal-content .modal-body .modal-icon {
        color: #fff;
        background: #2e3094;
        font-size: 70px;
        line-height: 125px;
        width: 125px;
        height: 125px;
        margin: -63px auto 15px;
        border-radius: 50%;
        display: inline-block;
    }

    .modal-box .modal-dialog .modal-content .modal-body .title {
        color: #2e3094;
        font-size: 40px;
        font-weight: 300;
        line-height: 50px;
        text-transform: capitalize;
        margin: 0 0 15px;
    }

    .modal-box .modal-dialog .modal-content .modal-body .description {
        color: #767676;
        font-size: 23px;
        font-weight: 400;
        margin: 0 0 15px;
    }

    .modal-box .modal-dialog .modal-content .modal-body .input-group {
        background-color: #eff7ff;
        padding: 2px 1px;
        margin: 0 auto;
        border: 1px solid #c5cfdb;
        border-radius: 25px;
    }

    .modal-box .modal-dialog .modal-content .modal-body input {
        background-color: transparent;
        font-size: 18px;
        width: calc(100% - 45px);
        height: 40px;
        border-radius: 25px;
        border: none;
        box-shadow: none;
    }

    .modal-box .modal-dialog .modal-content .modal-body input:focus {
        box-shadow: none;
    }

    .modal-box .modal-dialog .modal-content .modal-body .btn {
        color: #fff;
        background-color: #2e3094;
        font-size: 20px;
        line-height: 35px;
        height: 40px;
        width: 40px;
        padding: 0;
        border-radius: 50%;
        border: none;
        transition: all 0.4s ease 0s;
    }

    .modal-box .modal-dialog .modal-content .modal-body .btn:hover {
        color: #fff;
        text-shadow: 3px 3px 3px rgba(0, 0, 0, 0.6);
    }

    @media only screen and (max-width: 767px) {
        .modal-box .modal-dialog {
            width: 95% !important;
        }

        .modal-box .modal-dialog .modal-content .modal-body {
            padding: 0 25px 45px !important;
        }

        .modal-box .modal-dialog .modal-content .modal-body .title {
            font-size: 33px;
        }
    }
</style>

@if (session()->has('message'))
    <script>
        showToast('success', '{{ session('message') }}')
    </script>
@endif
<section class="layout-box-content-format1">
    <div class="card card-primary list-view">
        <div class="card-header box-shdw">
            <h3 class="card-title">Leads</h3>
        </div>
        <div class="card-body">
            <div class="formblock-box">
                <div class="table-responsive">
                    <table class="table customTbl table-bordered table-hover dataTable dataContainer table-striped">
                        <thead>
                            <tr>
                                <th style="display: none;"></th>
                                <th>Id</th>
                                <th>Project</th>
                                <th>Vendor</th>
                                <th>Amount</th>
                                <th class="text-center">Status</th>
                                <th>Remarks</th>
                                <th>Paid at</th>
                                <th class="text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach ($paymentsList as $key => $payment)
                                <tr>
                                    <td style="display: none;"></td>
                                    <td><strong>{{ $payment->payment_id }}</strong></td>
                                    <td>{!! $payment->project_name . '<br/>(' . $payment->pid . ')' !!}</td>
                                    <td><a href="{{ url('/') }}/admin/vendor/view/{{ $payment->vid }}"
                                            target="_blank">{{ $payment->vendor_email }}</a></td>
                                    <td><strong>${{ $payment->amount }}</strong></td>
                                    <td><span
                                            class="text-center {{ str_replace(' ', '', $payment->status) }}-payment-status">{{ $payment->status }}</span>
                                    </td>
                                    <td><strong>{{ $payment->remarks }}</strong></td>
                                    <td>{{ $payment->date ? date('d-m-Y', strtotime($payment->date)) : '' }}</td>

                                    @php $status = $payment->status != "Pending" ? 'style="cursor: not-allowed;" disabled' : ''; @endphp
                                    <td>
                                        <table>
                                            <tr>
                                                <td><button class="status-button"
                                                        data-payment-id="{{ $payment->id }}" {!! $status !!}>
                                                        <i class="fa fa-check-circle" aria-hidden="true"></i> Marks Paid
                                                    </button></td>
                                                <td><button class="status-button rejected"
                                                        data-payment-id="{{ $payment->id }}" {!! $status !!}>
                                                        <i class="fa fa-times-circle" aria-hidden="true"></i> Marks
                                                        Rejected
                                                    </button></td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</section>
<div class="container">
    <div class="row">
        <div class="col-md-12">
            <div class="modal-box">
                <div class="modal fade" id="remarksModal" data-backdrop="static" tabindex="-1" role="dialog"
                    aria-labelledby="remarksModalLabel" aria-hidden="true">
                    <div class="modal-dialog" role="document">
                        <div class="modal-content">
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                            <div class="modal-body">
                                <div class="modal-icon">
                                    <i class="fa fa-credit-card"></i>
                                </div>
                                <h3 class="title">Add Remarks</h3>
                                <p class="description">Provide your remarks for the selected payment.</p>
                                <form id="remarksForm">
                                    <div class="input-group">
                                        <input type="text" class="form-control" id="remarks" name="remarks"
                                            placeholder="Enter your remarks" />
                                        <button type="submit" class="btn" id="remarksbtn"><i
                                                class="fa fa-location-arrow"></i></button>
                                    </div>
                                    <input type="hidden" id="paymentId" name="payment_id" />
                                    <input type="hidden" id="actionType" name="action_type" />
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<script src="{{ asset('assets/admin/') }}/js/payment.js"></script>

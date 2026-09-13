<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>VMH GROUP'S</title>
    {{--
    <link rel="icon" type="image/x-icon" href="{{ asset('assets/') }}/img/MA2.ico"> --}}
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link rel="stylesheet" href="{{ asset('assets/') }}/plugins/fontawesome-free/css/all.min.css">
    <link rel="stylesheet" href="https://code.ionicframework.com/ionicons/2.0.1/css/ionicons.min.css">
    <link rel="stylesheet"
        href="{{ asset('assets/') }}/plugins/tempusdominus-bootstrap-4/css/tempusdominus-bootstrap-4.min.css">
    <link rel="stylesheet" href="{{ asset('assets/') }}/plugins/icheck-bootstrap/icheck-bootstrap.min.css">
    <link rel="stylesheet" href="{{ asset('assets/') }}/dist/css/adminlte.min.css">
    <link rel="stylesheet" href="{{ asset('assets/') }}/plugins/overlayScrollbars/css/OverlayScrollbars.min.css">
    <link href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,700" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('assets/') }}/plugins/datatables-bs4/css/dataTables.bootstrap4.css">
    <link rel="stylesheet" href="{{ asset('assets/') }}/css/bootstrap-select.css">
    <link rel="stylesheet" href="{{ asset('assets/') }}/plugins/sweetalert2/sweetalert2.min.css">
    <link rel="stylesheet" href="{{ asset('assets/') }}/plugins/toastr/toastr.min.css">
    <link rel="stylesheet" href="{{ asset('assets/') }}/plugins/bootstrap4-duallistbox/bootstrap-duallistbox.min.css">
    <!-- <link rel="stylesheet" href="{{ asset('assets/') }}/css/softhought_style.css"> -->
    <link rel="stylesheet" href="{{ asset('assets/') }}/plugins/select2/css/select2.min.css">
    <link rel="stylesheet" href="{{ asset('assets/') }}/plugins/select2-bootstrap4-theme/select2-bootstrap4.min.css">
    <link rel="stylesheet"
        href="{{ asset('assets/') }}/plugins/bootstrap-datepicker/dist/css/bootstrap-datepicker.min.css">
    <!-- custome css  -->
    {{--
    <link href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,700" rel="stylesheet"> --}}
    {{--
    <link href="https://fonts.googleapis.com/css?family=Monoton&display=swap" rel="stylesheet"> --}}
    {{--
    <link rel="preconnect" href="https://fonts.googleapis.com"> --}}
    {{--
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin> --}}
    <link
        href="https://fonts.googleapis.com/css2?family=Montserrat:wght@100;300;400;500;600;800;900&family=Poppins:wght@100;300;400;500;900&display=swap"
        rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('assets/') }}/css/softhought_style.css">
    <link rel="stylesheet" href="{{ asset('assets/') }}/css/latest.design.css">
    <link rel="stylesheet" href="{{ asset('assets/admin') }}/css/style.css">
    
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" integrity="sha512-SnH5WK+bZxgPHs44uWIX+LLJAJ9/2PkPKZ5QiAj6Ta86w+fsb2TkcmfRyVX3pBnMFcV7oQPJkl9QevSCWr3W6A==" crossorigin="anonymous" referrerpolicy="no-referrer" />

    <!-- jQuery -->
    <script src="{{ asset('assets/') }}/plugins/jquery/jquery.min.js"></script>
    <script src="{{ asset('assets/') }}/plugins/bootstrap/js/bootstrap.bundle.min.js"></script>
    <script src="{{ asset('assets/') }}/js/bootstrap-select.js"></script>
    <script src="{{ asset('assets/') }}/plugins/sweetalert2/sweetalert2.js"></script>
    <script src="{{ asset('assets/') }}/plugins/toastr/toastr.min.js"></script>
    <script src="{{ asset('assets/') }}/plugins/select2/js/select2.full.min.js"></script>
    <script src="{{ asset('assets/') }}/plugins/moment/moment.min.js"></script>
    <script src="{{ asset('assets/') }}/plugins/inputmask/min/jquery.inputmask.bundle.min.js"></script>
    <script src="{{ asset('assets/') }}/plugins/bootstrap-datepicker/dist/js/bootstrap-datepicker.min.js"></script>
    <script src="{{ asset('assets/') }}/plugins/datatables/jquery.dataTables.js"></script>
    <script src="{{ asset('assets/') }}/plugins/datatables-bs4/js/dataTables.bootstrap4.js"></script>
    <script src="{{ asset('assets/') }}/plugins/datatables/dataTables.keyTable.min.js"></script>
    <script src="{{ asset('assets/') }}/plugins/overlayScrollbars/js/jquery.overlayScrollbars.min.js"></script>

    <script src="{{ asset('assets/') }}/dist/js/adminlte.min.js"></script>
    <!-- <script src="{{ asset('assets/') }}/dist/js/demo.js"></script> -->
    <script src="{{ asset('assets/') }}/js/jquery.nicescroll.min.js"></script>
    <script src="{{ asset('assets/') }}/js/customJs/datecheck.js"></script>
    <script src="{{ asset('assets/') }}/plugins/bs-custom-file-input/bs-custom-file-input.min.js"></script>
    <!-- datatables additional files for pdf and print-->

    <script src="{{ asset('assets/') }}/js/datatables/dataTables.buttons.min.js"></script>
    <script src="{{ asset('assets/') }}/js/datatables/buttons.flash.min.js"></script>
    <script src="{{ asset('assets/') }}/js/datatables/jszip.min.js"></script>
    <script src="{{ asset('assets/') }}/js/datatables/pdfmake.min.js"></script>
    <script src="{{ asset('assets/') }}/js/datatables/vfs_fonts.js"></script>
    <script src="{{ asset('assets/') }}/js/datatables/buttons.html5.min.js"></script>
    <script src="{{ asset('assets/') }}/js/datatables/buttons.print.min.js"></script>
    <script src="{{ asset('assets/admin') }}/js/ajaxsetup.js"></script>

    <script src="https://cdn.ckeditor.com/4.16.2/standard/ckeditor.js"></script>



    <style>
        #pageheader {
            font-size: 1.5rem;
            color: #2e3094;
            font-weight: 600;
            text-transform: capitalize;
        }

        @media (max-width: 768px) {

            #pageheader,
            h4 {
                display: none;
            }
        }

        .brand-link {
            font-size: 1.25rem;
            line-height: 1.5;
            white-space: nowrap;
            height: 57px !important;
        }
    </style>


</head>

@php
    use App\Http\Controllers\admin\DashboardController;

    //  $accYear = DashboardController::accYear();

@endphp

<body class="hold-transition sidebar-mini layout-fixed modern-layout-ui " style="background-color: red">
    <div class="wrapper">

        <!-- Navbar -->
        <nav class="main-header navbar navbar-expand navbar-white navbar-light ">
            <!-- Left navbar links -->
            <ul class="navbar-nav">
                <li class="nav-item">
                    <a class="nav-link" data-widget="pushmenu" href="#"><i class="fas fa-bars"></i></a>
                </li>
                <li class="nav-item d-none d-sm-inline-block">
                    {{-- <a href="{{ url('/') }}dashboard" class="nav-link">Home</a> --}}
                </li>
                <li class="nav-item d-none d-sm-inline-block">
                    <!-- <a href="#" class="nav-link">Contact</a> -->
                </li>
            </ul>


            <!-- <h4 id="pageheader"> Loyalty </h4> -->

            <!-- SEARCH FORM -->
            {{-- <form class="form-inline ml-3">
                <div class="input-group input-group-sm">
                    <input class="form-control form-control-navbar" type="search" placeholder="Search"
                        aria-label="Search">
                    <div class="input-group-append">
                        <button class="btn btn-navbar" type="submit">
                            <i class="fas fa-search"></i>
                        </button>
                    </div>
                </div>
            </form> --}}

            <div class="navbar-collapse collapse  order-3 dual-collapse2">
                <ul class="navbar-nav ml-auto">
                    <li class="nav-item">


                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="{{ route('admin.logout') }}">
                            <i class="nav-icon fas fa-sign-out-alt"></i>
                            Logout
                        </a>
                    </li>
                </ul>
            </div>
        </nav>
        <!-- /.navbar -->

        <!-- Main Sidebar Left Menu Container -->
        <aside class="main-sidebar sidebar-dark-primary elevation-1">

            <!-- Brand Logo -->
            <a href="{{ url('/') }}dashboard" class="brand-link">
                {{-- <span class="brand-text"><span class="brand-text-start">Admin </span><span
                        class="brand-text-end">Panel</span></span> --}}
                <span class="brand-text"><img class="img-app"
                        src="{{ asset('assets/') }}/app-assets/images/logo/app-logo.png" alt=""></span>

                {{-- Admin Panel --}}
            </a>

            <!-- Sidebar -->
            <div class="sidebar">
                <!-- Sidebar user panel (optional) -->
                <div class="user-panel mt-3 mb-3 d-flex">
                    <div class="info">
                        <a href="#" class="d-block">Hi, {{ session('surveysAdmin.userName') }} </a>
                    </div>
                </div>


                <!-- Sidebar Menu -->
                <nav class="mt-2">
                    <ul class="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu"
                        data-accordion="false">

                        @php
                            // $userId = session()->get('ADMIN_ID');
                            $userId = session('surveysAdmin.userId');
                        @endphp
                        {!! getTopNavCat($userId) !!}

                        <div class="hr-seperator-line mt-3"></div>

                        <!-- <li class="nav-header pt-1" style="color: #75777b;">User Profile</li>

                        <li class="nav-item">
                            <a href="{{ url('/') }}user/change_password" class="nav-link">
                                <i class="nav-icon fas fa-file-signature"></i>
                                <p>Change Password</p>
                            </a>
                        </li> -->
 
                        <!-- <li class="nav-item">
                            <a href="{{ url('/') }}logout" class="nav-link">
                                <i class="nav-icon fas fa-sign-out-alt"></i>
                                <p>Logout</p>
                            </a>
                        </li> -->


                    </ul>
                </nav>
                <!-- /.sidebar-menu -->
            </div>
            <!-- /.sidebar -->
        </aside>

        <!-- Content Wrapper. Contains page content -->
        <div class="content-wrapper mb-5">
            <!-- Content Header (Page header) -->
            <div class="content-header">
                <div class="container-fluid">

                    <div class="row mb-2" style="display:none;">
                        <div class="col-sm-6">
                            <h1 class="m-0 text-dark">Dashboard</h1>
                        </div><!-- /.col -->
                        <div class="col-sm-6">
                            <ol class="breadcrumb float-sm-right">
                                <li class="breadcrumb-item"><a href="#">Home</a></li>
                                <li class="breadcrumb-item active">Dashboard v1</li>
                            </ol>
                        </div><!-- /.col -->
                    </div><!-- /.row -->

                </div><!-- /.container-fluid -->
            </div>
            <!-- /.content-header -->

            <!-- Main content -->
            <section class="content">
                <div class="container-fluid">
@if (session()->has('success'))
    <script>
        showToast('success', '{{ session('success') }}')
    </script>
@endif
@if (session()->has('error'))
    <script>
        showToast('error', '{{ session('error') }}')
    </script>
@endif

@if ($errors->any())
    <div class="alert alert-danger">
        <ul>
            @foreach ($errors->all() as $error)
            <li>{{ $error }}</li>
            @endforeach
        </ul>
    </div>
@endif


<section class="layout-box-content-format1">
    <div class="row">
        <div class="col-md-1"></div>
        <div class="col-md-12">
            <div class="card card-primary list-view">
                <div class="card-header box-shdw">
                    <h3 class="card-title">Vendor</h3>
                   
                </div>
                @if(request()->route('id'))
                <form method="post" action="{{ url('admin/VendorList/edit/' . request()->route('id')) }}">
            @else
                <form method="post" action="{{ url('admin/VendorList/add') }}">
            @endif
                <div class="card-body">
                    <div class="formblock-box">
                        @csrf
                      
                        <div class="row p-2">
                            <div class="col-md-6">
                                <div class="form-group mb-3">
                                    <label for="" class="form-label">Vendor name</label>
                                    <input class="form-control" type="text" id="name" name="name"
                                        placeholder="Enter Vendor Name"
                                        value="{{ $vendor->name ?? '' }}" />
                                </div>
                            </div>
            
                            <div class="col-md-6">
                                <div class="form-group mb-3">
                                    <label for="" class="form-label">Vendor email</label>
                                    <input class="form-control" type="text" id="email" name="email"
                                        placeholder="Enter Vendor Email"
                                        value="{{ $vendor->email ?? '' }}" />
                                </div>
                            </div>
            
                            <div class="col-md-6">
                                <div class="form-group mb-3">
                                    <label for="" class="form-label">Complete URL</label>
                                    <input class="form-control" type="text" name="success"
                                        value="{{ $vendor->success ?? '' }}" />
                                </div>
                            </div>
            
                            <div class="col-md-6">
                                <div class="form-group mb-3">
                                    <label for="" class="form-label">Terminate URL</label>
                                    <input class="form-control" type="text" name="terminate"
                                        value="{{ $vendor->terminate ?? '' }}" />
                                </div>
                            </div>
            
                            <div class="col-md-6">
                                <div class="form-group mb-3">
                                    <label for="" class="form-label">Screenout URL</label>
                                    <input class="form-control" type="text" name="screenout"
                                        value="{{ $vendor->screenout ?? '' }}" />
                                </div>
                            </div>
            
                            <div class="col-md-6">
                                <div class="form-group mb-3">
                                    <label for="" class="form-label">Quotafull URL</label>
                                    <input class="form-control" type="text" name="quotafull"
                                        value="{{ $vendor->quotafull ?? '' }}" />
                                </div>
                            </div>
            
                            <div class="col-md-2 mt-2">
                                <div class="form-group mt-4">
                                    <button type="submit" class="btn btn-sm action-button">Save</button>
                                </div>
                            </div>
                            <span id="sussess_msg" style="padding: 5px;color: #0b6c0b;font-weight: bold;"></span>
                        </div>
                    </div>
                </div>
            </form>
            
            </div>
        </div>
    </div>
</section>

    </div><!-- /.container-fluid -->
</section>


<section class="content">
    <div class="container-fluid">
        <section class="layout-box-content-format1">
<div class="card card-primary list-view">
<div class="card-header box-shdw">
<h3 class="card-title">Vendor List</h3>
       </div>
<div class="card-body">
<div class="formblock-box">
    <div class="table-responsive">
        <div id="DataTables_Table_0_wrapper" class="dataTables_wrapper dt-bootstrap4 no-footer"><div class="row"><div class="col-sm-12 col-md-6"></div></div><div class="row"><div class="col-sm-12"><table class="table customTbl table-bordered table-hover dataTable dataContainer table-striped no-footer" id="DataTables_Table_0" role="grid" aria-describedby="DataTables_Table_0_info">
            <thead>
                <tr role="row">
                    <th>Sl No.</th>
                    <th>Vendor ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th >Complete </th>
                    <th>Terminate </th>
                    <th>Screenout</th>
                    <th >Quotafull </th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                @foreach($data as $index => $vendor)
                    <tr role="row" class="odd">
                        <td class="sorting_1">{{$index+1}}</td>
                        <td><strong>{{$vendor->vendor_id}}</strong></td>
                        <td>{{$vendor->name}}</td>
                        <td>{{$vendor->email}}</td>
                        <td>{{$vendor->success}}</td>
                        <td>{{$vendor->terminate}}</td>
                        <td>{{$vendor->screenout}}</td>
                        <td>{{$vendor->quotafull}}</td>
                    
                        <td class="d-flex">
                            <div>
<a href="{{url('admin/VendorList/edit/'.$vendor->id)}}" class="btn tbl-action-btn" style="padding: 5px 9px 7px 7px;"> <i class="fas fa-edit"></i> </a>
</div>                                              
                                        <div>
<a href="{{url('admin/VendorList/delete/'.$vendor->id)}}" class="btn tbl-action-btn" style="padding: 5px 9px 7px 7px;"> <i class="fas fa-trash"></i> </a>
</div>
                                  
                        </td>

                    </tr>
                    @endforeach
                
                </tbody>
        </table></div></div></div>
    </div>
</div>
</div>
</div>
</section>

<script src="/assets/admin/js/vendor.js"></script>

        <section class="layout-box-content-format1">
<div class="modal fade" id="commonModal" tabindex="-1" aria-hidden="true">
<div class="modal-dialog modal-lg modal-dialog-centered">
<div class="modal-content">
    <div class="modal-header card-header box-shdw text-white">
        <h5 class="modal-title fa-1x p-1" id="header_title">Add</h5>
        <button type="button" class="close text-white" data-dismiss="modal">×</button>
    </div>
    <div class="modal-body modal-body" id="bodyContent">

    </div>
    <!--/ App Wizard -->
    <div class="modal-footer">
        <button type="button" class="btn btn-sm btn-danger" data-dismiss="modal">Close</button>
    </div>
</div>
</div>
</div>
</section>
<!--/ Create App Modal -->

<script src="{{ asset('assets/admin/') }}/js/vendor.js"></script>
<x-modal-component id="commonModal" title="Add" dialogclass="modal-lg modal-dialog-centered"
bodyclass="modal-body" />


<input type="hidden" value="{{ url('/') }}" id="base_url" readonly />

</div><!-- /.container-fluid -->
</section>
<!-- /.content -->
</div>
<!-- /.content-wrapper -->
<footer class="main-footer">
<strong>Copyright &copy;
<?php echo date('Y'); ?> <a href=#">VHM GROUP'S</a>
</strong>
All rights reserved.
</footer>

<!-- Control Sidebar -->
<aside class="control-sidebar control-sidebar-dark">
<!-- Control sidebar content goes here -->
</aside>
<!-- /.control-sidebar -->
</div>
<!-- ./wrapper -->
<script src="{{ asset('assets/admin') }}/js/custom.js"></script>
</body>

</html>

<!-- Modal -->
<div class="modal fade" id="logHistoryModal" role="dialog">
<div class="modal-dialog modal-xl">

<!-- Modal content-->
<div class="modal-content">
<div class="modal-header">
<h6 class="modal-title">Log History</h6>
<button type="button" class="close" data-dismiss="modal">&times;</button>

</div>
<div class="modal-body" style="overflow-y: scroll;min-height:350px;">
<div id="log_details"></div>
</div>
<!-- <div class="modal-footer">
<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
</div> -->
</div>

</div>
</div>


<script>
$(document).on('click', '.copy-icon', function() {
const link = $(this).prev('a');
copyToClipboard(link.attr('href'));
});

function copyToClipboard(text) {
navigator.clipboard.writeText(text)
.then(function() {
showToast('success', 'Link copied to clipboard');
})
.catch(function(error) {
console.error('Unable to copy to clipboard:', error);
showToast('error', 'Failed to copy link to clipboard');
});
}
</script>
<script src="https://unpkg.com/sweetalert/dist/sweetalert.min.js"></script>

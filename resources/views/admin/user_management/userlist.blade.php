<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<script src="{{ asset('assets/admin/') }}/js/user.js"></script>

@if (session()->has('message'))
<script>
    showToast('success', '{{ session('message') }}');
</script>
@endif

@if (session()->has('error'))
<script>
    showToast('error', '{{ session('error') }}');
</script>
@endif

<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

<style>

/* =====================================================
   PREMIUM LIGHT SAAS UI
===================================================== */

body {
    font-family: 'Inter', sans-serif !important;
    background: #F8FAFC !important;
    color: #0F172A !important;
    overflow-x: hidden;
}

/* subtle premium background */
body::before {
    content: '';
    position: fixed;
    width: 500px;
    height: 500px;
    background: rgba(59,130,246,0.08);
    filter: blur(120px);
    top: -150px;
    right: -120px;
    z-index: 0;
    pointer-events: none;
}

/* layout wrapper */
.layout-box-content-format1 {
    width: 100%;
    margin: 0 auto;
    position: relative;
    z-index: auto;
}

/* =====================================================
   CARD
===================================================== */

.card.list-view {
    background: #FFFFFF !important;
    border-radius: 18px !important;
    border: 1px solid #E2E8F0 !important;
    box-shadow: 0 12px 35px rgba(15, 23, 42, 0.05) !important;
    overflow: hidden;
    transition: 0.3s ease;
}

.card.list-view:hover {
    transform: translateY(-3px);
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08) !important;
}

/* =====================================================
   HEADER
===================================================== */

.layout-box-content-format1 .card-header {
    background: linear-gradient(135deg, #ffffff, #f8fbff) !important;
    border-bottom: 1px solid #E2E8F0 !important;
    min-height: 72px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 24px !important;
}

.layout-box-content-format1 .card-header .card-title {
    font-size: 20px !important;
    font-weight: 700 !important;
    color: #0F172A !important;
    margin: 0 !important;
    letter-spacing: 0.2px;
    line-height: normal !important;
}

/* =====================================================
   ADD USER BUTTON
===================================================== */

.card-header .btn-group {
    margin-left: auto !important;
}

.btn-group .btn {
    background: linear-gradient(135deg, #3B82F6, #2563EB) !important;
    border: none !important;
    color: #ffffff !important;
    border-radius: 10px !important;
    padding: 10px 18px !important;
    font-size: 13px !important;
    font-weight: 600 !important;
    transition: 0.25s ease;
    box-shadow: 0 8px 20px rgba(37, 99, 235, 0.15);
}

.btn-group .btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 28px rgba(37, 99, 235, 0.22);
}

/* =====================================================
   BODY
===================================================== */

.card-body {
    padding: 24px !important;
    background: #FFFFFF !important;
}

/* =====================================================
   DATATABLE SEARCH + LENGTH
===================================================== */

.dataTables_length,
.dataTables_filter {
    margin-bottom: 18px !important;
}

.dataTables_length label,
.dataTables_filter label {
    color: #475569 !important;
    font-size: 14px !important;
    font-weight: 500;
}

.dataTables_filter input,
.dataTables_length select {
    background: #FFFFFF !important;
    border: 1px solid #CBD5E1 !important;
    color: #0F172A !important;
    border-radius: 10px !important;
    padding: 8px 14px !important;
    min-height: 42px;
    box-shadow: none !important;
    transition: 0.25s ease;
}

.dataTables_filter input:focus,
.dataTables_length select:focus {
    border-color: #3B82F6 !important;
    box-shadow: 0 0 0 4px rgba(59,130,246,0.08) !important;
    outline: none !important;
}

/* =====================================================
   TABLE
===================================================== */

.table-responsive {
    overflow-x: auto;
}

.customTbl {
    width: 100%;
    border-collapse: separate !important;
    border-spacing: 0 12px !important;
}

/* HEAD */

.customTbl thead th {
    background: transparent !important;
    color: #64748B !important;
    font-size: 11px !important;
    font-weight: 700 !important;
    text-transform: uppercase;
    letter-spacing: 1px;
    border: none !important;
    padding: 12px 14px !important;
    white-space: nowrap;
}

/* BODY ROW */

.customTbl tbody tr {
    background: #FFFFFF !important;
    border: 1px solid #E2E8F0 !important;
    box-shadow: 0 6px 18px rgba(15,23,42,0.03);
    transition: 0.25s ease;
}

.customTbl tbody tr:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(15,23,42,0.06);
}

/* CELLS */

.customTbl td {
    padding: 16px 14px !important;
    font-size: 13px !important;
    color: #1E293B !important;
    vertical-align: middle !important;
    border-top: 1px solid #F1F5F9 !important;
    border-bottom: 1px solid #F1F5F9 !important;
    background: #FFFFFF !important;
}

.customTbl td:first-child {
    border-left: 1px solid #F1F5F9 !important;
    border-top-left-radius: 12px;
    border-bottom-left-radius: 12px;
}

.customTbl td:last-child {
    border-right: 1px solid #F1F5F9 !important;
    border-top-right-radius: 12px;
    border-bottom-right-radius: 12px;
}

/* =====================================================
   ROLE BADGE
===================================================== */

.role-badge {
    background: #EEF4FF;
    color: #2563EB;
    padding: 7px 14px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
    display: inline-block;
    border: 1px solid #DBEAFE;
}

/* =====================================================
   ACTION BUTTONS
===================================================== */

.btn-group-sm .btn {
    background: #F8FAFC !important;
    color: #2563EB !important;
    border: 1px solid #DBEAFE !important;
    border-radius: 8px !important;
    padding: 7px 12px !important;
    transition: 0.25s ease;
}

.btn-group-sm .btn:hover {
    background: #2563EB !important;
    color: #ffffff !important;
    transform: translateY(-1px);
}

.deleteUserBtn {
    background: #FEF2F2 !important;
    color: #DC2626 !important;
    border: 1px solid #FECACA !important;
    border-radius: 8px !important;
    padding: 7px 12px !important;
    margin-left: 6px;
    transition: 0.25s ease;
}

.deleteUserBtn:hover {
    background: #DC2626 !important;
    color: #ffffff !important;
    transform: translateY(-1px);
}

/* =====================================================
   PAGINATION
===================================================== */

.dataTables_paginate {
    margin-top: 15px !important;
}

.dataTables_paginate .paginate_button {
    border-radius: 8px !important;
    border: 1px solid #E2E8F0 !important;
    margin: 0 4px !important;
    background: #ffffff !important;
    color: #475569 !important;
}

.dataTables_paginate .paginate_button.current {
    background: linear-gradient(135deg, #3B82F6, #2563EB) !important;
    color: #ffffff !important;
    border: none !important;
}

.dataTables_paginate .paginate_button:hover {
    background: #EFF6FF !important;
    color: #2563EB !important;
}

/* =====================================================
   RESPONSIVE
===================================================== */

@media (max-width: 991px) {

    .layout-box-content-format1 .card-header {
        padding: 16px !important;
        flex-wrap: wrap;
        gap: 12px;
    }

    .card-body {
        padding: 16px !important;
    }

    .btn-group .btn {
        width: 100%;
        justify-content: center;
    }

    .customTbl td,
    .customTbl th {
        font-size: 12px !important;
    }
}

@media (max-width: 576px) {

    .layout-box-content-format1 .card-header .card-title {
        font-size: 18px !important;
    }

    .dataTables_filter input,
    .dataTables_length select {
        width: 100% !important;
    }
}

</style>

<section class="layout-box-content-format1">
    <div class="card card-primary list-view">

        <!-- HEADER -->
        <div class="card-header">
            <h3 class="card-title">User List</h3>

            <div class="btn-group btn-group-sm">
                <a href="{{ url('admin/user/addedit') }}" class="btn">
                    <i class="fas fa-plus"></i> Add User
                </a>
            </div>
        </div>

        <!-- BODY -->
        <div class="card-body">
            <div class="table-responsive">

                <table class="table customTbl dataTable dataContainer">

                    <thead>
                        <tr>
                            <th>Sl No.</th>
                            <th>Name</th>
                            <th>User Name</th>
                            <th>Mobile No.</th>
                            <th>Email</th>
                            <th class="text-center">Role</th>
                            <th class="text-center">Status</th>
                            <th class="text-center">Login</th>
                            <th class="text-center">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        <?php $i = 1; foreach ($userList as $user) { ?>

                        <tr id="userRow_{{ $user->id }}">
                            <td>{{ $i++ }}</td>
                            <td><?php echo $user->name; ?></td>
                            <td><?php echo $user->username; ?></td>
                            <td><?php echo $user->mobile_no; ?></td>
                            <td><?php echo $user->email; ?></td>

                            <td class="text-center">
                                <span class="role-badge"><?php echo $user->role->role; ?></span>
                            </td>

                            <td class="text-center">
                                <?php if ($user->is_active == 'Y') { ?>
                                    <a href="{{ url('admin/user/status/N') }}/{{ $user->id }}">
                                        <img src="{{ asset('assets') }}/img/active.png" width="20" />
                                    </a>
                                <?php } else { ?>
                                    <a href="{{ url('admin/user/status/Y') }}/{{ $user->id }}">
                                        <img src="{{ asset('assets/') }}/img/inactive.png" width="20" />
                                    </a>
                                <?php } ?>
                            </td>

                            <td class="text-center">
                                @if ($user->is_online == 'Y')
                                    <img onclick="openUserloginLogoutDetailModal({{ $user->id }});"
                                        src="{{ asset('assets/img/online.png') }}"
                                        width="22" class="cursor-pointer" />
                                @else
                                    <img onclick="openUserloginLogoutDetailModal({{ $user->id }});"
                                        src="{{ asset('assets/img/offline.png') }}"
                                        width="22" class="cursor-pointer" />
                                @endif
                            </td>

                            <td class="text-center">
                                <div class="btn-group btn-group-sm">
                                    <a href="{{ url('admin/user/addedit/') . '/' . $user->id }}" class="btn">
                                        <i class="fas fa-edit"></i>
                                    </a>

                                    <button class="deleteUserBtn" data-id="{{ $user->id }}">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </td>

                        </tr>

                        <?php } ?>
                    </tbody>

                </table>

            </div>
        </div>

    </div>
</section>
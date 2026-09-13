<script src="{{ asset('assets/admin/js/user.js') }}"></script>

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

<style>
.layout-box-content-format1 .card-header {
    background: linear-gradient(135deg, #111827, #2d80f0) !important;
    height: 40px;
}
.layout-box-content-format1 .card-header .card-title {
    line-height: 35px !important;
    letter-spacing: 1.2px;
    text-transform: capitalize;
    color: white !important;
}
/* ===== GLOBAL LIGHT ===== */
body {
    font-family: 'Inter', sans-serif !important;
    background: #F5F7FB !important;
    color: #1E293B !important;
}

/* ===== CARD ===== */
.card {
    border-radius: 14px !important;
    border: 1px solid #E2E8F0 !important;
    background: #FFFFFF !important;
    box-shadow: 0 8px 24px rgba(0,0,0,0.06) !important;
}

/* ===== HEADER ===== */
.card-header {
    background: #FFFFFF !important;
    padding: 18px 22px !important;
    display: flex !important;
    align-items: center !important;
    border-bottom: 1px solid #E5E7EB !important;
}

.card-title {
    color: #0F172A !important;
    font-size: 18px !important;
    font-weight: 600 !important;
}

/* HEADER BUTTON */
.card-header .btn-group {
    margin-left: auto !important;
}

.card-header .btn {
    background: #EFF6FF !important;
    color: #2563EB !important;
    border-radius: 8px !important;
    padding: 6px 14px !important;
    border: 1px solid #BFDBFE !important;
    font-size: 13px !important;
    transition: 0.25s;
}

.card-header .btn:hover {
    background: #2563EB !important;
    color: #fff !important;
}

/* ===== BODY ===== */
.card-body {
    padding: 28px !important;
    background: #FFFFFF !important;
}

/* ===== LABEL ===== */
label {
    font-size: 12px !important;
    font-weight: 500 !important;
    color: #475569 !important;
    margin-bottom: 4px !important;
}

/* ===== INPUT (BOTTOM BORDER STYLE) ===== */
input.form-control,
select.form-control,
textarea.form-control {
    border: none !important;
    border-bottom: 1.5px solid #CBD5E1 !important;
    border-radius: 0 !important;
    background: transparent !important;
    padding: 10px 2px !important;
    font-size: 14px !important;
    color: #0F172A !important;
    transition: all 0.25s ease;
}

/* PLACEHOLDER */
input::placeholder,
textarea::placeholder {
    color: #94A3B8 !important;
}

/* FOCUS EFFECT */
input.form-control:focus,
select.form-control:focus,
textarea.form-control:focus {
    border-bottom: 2px solid #2563EB !important;
    box-shadow: none !important;
    color: #000 !important;
    background: transparent !important;
}

/* AUTOFILL FIX */
input:-webkit-autofill {
    -webkit-box-shadow: 0 0 0 1000px #FFFFFF inset !important;
    -webkit-text-fill-color: #000 !important;
}

/* SPACING */
.row > div {
    margin-bottom: 22px !important;
}

/* ===== IMAGE UPLOAD ===== */
#imagePreview {
    border: 1.5px dashed #CBD5F5 !important;
    border-radius: 12px !important;
    padding: 20px !important;
    background: #F8FAFC !important;
    color: #64748B !important;
    text-align: center !important;
    transition: 0.25s;
}

#imagePreview:hover {
    border-color: #2563EB !important;
    background: #EFF6FF !important;
}

/* ===== TREE ===== */
#myjstree {
    border: 1px solid #E2E8F0 !important;
    border-radius: 10px !important;
    padding: 16px !important;
    background: #FFFFFF !important;
    color: #1E293B !important;
}

/* ===== SECTION TITLE ===== */
h5 {
    color: #1E293B !important;
    font-weight: 600 !important;
    letter-spacing: 0.3px;
}

/* ===== BUTTON ===== */
.action-button {
    background: linear-gradient(135deg, #2563EB, #1D4ED8) !important;
    color: #fff !important;
    border-radius: 10px !important;
    padding: 10px 32px !important;
    font-size: 14px !important;
    font-weight: 500 !important;
    border: none !important;
    transition: all 0.25s ease;
}

.action-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(37,99,235,0.25);
}

/* ===== HR ===== */
hr {
    border-color: #E5E7EB !important;
    margin: 30px 0 !important;
}

</style>
<section class="layout-box-content-format1">
    <div class="card card-primary list-view">

        <!-- HEADER -->
        <div class="card-header">
            <h3 class="card-title">
                User {{ $mode == 'Add' ? 'Create' : 'Edit' }}
            </h3>

            <div class="btn-group">
                <a class="btn" href="/admin/user">
                    <i class="nav-icon fas fa-users"></i> User
                </a>
            </div>
        </div>

        <!-- BODY -->
        <div class="card-body">

            <form name="userForm" id="userForm"
                action="{{ url('admin/user/addeditaction') }}"
                method="post" enctype="multipart/form-data">

                @csrf

                <input type="hidden" name="user_id" value="{{ $id ?? '' }}">
                <input type="hidden" name="mode" value="{{ $mode }}">
                <input type="hidden" name="MenuString" id="MenuString">

                <div class="row">

                    <!-- LEFT -->
                    <div class="col-md-9">
                        <div class="row">

                            <x-input-component column="col-md-6" type="text" label="Name" name="name" id="name"
                                placeholder="Enter name"
                                value="{{ getEditData($mode, $usereditData, 'name') }}" />

                            <x-input-component column="col-md-6" type="text" label="Mobile No" name="mobile_no"
                                id="mobile_no" class="onlynumber"
                                placeholder="Enter mobile no"
                                value="{{ getEditData($mode, $usereditData, 'mobile_no') }}" />

                            <x-input-component column="col-md-6" type="email" label="Email" name="email" id="email"
                                placeholder="Enter email"
                                value="{{ getEditData($mode, $usereditData, 'email') }}" />

                            <x-select-component
                                :data="$roleList"
                                arraykey="id"
                                arrayValue="role"
                                column="col-md-6"
                                label="Employee Type"
                                name="role_id"
                                id="role_id"
                                value="{{ getEditData($mode, $usereditData, 'role_id') }}" />

                        </div>
                    </div>

                    <!-- IMAGE -->
                    <div class="col-md-3">
                        <x-image-component column="col-md-12"
                            label="Profile Image"
                            name="imagefile"
                            id="imagefile"
                            imagePreview="imagePreview"
                            value="{{ getEditData($mode, $usereditData, 'profile_image', asset('storage/users')) }}" />
                    </div>

                    <!-- BOTTOM -->
                    <x-input-component column="col-md-6" type="text" label="Username" name="username" id="username"
                        placeholder="Enter username"
                        value="{{ getEditData($mode, $usereditData, 'username') }}" />

                    <x-input-component column="col-md-3" type="password" label="Password" name="password" id="password"
                        placeholder="Enter password" />

                    <x-input-component column="col-md-3" type="password" label="Confirm Password"
                        name="confirm_password" id="confirm_password"
                        placeholder="Enter confirm password" />

                </div>

                <hr>

                <!-- MENU -->
                <h5 class="mt-4 mb-3">Assign Menu Permissions</h5>

                <div id="myjstree" style="max-height:400px; overflow:auto;">
                    <ul>
                        @foreach ($menulist as $first)
                            <li id="{{ $first->id }}">
                                {{ $first->name }}
                                @if (isset($first->children))
                                    <ul>
                                        @foreach ($first->children as $second)
                                            <li id="{{ $second->id }}">
                                                {{ $second->name }}
                                                @if (isset($second->children))
                                                    <ul>
                                                        @foreach ($second->children as $third)
                                                            <li id="{{ $third->id }}">
                                                                {{ $third->name }}
                                                            </li>
                                                        @endforeach
                                                    </ul>
                                                @endif
                                            </li>
                                        @endforeach
                                    </ul>
                                @endif
                            </li>
                        @endforeach
                    </ul>
                </div>

                <!-- SUBMIT -->
                <div class="text-center mt-4">
                    <button type="submit" class="action-button">
                        {{ $btntext }}
                    </button>
                </div>

            </form>

        </div>
    </div>
</section>

<link rel="stylesheet" href="{{ asset('assets/jstree/themes/default/style.min.css') }}">
<script src="{{ asset('assets/jstree/jstree.js') }}"></script>
<script src="{{ asset('assets/js/customJs/menupermission.js') }}"></script>

<script>
document.addEventListener("DOMContentLoaded", function () {

    $('#myjstree').jstree({
        "plugins": ["checkbox"],
        "core": { "themes": { "icons": false } }
    });

    @if(!empty($userPermittedMenus))
        const permittedMenus = @json($userPermittedMenus);

        $('#myjstree').on('ready.jstree', function() {
            $('#myjstree').jstree('deselect_all', true);
            permittedMenus.forEach(menuId => {
                $('#myjstree').jstree('select_node', menuId, true);
            });
        });
    @endif

    $('#userForm').on('submit', function() {
        if ($('#myjstree').jstree(true)) {
            var selectedMenus = $('#myjstree').jstree("get_selected").join(',');
            $('#MenuString').val(selectedMenus);
        }
    });

});
</script>
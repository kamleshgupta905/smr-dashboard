@if(session()->has('message'))
<script>
    showToast('success', '{{session('message')}}')
</script>
@endif

<section class="layout-box-content-format1">
    <div class="card card-primary list-view">
        <div class="card-header box-shdw">
            <h3 class="card-title">Change Password</h3>

        </div><!-- /.card-header -->
        <form name="passwordForm" id="passwordForm" enctype="multipart/form-data">
            <div class="card-body">
                <div class="formblock-box">
                    @csrf
                    <div class="p-2">
                        <input type="hidden" id="user_id" name="user_id"
                            value="{{ session('surveysAdmin.userId') }}">

                        <div class="">
                            <div class="form-group mb-3 validate-input">
                                <label for="password" class="form-label">Old Password*</label>
                                <input type="password" class="form-control " id="old_password" name="old_password"
                                    autocomplete="off" placeholder="Enter old password" />
                                <div id="old_password_error" class="invalid-feedback d-block error-text"></div>
                            </div>
                        </div>
                        <div class="">
                            <div class="form-group mb-3 validate-input">
                                <label for="password" class="form-label">New Password*</label>
                                <input type="password" class="form-control " id="new_password" name="new_password"
                                    autocomplete="off" placeholder="Enter new password" />
                                <div id="new_password_error" class="invalid-feedback d-block error-text"></div>
                            </div>
                        </div>
                        <div class="">
                            <div class="form-group mb-3 validate-input">
                                <label for="password" class="form-label">Confirm Password*</label>
                                <input type="password" class="form-control " id="confirm_password"
                                    name="confirm_password" autocomplete="off" placeholder="Enter new password" />
                                <div id="confirm_password_error" class="invalid-feedback d-block error-text"></div>
                            </div>
                        </div>

                        <div class=" mt-2 ">
                            <div class="form-group mt-4 ">
                                <button type="submit" class="btn btn-sm action-button" id="savebtn">Update</button>
                            </div>
                        </div>
                    </div>
                </div><!-- /.card -->
            </div>
        </form>
    </div>
</section>

<script src="{{ asset('assets/admin/') }}/js/change-password.js"></script>

$(function () {
    var base_url = $("#base_url").val() || "";
    var mode = $("#mode").val() || "Add";
    var csrfToken = $('meta[name="csrf-token"]').attr("content") || "";

    var vendorData = {}; // Temp data storage for tab flow

    /* -------------------------
       Prevent clicking disabled tabs
       ------------------------- */
    $(document).on("click", ".nav-link.disabled", function (e) {
        // Only restrict tab switching in ADD mode
        if (mode.toLowerCase() === "add") {
            e.preventDefault();
        } 
        // In EDIT mode tabs should open freely
    });
    if (mode.toLowerCase() === "edit") {
        $(".nav-link").removeClass("disabled").attr("aria-disabled", "false");
    }

    /* -------------------------
       Contacts add/remove
       ------------------------- */
    var contactIndex = $("#contacts-container .contact-row").length || 0;

    $(document).on("click", "#addContactBtn", function (e) {
        e.preventDefault();
        var idx = contactIndex;
        var html = `
            <div class="contact-row row align-items-end mb-2">
                <div class="col-md-3">
                    <label>Name</label>
                    <input type="text" name="contacts[${idx}][name]" class="form-control" placeholder="Contact Name">
                </div>
                <div class="col-md-3">
                    <label>Email</label>
                    <input type="email" name="contacts[${idx}][email]" class="form-control" placeholder="Contact Email">
                </div>
                <div class="col-md-3">
                    <label>Phone</label>
                    <input type="text" name="contacts[${idx}][phone]" class="form-control" placeholder="Phone">
                </div>
                <div class="col-md-2">
                    <div class="form-check">
                        <input type="radio" name="primary_contact" value="${idx}" class="form-check-input">
                        <label class="form-check-label">Primary</label>
                    </div>
                </div>
                <div class="col-md-1 text-right">
                    <button type="button" class="btn btn-danger btn-sm remove-contact">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>`;
        $("#contacts-container").append(html);
        contactIndex++;
    });

    $(document).on("click", ".remove-contact", function (e) {
        e.preventDefault();
        $(this).closest(".contact-row").remove();
        reindexContacts();
    });

    function reindexContacts() {
        $("#contacts-container .contact-row").each(function (i, el) {
            $(el).find("input,select,textarea").each(function () {
                var name = $(this).attr("name");
                if (!name) return;
                var matches = name.match(/^contacts\[(\d+)\]\[(.+)\]$/);
                if (matches) {
                    var newName = "contacts[" + i + "][" + matches[2] + "]";
                    $(this).attr("name", newName);
                }
            });
            $(el).find("input[type=radio][name='primary_contact']").val(i);
        });
        contactIndex = $("#contacts-container .contact-row").length;
    }

    /* -------------------------
       Commission toggle
       ------------------------- */
   // Keep both boxes visible and toggle input disabled state
        function updateCommissionFields() {
            // show both boxes (in case server rendered d-none)
            $("#revenue_share_box, #flat_rate_box").removeClass("d-none");

            // disable all inputs inside boxes initially
            $("#revenue_share_box").find("input,select,textarea,button").prop("disabled", true);
            $("#flat_rate_box").find("input,select,textarea,button").prop("disabled", true);

            // enable the inputs for the selected commission type
            var type = $("input[name='commission_type']:checked").val();
            if (type === "revenue_share") {
                $("#revenue_share_box").find("input,select,textarea,button").prop("disabled", false);
            } else if (type === "flat_rate") {
                $("#flat_rate_box").find("input,select,textarea,button").prop("disabled", false);
            }
        }

        // run on change
        $(document).on("change", "input[name='commission_type']", function () {
            updateCommissionFields();
        });

        // run on page load (handles edit mode)
        $(document).ready(function () {
            updateCommissionFields();
        });


    /* -------------------------
       Dual-select handlers
       ------------------------- */
    function moveOption(optionEl, targetSelector) {
        var $opt = $(optionEl);
        var val = $opt.val();
        var txt = $opt.text();
        $opt.remove();
        var $target = $(targetSelector);
        if ($target.find("option[value='" + val + "']").length === 0) {
            $target.append($("<option>").val(val).text(txt));
        }
    }

    $("#country_list").on("dblclick", "option", function () { moveOption(this, "#selected_countries"); });
    $("#selected_countries").on("dblclick", "option", function () { moveOption(this, "#country_list"); });
    $("#clients_list").on("dblclick", "option", function () { moveOption(this, "#blocked_clients"); });
    $("#blocked_clients").on("dblclick", "option", function () { moveOption(this, "#clients_list"); });

    $(document).on("click", "#country_right", function () {
        $("#country_list option:selected").each(function () { moveOption(this, "#selected_countries"); });
    });
    $(document).on("click", "#country_left", function () {
        $("#selected_countries option:selected").each(function () { moveOption(this, "#country_list"); });
    });
    $(document).on("click", "#client_right", function () {
        $("#clients_list option:selected").each(function () { moveOption(this, "#blocked_clients"); });
    });
    $(document).on("click", "#client_left", function () {
        $("#blocked_clients option:selected").each(function () { moveOption(this, "#clients_list"); });
    });

    /* -------------------------
       Save & Continue
       ------------------------- */
   /* -------------------------
   Save & Continue (FIXED TAB FLOW)
   ------------------------- */
$("#saveBasicBtn").on("click", function (e) {
    e.preventDefault();

    vendorData = Object.assign({}, vendorData, collectBasicData());
    showToast("success", "Basic details saved");

    // Enable Settings tab
    $("#settings-tab")
        .removeClass("disabled")
        .attr("aria-disabled", "false");

    // Properly switch tab
    $(".nav-tabs a[href='#settings']").tab("show");
});

$("#saveSettingsBtn").on("click", function (e) {
    e.preventDefault();

    vendorData = Object.assign({}, vendorData, collectSettingsData());
    showToast("success", "Settings saved");

    // Enable Redirect tab
    $("#redirect-tab")
        .removeClass("disabled")
        .attr("aria-disabled", "false");

    // Properly switch tab
    $(".nav-tabs a[href='#redirect']").tab("show");
});


    /* -------------------------
       FINAL SAVE (Fixed for arrays)
       ------------------------- */
    $("#finalSaveBtn").on("click", function (e) {
        e.preventDefault();
        vendorData = Object.assign({}, vendorData, collectRedirectData());

        var formData = new FormData();

        for (var key in vendorData) {
            if (Array.isArray(vendorData[key])) {
                vendorData[key].forEach((value, i) => {
                    if (typeof value === "object") {
                        for (var subkey in value) {
                            formData.append(`${key}[${i}][${subkey}]`, value[subkey]);
                        }
                    } else {
                        formData.append(`${key}[${i}]`, value);
                    }
                });
            } else {
                formData.append(key, vendorData[key]);
            }
        }

        $.ajax({
            url: base_url + "/admin/vendoraddeditajax",
            type: "POST",
            headers: { "X-CSRF-TOKEN": csrfToken },
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                if (response.msg_status == 1) {
                    showToast("success", "Supplier Save Successfully!");
                    setTimeout(function () {
                        window.location.href = base_url + "/admin/vendor";
                    }, 800);
                } else {
                    showToast("error", response.message || "Save failed.");
                    console.log(response);
                }
            },
            error: function (xhr) {
                showToast("error", "Server error while saving.");
                console.error(xhr.responseText || xhr);
            }
        });
    });

    /* -------------------------
       Collectors
       ------------------------- */
    function collectBasicData() {
        reindexContacts();
        var contacts = $("#contacts-container .contact-row").map(function () {
            return {
                name: $(this).find("input[name*='[name]']").val() || '',
                email: $(this).find("input[name*='[email]']").val() || '',
                phone: $(this).find("input[name*='[phone]']").val() || ''
            };
        }).get();

        return {
            id: $("#id").val(),
            mode: $("#mode").val(),
            name: $("#name").val(),
            email: $("#email").val(),
            currency: $("#currency").val(),
            is_api_supplier: $("#is_api_supplier").is(":checked") ? 1 : 0,
            commission_type: $("input[name='commission_type']:checked").val() || '',
            cpi_percentage: $("#cpi_percentage").val() || '',
            per_complete: $("#per_complete").val() || '',
            monthly_cap: $("#monthly_cap").val() || '',
            contacts: contacts,
            primary_contact: $("input[name='primary_contact']:checked").val() || null
        };
    }

    function collectSettingsData() {
        return {
            project_type: $("#project_type").val() || '',
            audience_type: $("#audience_type").val() || '',
            block_pii: $("#block_pii").is(":checked") ? 1 : 0,
            selected_countries: $("#selected_countries option").map(function () { return $(this).val(); }).get(),
            blocked_clients: $("#blocked_clients option").map(function () { return $(this).val(); }).get()
        };
    }

    function collectRedirectData() {
        return {
            encryption_method: $("input[name='encryption_method']:checked").val() || '',
            redirect_success_url: $("input[name='redirect_success_url']").val() || '',
            redirect_fail_url: $("input[name='redirect_fail_url']").val() || '',
            redirect_over_quota_url: $("input[name='redirect_over_quota_url']").val() || '',
            redirect_quality_termination_url: $("input[name='redirect_quality_termination_url']").val() || '',
            redirect_postback_success_url: $("input[name='redirect_postback_success_url']").val() || ''
        };
    }

    /* -------------------------
       Generate API Key
       ------------------------- */
    $(document).on("click", "#generateApiKeyBtn", function (e) {
        e.preventDefault();
        var key = generateKey(32);
        showToast("success", "Generated Key: " + key);
        if ($("#api_key").length) $("#api_key").val(key);
    });

    function generateKey(len) {
        var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        var out = "";
        for (var i = 0; i < (len || 32); i++) {
            out += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return out;
    }

    /* -------------------------
       Helpers
       ------------------------- */
    function showToast(type, message) {
        if (typeof toastr !== "undefined") {
            if (type === "error") toastr.error(message);
            else if (type === "warning") toastr.warning(message);
            else toastr.success(message);
        } else {
            alert(message);
        }
    }

    if ($.fn.select2) {
        $(".select2").select2({ theme: "bootstrap4", width: "100%" });
    }
});

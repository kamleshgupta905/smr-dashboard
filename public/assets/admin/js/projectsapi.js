// projects.js (enhanced version with auto-fill redirect URLs)
$(function () {
    var base_url = $("#base_url").val() || "";
    var mode = $("#mode").val() || "";
    loadVendorList();

    // Object to store data from all tabs while user navigates
    var projectData = {
        info: {},
        notes: {},
        redirect: {}
    };
$("#duplicate").click(function (e) {
        e.preventDefault();
        var id = $(this).data("id");
        var urlpath = base_url + "/admin/project/duplicate";
        var csrfToken = $('meta[name="csrf-token"]').attr("content");

        swal({
            title: "Are you sure?",
            text: "Do you really want to duplicate this project?",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then((willDuplicate) => {
            if (willDuplicate) {
                $("#duplicate").text("Processing...");
                $("#duplicate").prop("disabled", true);
                $.ajax({
                    type: "POST",
                    url: urlpath,
                    data: { id: id },
                    headers: {
                        "X-CSRF-TOKEN": csrfToken,
                    },
                    success: function (response) {
                        if (response.status) {
                            window.location.href = `${base_url}/admin/project/addedit/${response.insertedid}`;
                        }
                        $("#duplicate").text("Duplicate");
                        $("#duplicate").prop("disabled", false);
                    },
                    error: function (xhr, status, error) {
                        console.error("Error duplicating project:", error);
                        $("#duplicate").text("Duplicate");
                        $("#duplicate").prop("disabled", false);
                    },
                });
            }
        });
    });$("#duplicate").click(function (e) {
        e.preventDefault();
        var id = $(this).data("id");
        var urlpath = base_url + "/admin/project/duplicate";
        var csrfToken = $('meta[name="csrf-token"]').attr("content");

        swal({
            title: "Are you sure?",
            text: "Do you really want to duplicate this project?",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        }).then((willDuplicate) => {
            if (willDuplicate) {
                $("#duplicate").text("Processing...");
                $("#duplicate").prop("disabled", true);
                $.ajax({
                    type: "POST",
                    url: urlpath,
                    data: { id: id },
                    headers: {
                        "X-CSRF-TOKEN": csrfToken,
                    },
                    success: function (response) {
                        if (response.status) {
                            window.location.href = `${base_url}/admin/project/addedit/${response.insertedid}`;
                        }
                        $("#duplicate").text("Duplicate");
                        $("#duplicate").prop("disabled", false);
                    },
                    error: function (xhr, status, error) {
                        console.error("Error duplicating project:", error);
                        $("#duplicate").text("Duplicate");
                        $("#duplicate").prop("disabled", false);
                    },
                });
            }
        });
    });
    // -------------------------------
    // Helper: get current active tab id
    // -------------------------------
    function getActiveTabId() {
        var $activeTabPane = $(".tab-content .tab-pane.active, .tab-content .tab-pane.show.active").first();
        if ($activeTabPane.length) return $activeTabPane.attr("id");
        return $(".tab-content .tab-pane:visible").first().attr("id");
    }

    // -----------------------
    // Continue buttons
    // -----------------------
    $(document).on('click', '.continue-btn', function (e) {
        e.preventDefault();
        var currentTabMarker = $(this).data("tab") || getActiveTabId();
        handleContinueFrom(currentTabMarker);
    });
 $("#project-status").click(function (e) {
        e.preventDefault();
        var id = $(this).data("id");
        var icon = $(this).find("i");
        var urlpath = base_url + "/admin/project/status";
        var csrfToken = $('meta[name="csrf-token"]').attr("content");

        $.ajax({
            type: "POST",
            url: urlpath,
            data: { id: id },
            headers: {
                "X-CSRF-TOKEN": csrfToken,
            },
            success: function (response) {
                if (response.status === "Live") {
                    icon.removeClass("fa-play").addClass("fa-pause");
                    $("#status")
                        .removeClass("Pause-status")
                        .addClass("Live-status")
                        .text("Live");
                } else {
                    icon.removeClass("fa-pause").addClass("fa-play");
                    $("#status")
                        .removeClass("Live-status")
                        .addClass("Pause-status")
                        .text("Pause");
                }
                showToast("success", response.message);
            },
            error: function (xhr, status, error) {
                console.error("Error updating question status:", error);
            },
        });
    });
    // -----------------------
    // Form submit (handles final tab save)
    // -----------------------
    $(document).on('submit', '#projectForm', function (e) {
        e.preventDefault();

        var activeTab = getActiveTabId();

        if (activeTab === "tabInfo") {
            if (!validateInfoTab()) return;
            projectData.info = collectInfoTabData();
            activateTab("tabNotes");
            return;
        }

        if (activeTab === "tabNotes") {
            if (!validateNotesTab()) return;
            projectData.notes = collectNotesTabData();
            activateTab("tabRedirect");
            return;
        }

        if (activeTab === "tabRedirect") {
            if (!validateRedirectTab()) return;
            projectData.redirect = collectRedirectTabData();
            saveAllData(projectData);
            return;
        }

        saveAllData(projectData);
    });

    // -------------------------------
    // Continue handler (step logic)
    // -------------------------------
    function handleContinueFrom(marker) {
        var normalized = marker;
        if (marker === "info" || marker === "tab-info" || marker === "tabInfo") normalized = "tabInfo";
        if (marker === "notes" || marker === "tab-notes" || marker === "tabNotes") normalized = "tabNotes";
        if (marker === "redirect" || marker === "tab-redirect" || marker === "tabRedirect") normalized = "tabRedirect";

        if (normalized === "tabInfo") {
            if (!validateInfoTab()) return;
            projectData.info = collectInfoTabData();
            activateTab("tabNotes");
            return;
        }

        if (normalized === "tabNotes") {
            if (!validateNotesTab()) return;
            projectData.notes = collectNotesTabData();
            activateTab("tabRedirect");
            return;
        }

        if (normalized === "tabRedirect") {
            if (!validateRedirectTab()) return;
            projectData.redirect = collectRedirectTabData();
            saveAllData(projectData);
            return;
        }
    }

    // -------------------------------
    // Activate a tab by ID
    // -------------------------------
    function activateTab(tabPaneId) {
        var $link = $('#projectTabs a[href="#' + tabPaneId + '"]');
        if ($link.length) {
            $link.tab('show');
        } else {
            $(".tab-pane").removeClass("active show");
            $("#" + tabPaneId).addClass("active show");
        }
    }

    // -------------------------------
    // Collect data functions
    // -------------------------------
    function collectInfoTabData() {
        return {
            client_id: $("#client_id").val(),
            client_contact_id: $("#client_contact_id").val ? $("#client_contact_id").val() : null,
            name: $("#name").val(),
            project_type: $("#project_type").val ? $("#project_type").val() : null,
            category: $("#category").val(),
            audience_type: $("#audience_type").val ? $("#audience_type").val() : null,
            currency: $("#currency").val ? $("#currency").val() : null,
            sales_rep: $("#sales_rep").val(),
            pm_user: $("#pm_user").val(),
            sub_pm_user: $("#sub_pm_user").val ? $("#sub_pm_user").val() : null,
            start_date: $("#start_date").val(),
            no_of_days: $("#no_of_days").val(),
            email_reference: $("#email_reference").val(),
            cost_per_complete: $("#cost_per_complete").val(),
            max_limit: $("#max_limit").val(),
            loi: $("#loi").val(),
            ir: $("#ir").val(),
            // description: (typeof CKEDITOR !== "undefined" && CKEDITOR.instances["description"])
            //     ? CKEDITOR.instances["description"].getData()
            //     : $("#description").val()
        };
    }

    function collectNotesTabData() {
        return { notes: $("#notes").val() };
    }

    function collectRedirectTabData() {
        return {
            redirect_success: $("#redirect_success").val(),
            redirect_termination: $("#redirect_termination").val(),
            redirect_quota: $("#redirect_quota").val(),
            redirect_quality: $("#redirect_quality").val()
        };
    }

    // -------------------------------
    // Validation
    // -------------------------------
    function validateInfoTab() {
        var valid = true;
        $(".error-text").text("");

        if (!$("#client_id").val()) {
            $("#client_id_error").text("Please select a client");
            valid = false;
        }
        if (!$("#name").val()) {
            $("#name_error").text("Project name is required");
            valid = false;
        }
        if (!$("#cost_per_complete").val()) {
            $("#cost_per_complete_error").text("CPI is required");
            valid = false;
        }
        if (!$("#max_limit").val()) {
            $("#max_limit_error").text("Max limit required");
            valid = false;
        }
        if (!$("#loi").val()) {
            $("#loi_error").text("LOI is required");
            valid = false;
        }
        if (!$("#ir").val()) {
            $("#ir_error").text("IR is required");
            valid = false;
        }
        return valid;
    }

    function validateNotesTab() {
        return true; // notes optional
    }

    function validateRedirectTab() {
        var valid = true;
        if ($("#redirect_success").length && !$("#redirect_success").val()) {
            $("#redirect_success_error").text("Complete URL required");
            valid = false;
        }
        return valid;
    }

    // -------------------------------
    // Save data (final AJAX submit)
    // -------------------------------
    function saveAllData(projectData) {
        var csrfToken = $('meta[name="csrf-token"]').attr("content");
        var urlpath = base_url + "/admin/projectaddeditajax";

        var finalData = {
            bid_id: $("#bid_id").val() || null,
            id: $("#id").val() || null,
            mode: $("#mode").val() || mode,
            ...projectData.info,
            ...projectData.notes,
            ...projectData.redirect,
            _token: csrfToken
        };

        console.log("Final payload:", finalData);

        $("#savebtn").prop("disabled", true).text("Saving...");

        $.ajax({
            url: urlpath,
            type: "POST",
            data: finalData,
            headers: { "X-CSRF-TOKEN": csrfToken },
            success: function (response) {
                $("#savebtn").prop("disabled", false).text("Save");
                if (response && response.msg_status == 1) {
                    showToast("success", "Project successfully saved.");
                    setTimeout(function () {
                        window.location.href = base_url + "/admin/projects";
                    }, 900);
                } else if (response && response.errors) {
                    Object.keys(response.errors).forEach(function (k) {
                        $("#" + k + "_error").text(response.errors[k]);
                    });
                } else {
                    showToast("error", response.message || "Something went wrong.");
                }
            },
            error: function (xhr) {
                $("#savebtn").prop("disabled", false).text("Save");
                console.error("Save error:", xhr.responseText);
                showToast("error", "Request failed — check console.");
            }
        });
    }

    // -------------------------------
    // Auto-fill Redirect URLs (New Section)
    // -------------------------------
    function updateRedirectUrls(clientId) {
        if (!clientId) return;

        let projectId = $("#id").val() || "{project_id}";
        $("#redirect_success").val(`${base_url}/redirects/c/${clientId}/complete`);
        $("#redirect_termination").val(`${base_url}/redirects/c/${clientId}/terminate`);
        $("#redirect_quota").val(`${base_url}/redirects/c/${clientId}/quotafull`);
        $("#redirect_quality").val(`${base_url}/vendor/auth/{vendor_id}/project/${projectId}`);
    }

    // Auto-fill on client change
    $("#client_id").on("change", function () {
        let clientId = $(this).val();
        updateRedirectUrls(clientId);
    });

    // On Add mode, pre-fill placeholders if empty
    if (mode === "Add") {
        let clientId = $("#client_id").val();
        if (clientId) {
            updateRedirectUrls(clientId);
        } else {
            $("#redirect_success").val(`${base_url}/redirects/c/{client_id}/complete`);
            $("#redirect_termination").val(`${base_url}/redirects/c/{client_id}/terminate`);
            $("#redirect_quota").val(`${base_url}/redirects/c/{client_id}/quotafull`);
            $("#redirect_quality").val(`${base_url}/vendor/auth/{vendor_id}/project/{project_id}`);
        }
    }

    // -------------------------------
    // Prevent switching tabs before Info completed
    // -------------------------------
    $('#projectTabs a').on('show.bs.tab', function (e) {
        var targetHref = $(e.target).attr('href');
        if ((targetHref === '#tabNotes' || targetHref === '#tabRedirect') &&
            (!projectData.info || !projectData.info.name)) {
            e.preventDefault();
            showToast('info', 'Please fill and save the Info tab first.');
            return false;
        }
    });
    // =======================
// CLIENT NAME → CONTACT SYNC
// =======================

// When client name changes, show only that name in the contact list
$(document).on('change', '#client_id', function () {
    var selectedText = $("#client_id option:selected").text().trim();
    var $contactSelect = $("#client_contact_id");

    $contactSelect.empty(); // Clear old options
    $contactSelect.append('<option value="">Select</option>');

    if (selectedText) {
        // Add only the chosen client name to contact dropdown
        $contactSelect.append('<option value="' + selectedText + '">' + selectedText + '</option>');
    }
});
$(document).on('change', '#client_id', function () {
    let clientId = $(this).val();
alert(clientId);
    if (clientId === '') {
        $('#client_contact_id').html('<option value="">Select</option>').trigger('change');
        $('#sales_rep').val('');
        return;
    }

    $.ajax({
        url: `/admin/project/get-contacts/${clientId}`,
        type: 'GET',
        success: function (response) {

            // 1. Populate Client Contacts
            let options = '<option value="">Select</option>';
            if (response.all_contacts.length > 0) {
                response.all_contacts.forEach(function (contact) {
                    options += `<option value="${contact.id}" ${response.primary_contact && response.primary_contact.id == contact.id ? 'selected' : ''}>
                                 ${contact.name} ${contact.email ? '('+contact.email+')' : ''}
                               </option>`;
                });
            }

            $('#client_contact_id').html(options).trigger('change');

            if (response.sales_rep && response.sales_rep.name) {
                    $('#sales_rep').val(response.sales_rep.name);
            } else {
                $('#sales_rep').val('');
            }
        }
    });
});
 $("#assignVendorModel").on("hidden.bs.modal", function () {
        $("#assign_vendor_id").empty();
    });

   $("#assignbtn").click(function () {
    var urlpath = base_url + "/admin/vendordropdownajax";

    enableAssignButton("#assignbtn", true);

    $.ajax({
        url: urlpath,
        type: "GET",
        dataType: "json",

        success: function (response) {

            if (response && response.vendorList) {

                // Purana data clear karo
                $("#assign_vendor_id").html("");

                $.each(response.vendorList, function (index, vendor) {
                    $("#assign_vendor_id").append(
                        '<option value="' +
                            vendor.id +
                            '">' +
                            vendor.name +
                            "</option>"
                    );
                });

                enableAssignButton("#assignbtn", false);

                // OLD WRONG CODE
                // $("#assign_vendor_id").selectpicker("refresh");

                // NEW CORRECT CODE (SELECT2)
                if ($("#assign_vendor_id").hasClass("select2-hidden-accessible")) {
                    $("#assign_vendor_id").select2("destroy");
                }

                $("#assign_vendor_id").select2({
                    dropdownParent: $("#assignVendorModel"),
                    width: "100%",
                    placeholder: "Select Vendor",
                    allowClear: true
                });

                // Modal open
                $("#assignVendorModel").modal("show");
            }
        },

        error: function (xhr, status, error) {
            enableAssignButton("#assignbtn", false);
            console.error("Error fetching vendor list:", error);
        }
    });
});

    $(document).on("submit", "#vendorAssignForm", function (e) {
        e.preventDefault();

        var formData = new FormData($(this)[0]);
        var csrfToken = $('meta[name="csrf-token"]').attr("content");

        var type = "POST";
        var urlpath = base_url + "/admin/vendorassignajax";

        $("#successmsg").text("");
        $("#errormsg").text("");
        enableAssignButton("#assignVendorButton", true);

        $.ajax({
            url: urlpath,
            type: type,
            data: formData,
            processData: false,
            contentType: false,
            headers: {
                "X-CSRF-TOKEN": csrfToken,
            },
            success: function (response) {
                if (!$.isEmptyObject(response.errors)) {
                    $.each(response.errors, function (key, value) {
                        $("#" + key + "_error").text(value);
                        $("#" + key).css("border", "1px solid red");
                        $("#" + key)
                            .siblings(".select2-container")
                            .find(".select2-selection")
                            .css("border", "1px solid red");
                    });
                }

                if (response.status) {
                    loadVendorList();
                    showToast("success", "Vendors successfully assigned.");
                    $("#assignVendorModel").modal("hide");
                }

                enableAssignButton("#assignVendorButton", false);
            },
            error: function (xhr) {
                console.log(xhr.responseText);
            },
        });
    });

});
function enableAssignButton(btn, status) {
    var text = status == true ? "Processing..." : "Assign Vendor";
    $(btn)
        .html(`${text} <svg fill="currentColor" viewBox="0 0 24 24" class="icon">
    <path clip-rule="evenodd"
        d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm4.28 10.28a.75.75 0 000-1.06l-3-3a.75.75 0 10-1.06 1.06l1.72 1.72H8.25a.75.75 0 000 1.5h5.69l-1.72 1.72a.75.75 0 101.06 1.06l3-3z"
        fill-rule="evenodd"></path>
    </svg>`);
    $(btn).prop("disabled", status);
}

function loadVendorList() {
   
    $("#vendor_list").html("");
    $("#loader").show();

    var base_url = $("#base_url").val();
    var csrfToken = $('meta[name="csrf-token"]').attr("content");
    var project_id = $("#project_id").val();

    $.ajax({
        type: "POST",
        data: { project_id: project_id },
        url: base_url + "/admin/loadvendorlistajax",
        dataType: "html",
        headers: {
            "X-CSRF-TOKEN": csrfToken,
        },
        success: function (response) {
            $("#loader").hide();
            $("#vendor_list").html(response);
            $(".dataTable").DataTable({
                paging: false,
            });
        },
        error: function (xhr) {
            console.log(xhr.responseText);
        },
    });
}

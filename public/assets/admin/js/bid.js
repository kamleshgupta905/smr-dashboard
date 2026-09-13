// =====================================================
// BID.JS – Handles Bid Creation, Options, and Booking
// =====================================================
function getBidId() {
    return document.querySelector('#bid_id')?.value || '';
}
 function updateSerialNumbers() {
    const rows = document.querySelectorAll('#bidOptionsBody tr');
    rows.forEach((row, index) => {
        let serialCell = row.querySelector('.serial-no');
        if (serialCell) {
            serialCell.textContent = index + 1;
        }
    });
}
$(document).on('click', '.deleteRow', function () {
    $(this).closest('tr').remove();
    updateSerialNumbers();
});

document.addEventListener('DOMContentLoaded', function () {

    console.log("✅ bid.js loaded successfully");

    // State
    let currentBidId = document.getElementById('bid_id')?.value || null;
    let isSpecSaved = !!currentBidId;

    // track last saved option ids (for book action)
    let lastSavedOptionIds = [];

    // Elements
    const specTab = document.querySelector('#spec-tab');
    const optionsTab = document.querySelector('#options-tab');
    const bookingTab = document.querySelector('#booking-tab');

    const clientSelect = document.querySelector('#client_id');
    const salesRepInput = document.querySelector('#sales_rep');
    const clientContactSelect = document.querySelector('#client_contact');
    const createdByInput = document.querySelector('#created_by');

    const bidInfoHeader = document.getElementById('bidInfoHeader');
    const bidNumberDisplay = document.getElementById('bidNumberDisplay');
    const blockValueDisplay = document.getElementById('blockValueDisplay');
    const bidValueDisplay = document.getElementById('bidValueDisplay');
    const createdDateDisplay = document.getElementById('createdDateDisplay');

    const addBidRowBtn = document.getElementById('addBidRow');
    const saveBidOptionsBtn = document.getElementById('saveBidOptions');
    const bookSelectedBtn = document.getElementById('bookSelected');
    const bidOptionsBody = document.getElementById('bidOptionsBody');
    const selectAllOptions = document.getElementById('selectAllOptions');

    const bookingBody = document.getElementById('bookingBody');
    const saveBookingBtn = document.getElementById('saveBookingBtn');
    const sendBookingBtn = document.getElementById('sendBookingBtn');
    const bookingBidNumber = document.getElementById('bookingBidNumber');
    const bidNumberOnBtn = document.getElementById('bidNumberOnBtn');

    // If spec not saved, visually disable tabs (but still present)
    if (!isSpecSaved) {
        optionsTab?.classList.add('disabled');
        bookingTab?.classList.add('disabled');
    }

    // Prevent switching tabs before saving spec
    document.querySelectorAll('#bidTabs .nav-link').forEach(tab => {
        tab.addEventListener('click', function (e) {
            if (!isSpecSaved && this.id !== 'spec-tab') {
                e.preventDefault();
                showToast('info', 'Please save Specifications first!');
            }
        });
    });

    // Ensure Created By read-only
    if (createdByInput) createdByInput.readOnly = true;

    // -------------------------
    // Client change behaviour
    // -------------------------
    // jQuery-based quick handler if select2 / jQuery exists
    // if (window.jQuery && $('#client_id').length) {
    //     $('#client_id').on('change', function () {
    //         const selectedOption = $(this).find('option:selected');
    //         const clientId = selectedOption.val();
    //         const clientName = selectedOption.data('client-name') || selectedOption.text();

    //         if (salesRepInput) salesRepInput.value = clientName || '';

    //         // update client_contact list quickly with single option then try fetch
    //         if (clientContactSelect) {
    //             clientContactSelect.innerHTML = '<option value="">Loading...</option>';
    //         }

    //         if (!clientId) {
    //             if (clientContactSelect) clientContactSelect.innerHTML = '<option value="">Select Contact</option>';
    //             return;
    //         }

    //         // fetch detailed contacts from backend if endpoint exists
    //         fetch(`/admin/clients/${clientId}/contacts`, {
    //             headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content }
    //         })
    //         .then(r => r.json())
    //         .then(json => {
    //             clientContactSelect.innerHTML = '<option value="">Select Contact</option>';
    //             if (Array.isArray(json.contacts) && json.contacts.length) {
    //                 json.contacts.forEach(c => {
    //                     const o = document.createElement('option');
    //                     o.value = c.id;
    //                     o.textContent = c.name + (c.email ? ` (${c.email})` : '');
    //                     clientContactSelect.appendChild(o);
    //                 });
    //             } else {
    //                 const o = document.createElement('option');
    //                 o.value = clientId;
    //                 o.textContent = clientName;
    //                 clientContactSelect.appendChild(o);
    //             }
    //             if (window.jQuery && $(clientContactSelect).data('select2')) $(clientContactSelect).trigger('change.select2');
    //         })
    //         .catch(err => {
    //             // fallback
    //             clientContactSelect.innerHTML = `<option value="${clientId}">${clientName}</option>`;
    //             if (window.jQuery && $(clientContactSelect).data('select2')) $(clientContactSelect).trigger('change.select2');
    //         });
    //     });

    //     // trigger on load (edit mode)
    //     if ($('#client_id').val()) $('#client_id').trigger('change');
    // } else {
    //     // pure JS fallback
    //     clientSelect?.addEventListener('change', function () {
    //         const selectedOption = this.options[this.selectedIndex];
    //         const clientId = selectedOption?.value || '';
    //         const clientName = selectedOption?.dataset?.clientName || selectedOption?.textContent || '';
    //         if (salesRepInput) salesRepInput.value = clientName;
    //         if (!clientId) {
    //             clientContactSelect.innerHTML = '<option value="">Select Contact</option>';
    //             return;
    //         }
    //         clientContactSelect.innerHTML = '<option>Loading...</option>';
    //         fetch(`/admin/clients/${clientId}/contacts`, {
    //             headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content }
    //         })
    //         .then(r => r.json())
    //         .then(json => {
    //             clientContactSelect.innerHTML = '<option value="">Select Contact</option>';
    //             if (Array.isArray(json.contacts) && json.contacts.length) {
    //                 json.contacts.forEach(c => {
    //                     const o = document.createElement('option');
    //                     o.value = c.id;
    //                     o.textContent = c.name + (c.email ? ` (${c.email})` : '');
    //                     clientContactSelect.appendChild(o);
    //                 });
    //             } else {
    //                 clientContactSelect.innerHTML = `<option value="${clientId}">${clientName}</option>`;
    //             }
    //         })
    //         .catch(() => {
    //             clientContactSelect.innerHTML = `<option value="${clientId}">${clientName}</option>`;
    //         });
    //     });

    //     if (clientSelect && clientSelect.value) clientSelect.dispatchEvent(new Event('change'));
    // }
// -------------------------
// UPDATED: Client change behaviour
// -------------------------
if (window.jQuery && $('#client_id').length) {

    const clientContactSelect = document.getElementById('client_contact');
    const salesRepInput = document.getElementById('sales_rep'); // Sales Rep input field

    $('#client_id').on('change', function () {
        const selectedOption = $(this).find('option:selected');
        const clientId = selectedOption.val();
        const clientName = selectedOption.data('client-name') || selectedOption.text();

        // Reset Sales Rep initially
        if (salesRepInput) salesRepInput.value = '';

        // Reset dropdown
        if (clientContactSelect) {
            clientContactSelect.innerHTML = '<option value="">Loading...</option>';
        }

        // No client selected
        if (!clientId) {
            clientContactSelect.innerHTML = '<option value="">Select Contact</option>';
            return;
        }

        // Fetch contacts + sales rep
        fetch(`/admin/client/get-contacts/${clientId}`, {
            method: "GET",
            headers: {
                "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').content
            }
        })
        .then(r => r.json())
        .then(data => {

            const contacts = data.contacts || [];
            const salesRepName = data.sales_rep || '';

            // ✅ Set Sales Rep Name
            if (salesRepInput) {
                salesRepInput.value = salesRepName;
            }

            clientContactSelect.innerHTML = '<option value="">Select Contact</option>';

            if (Array.isArray(contacts) && contacts.length > 0) {
                contacts.forEach(c => {
                    const o = document.createElement("option");
                    o.value = c.id;
                    o.textContent = `${c.name} ${c.phone ? "(" + c.phone + ")" : ""}`;
                    clientContactSelect.appendChild(o);
                });
            } else {
                // Fallback if no contacts
                const o = document.createElement("option");
                o.value = clientId;
                o.textContent = clientName;
                clientContactSelect.appendChild(o);
            }

            // Preselect stored value in edit mode
            const existing = clientContactSelect.dataset.selected;
            if (existing) {
                $(clientContactSelect).val(existing).trigger('change');
            }

            // Refresh Select2
            $('#client_contact').trigger('change.select2');
        })
        .catch(err => {
            console.warn("Contact fetch failed", err);
            clientContactSelect.innerHTML = `<option value="${clientId}">${clientName}</option>`;
        });
    });

    // Trigger on page load (edit mode)
    if ($('#client_id').val()) $('#client_id').trigger('change');
}



    // -------------------------
    // Add Bid Row (device options updated)
    // -------------------------
    // addBidRowBtn?.addEventListener('click', function () {
    //     const tbody = bidOptionsBody;
    //     const tr = document.createElement('tr');

    //     tr.innerHTML = `
    //         <td class="text-center"><input type="checkbox" class="option-select" checked></td>
    //         <td class="text-center">—</td>
    //         <td>
    //             <select class="form-select form-select-sm" name="country">
    //                 <option>India</option><option>USA</option><option>UK</option><option>Canada</option><option>Germany</option>
    //             </select>
    //         </td>
    //         <td><input class="form-control form-control-sm" name="target_audience" placeholder="Target Audience"></td>
    //         <td>
    //             <select class="form-select form-select-sm" name="audience_type">
    //                 <option value="">Select</option>
    //                 <option value="B2B">B2B</option>
    //                 <option value="B2C">B2C</option>
    //                 <option value="Health Care">Health Care</option>
    //                 <option value="Other">Other</option>
    //             </select>
    //         </td>
    //         <td>
    //             <select class="form-select form-select-sm" name="device_type">
    //                 <option value="">Select</option>
    //                 <option value="Desktop/Laptop">Desktop / Laptop</option>
    //                 <option value="Mobile">Mobile</option>
    //                 <option value="Tablet">Tablet</option>
    //             </select>
    //         </td>
    //         <td><input type="number" class="form-control form-control-sm" name="n_value" value="0"></td>
    //         <td><input type="number" class="form-control form-control-sm" name="ir" value="0"></td>
    //         <td><input type="number" class="form-control form-control-sm" name="loi" value="0"></td>
    //         <td><input type="number" class="form-control form-control-sm" name="cpi" value="0"></td>
    //         <td><input type="number" class="form-control form-control-sm" name="feasibility_n" value="0"></td>
    //         <td><input type="number" class="form-control form-control-sm" name="fieldwork_days" value="0"></td>
    //         <td><input type="text" class="form-control form-control-sm" name="revenue" value="0"></td>
    //         <td><input type="text" class="form-control form-control-sm" name="notes" placeholder="Notes"></td>
    //         <td class="text-center"><span class="badge bg-secondary">Not saved</span></td>
    //         <td class="text-center">
    //             <div class="btn-group" role="group">
    //                 <button class="btn btn-sm btn-outline-success saveRow" title="Save Row">💾</button>
    //                 <button class="btn btn-sm btn-outline-secondary cloneRow" title="Clone">📋</button>
    //                 <button class="btn btn-sm btn-outline-danger deleteRow" title="Delete">🗑️</button>
    //             </div>
    //         </td>
    //     `;
    //     tbody.appendChild(tr);
    //     // If using select2, user can init here for the newly created selects if desired.
    //     updateBookButtonVisibility();
    // });
   

// addBidRowBtn?.addEventListener('click', function () {
//     const tbody = bidOptionsBody;
//     const tr = document.createElement('tr');

//     // Build dynamic country options
//     let countryOptions = `<option value="">Select Country</option>`;
//     window.countriesList.forEach(country => {
//         countryOptions += `<option value="${country.id}">${country.name}</option>`;
//     });

//     tr.innerHTML = `
//         <td class="text-center"><input type="checkbox" class="option-select" checked></td>

//         <!-- ✅ SERIAL NUMBER COLUMN -->
//         <td class="serial-no text-center">1</td>

//         <td>
//             <select class="form-select form-select-sm country-select" name="country_id">
//                 ${countryOptions}
//             </select>
//         </td>

//         <td><input class="form-control form-control-sm" name="target_audience" placeholder="Target Audience"></td>

//         <td>
//             <select class="form-select form-select-sm audience-type" name="audience_type">
//                 <option value="ALL Type Audeince">ALL Type Audeince</option>
//                 <option value="B2B">B2B</option>
//                 <option value="B2C">B2C</option>
//                 <option value="Health Care">Health Care</option>
//                 <option value="Other">Other</option>
//             </select>
//         </td>

//         <td>
//             <select class="form-select form-select-sm device-type" name="device_type">
//                 <option value="ALL Devices"> All Devices</option>
//                 <option value="Desktop/Laptop">Desktop / Laptop</option>
//                 <option value="Mobile">Mobile</option>
//                 <option value="Tablet">Tablet</option>
//             </select>
//         </td>

//         <td><input type="number" class="form-control form-control-sm" name="n" value="0"></td>
//         <td><input type="number" class="form-control form-control-sm" name="ir" value="0"></td>
//         <td><input type="number" class="form-control form-control-sm" name="loi" value="0"></td>
//         <td><input type="number" class="form-control form-control-sm" name="cpi" value="0"></td>
//         <td><input type="number" class="form-control form-control-sm" name="feasibility_n" value="0"></td>
//         <td><input type="number" class="form-control form-control-sm" name="fieldwork_days" value="0"></td>
//         <td><input type="text" class="form-control form-control-sm" name="revenue" value="0"></td>
//         <td><input type="text" class="form-control form-control-sm" name="notes" placeholder="Notes"></td>

//         <td class="text-center"><span class="badge bg-secondary">Not saved</span></td>

//         <td class="text-center">
//             <div class="btn-group" role="group">
//                 <button class="btn btn-sm btn-outline-secondary cloneRow" title="Clone">📋</button>
//                 <button class="btn btn-sm btn-outline-danger deleteRow" title="Delete">🗑️</button>
//             </div>
//         </td>
//     `;

//     tbody.appendChild(tr);

//     // ✅ Activate Select2 on new dropdowns
//     $(tr).find('.country-select, .audience-type, .device-type').select2({
//         width: '100%',
//         placeholder: 'Select option'
//     });

//     // ✅ UPDATE SERIAL AFTER ADD
//     updateSerialNumbers();

//     updateBookButtonVisibility();
// });
function autoCalculateRevenue(row) {
    const cpi = parseFloat(row.querySelector('input[name="cpi"]').value) || 0;
    const feasibility = parseFloat(row.querySelector('input[name="feasibility_n"]').value) || 0;

    const revenue = cpi * feasibility;

    row.querySelector('input[name="revenue"]').value = revenue.toFixed(2);
}

addBidRowBtn?.addEventListener('click', function () {
    const tbody = bidOptionsBody;
    const tr = document.createElement('tr');

    // Build dynamic country options
    let countryOptions = `<option value="">Select Country</option>`;
    window.countriesList.forEach(country => {
        countryOptions += `<option value="${country.id}">${country.name}</option>`;
    });

    tr.innerHTML = `
        <td class="text-center"><input type="checkbox" class="option-select" checked></td>
        <td class="serial-no text-center">1</td>

        <td>
            <select class="form-select form-select-sm country-select" name="country_id">
                ${countryOptions}
            </select>
        </td>

        <td><input class="form-control form-control-sm" name="target_audience" placeholder="Target Audience"></td>

        <td>
            <select class="form-select form-select-sm audience-type" name="audience_type">
                <option value="ALL Type Audeince">ALL Type Audeince</option>
                <option value="B2B">B2B</option>
                <option value="B2C">B2C</option>
                <option value="Health Care">Health Care</option>
                <option value="Other">Other</option>
            </select>
        </td>

        <td>
            <select class="form-select form-select-sm device-type" name="device_type">
                <option value="ALL Devices"> All Devices</option>
                <option value="Desktop/Laptop">Desktop / Laptop</option>
                <option value="Mobile">Mobile</option>
                <option value="Tablet">Tablet</option>
            </select>
        </td>

        <td><input type="number" class="form-control form-control-sm" name="n" ></td>
        <td><input type="number" class="form-control form-control-sm" name="ir" ></td>
        <td><input type="number" class="form-control form-control-sm" name="loi" ></td>
        <td><input type="number" class="form-control form-control-sm" name="cpi" ></td>
        <td><input type="number" class="form-control form-control-sm" name="feasibility_n" ></td>
        <td><input type="number" class="form-control form-control-sm" name="fieldwork_days" ></td>

        <!-- AUTO GENERATED -->
        <td><input type="text" class="form-control form-control-sm" name="revenue" value="0" readonly></td>

        <td><input type="text" class="form-control form-control-sm" name="notes" placeholder="Notes"></td>

        <td class="text-center"><span class="badge bg-secondary">Not saved</span></td>

        <td class="text-center">
            <div class="btn-group" role="group">
                <button class="btn btn-sm btn-outline-secondary cloneRow" title="Clone">📋</button>
                <button class="btn btn-sm btn-outline-danger deleteRow" title="Delete">🗑️</button>
            </div>
        </td>
    `;

    tbody.appendChild(tr);

    // Select2 activation
    $(tr).find('.country-select, .audience-type, .device-type').select2({
        width: '100%',
        placeholder: 'Select option'
    });

    // Auto calculate revenue
    $(tr).find('input[name="cpi"], input[name="feasibility_n"]').on("input", function () {
        autoCalculateRevenue(tr);
    });

    updateSerialNumbers();
    updateBookButtonVisibility();
});

    // -------------------------
    // Table actions: delete / clone / save row
    // -------------------------
//    document.getElementById('bidOptionsTable')?.addEventListener('click', function (e) {
//     const deleteBtn = e.target.closest('.deleteRow');
//     const cloneBtn = e.target.closest('.cloneRow');
//     const saveBtn = e.target.closest('.saveRow');

//     // ================= DELETE ROW =================
//     if (deleteBtn) {
//         const tr = deleteBtn.closest('tr');
//         if (!tr) return;
//         tr.remove();
//         updateSerialNumbers();
//         updateBookButtonVisibility();
//         return;
//     }

//     // ================= CLONE ROW (FIXED) =================
//     if (cloneBtn) {
//         const tr = cloneBtn.closest('tr');
//         const clone = tr.cloneNode(true);

//         // Remove saved state from clone
//         delete clone.dataset.optionId;
//         delete clone.dataset.saved;

//         // Reset badge
//         const badge = clone.querySelector('td span.badge');
//         if (badge) {
//             badge.className = 'badge bg-secondary';
//             badge.textContent = 'Not saved';
//         }

//         /*
//         ---------------------------------
//         ✅ FIX SELECT2 CLONING PROBLEM
//         ---------------------------------
//         */
//         const selects = clone.querySelectorAll('select');

//         selects.forEach(select => {
//             const currentValue = select.value;

//             select.classList.remove('select2-hidden-accessible');
//             select.removeAttribute('data-select2-id');

//             const next = select.nextElementSibling;
//             if (next && next.classList.contains('select2')) {
//                 next.remove();
//             }

//             select.value = currentValue;
//         });

//         bidOptionsBody.appendChild(clone);

//         // ✅ Re-initialise Select2 properly
//         $(clone).find('.country-select, .audience-type, .device-type').select2({
//             width: '100%',
//             placeholder: 'Select option'
//         });

//         // ✅ Update Serial Numbers
//         updateSerialNumbers();
//         updateBookButtonVisibility();
//         return;
//     }

//     // ================= SAVE SINGLE ROW =================
//     if (saveBtn) {
//         const tr = saveBtn.closest('tr');

//         // ✅ prevent duplicate save
//         if (tr.dataset.saved === 'true') {
//             showToast('info', 'This option is already saved.');
//             return;
//         }

//         saveSingleRow(tr);
//         return;
//     }
// });
document.getElementById('bidOptionsTable')?.addEventListener('click', function (e) {
    const deleteBtn = e.target.closest('.deleteRow');
    const cloneBtn = e.target.closest('.cloneRow');
    const saveBtn = e.target.closest('.saveRow');

    // DELETE
    if (deleteBtn) {
        const tr = deleteBtn.closest('tr');
        if (!tr) return;
        tr.remove();
        updateSerialNumbers();
        updateBookButtonVisibility();
        return;
    }

    // CLONE ✅ FIXED
  if (cloneBtn) {
    const tr = cloneBtn.closest('tr');

    // 🔥 Destroy select2 before cloning to avoid duplicated UI
    $(tr).find('.country-select, .audience-type, .device-type').select2('destroy');

    const clone = tr.cloneNode(true);

    // ✅ Remove dataset values (new row should not reuse DB id)
    delete clone.dataset.optionId;
    delete clone.dataset.saved;

    // ✅ FORCE enable checkbox for new cloned row
    const checkbox = clone.querySelector('.option-select');
    if (checkbox) {
        checkbox.checked = false;
        checkbox.disabled = false;
    }

    // ✅ Reset status badge
    const badge = clone.querySelector('td span.badge');
    if (badge) {
        badge.className = 'badge bg-secondary';
        badge.textContent = 'Not saved';
    }

    bidOptionsBody.appendChild(clone);

    // ✅ Re-initialize Select2 on both original AND cloned row
    $(tr).find('.country-select, .audience-type, .device-type').select2({
        width: '100%',
        placeholder: 'Select option'
    });

    $(clone).find('.country-select, .audience-type, .device-type').select2({
        width: '100%',
        placeholder: 'Select option'
    });

    // ✅ Update serial numbers after clone
    updateSerialNumbers();
    updateBookButtonVisibility();
    return;
}


    // SAVE
    if (saveBtn) {
        const tr = saveBtn.closest('tr');
        saveSingleRow(tr);
        return;
    }
});


    // Select all checkbox
    selectAllOptions?.addEventListener('change', function () {
        const checked = !!this.checked;
        document.querySelectorAll('#bidOptionsBody .option-select').forEach(cb => cb.checked = checked);
    });

    // -------------------------
    // Save Selected options (only checked rows) - batch save (like Save Selected)
    // -------------------------
   saveBidOptionsBtn?.addEventListener('click', async function () {

    if (!currentBidId) {
        showToast('error', 'Please save Bid Specifications first!');
        return;
    }

    // Collect all rows
    const rows = Array.from(document.querySelectorAll('#bidOptionsBody tr'));

    // ✅ ONLY rows that are:
    // - checked
    // - NOT already saved
    // - NO option_id yet
    const toSaveRows = rows.filter(r => 
        r.querySelector('.option-select')?.checked &&
        r.dataset.saved !== 'true' &&
        !r.dataset.optionId
    );

    if (toSaveRows.length === 0) {
        showToast('info', 'No new options to save. Already saved rows are skipped.');
        return;
    }

    // Build payload
    const payloadOptions = toSaveRows.map(r => {
        return {
            option_id: r.dataset.optionId ?? null,
            bid_id: getBidId(),
            country: r.querySelector('[name="country_id"]')?.value ?? '',
            target_audience: r.querySelector('[name="target_audience"]')?.value ?? '',
            audience_type: r.querySelector('[name="audience_type"]')?.value ?? '',
            device_type: r.querySelector('[name="device_type"]')?.value ?? '',
            n_value: r.querySelector('[name="n"]')?.value ?? 0,
            ir: r.querySelector('[name="ir"]')?.value ?? 0,
            loi: r.querySelector('[name="loi"]')?.value ?? 0,
            cpi: r.querySelector('[name="cpi"]')?.value ?? 0,
            feasibility_n: r.querySelector('[name="feasibility_n"]')?.value ?? 0,
            fieldwork_days: r.querySelector('[name="fieldwork_days"]')?.value ?? 0,
            revenue: r.querySelector('[name="revenue"]')?.value ?? '',
            notes: r.querySelector('[name="notes"]')?.value ?? ''
        };
    });

    try {
        const res = await fetch('/admin/bids/store_options', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
            },
            body: JSON.stringify({ bid_id: currentBidId, options: payloadOptions })
        });

        const data = await res.json();

        if (!data) {
            showToast('error', 'Invalid server response.');
            return;
        }

        if (data.status === 1) {
            $('#bidValueDisplay').text(parseFloat(data.bidvalue).toFixed(2));
            showToast('success', data.message || 'Options saved.');

            // ✅ Mark rows as saved and prevent re-save
            toSaveRows.forEach((r, idx) => {

                if (Array.isArray(data.saved_ids) && data.saved_ids[idx]) {
                    r.dataset.optionId = data.saved_ids[idx];
                }

                r.dataset.saved = 'true';

                const badge = r.querySelector('td span.badge');
                if (badge) {
                    badge.className = 'badge bg-success';
                    badge.textContent = 'Saved';
                }

                // ✅ Disable checkbox after save (visual confirmation)
                const checkbox = r.querySelector('.option-select');
                if (checkbox) {
                    checkbox.disabled = true;
                    checkbox.checked = false;
                }
            });

            if (data.bid_info) {
                bidInfoHeader.style.display = 'block';
                bidNumberDisplay.textContent = data.bid_info.bid_number ?? '';
                blockValueDisplay.textContent = data.bid_info.block_value ?? '';
                bidValueDisplay.textContent = data.bid_info.bid_value ?? '';
                createdDateDisplay.textContent = data.bid_info.created_at ?? '';
            }

            updateBookButtonVisibility();

        } else {
            showToast('error', data.message || 'Unable to save options.');
            console.error('Save options error', data.errors ?? data);
        }

    } catch (err) {
        console.error(err);
        showToast('error', 'Failed to save options (network).');
    }
});

    // Save a single row (when user clicks the per-row Save button)
    async function saveSingleRow(tr) {
        if (!tr) return;
        if (!currentBidId) { showToast('error', 'Please save Bid Specifications first!'); return; }

        const payload = {
            option_id: tr.dataset.optionId ?? null,
            country: tr.querySelector('[name="country"]')?.value ?? '',
            target_audience: tr.querySelector('[name="target_audience"]')?.value ?? '',
            audience_type: tr.querySelector('[name="audience_type"]')?.value ?? '',
            device_type: tr.querySelector('[name="device_type"]')?.value ?? '',
            n_value: tr.querySelector('[name="n_value"]')?.value ?? 0,
            ir: tr.querySelector('[name="ir"]')?.value ?? 0,
            loi: tr.querySelector('[name="loi"]')?.value ?? 0,
            cpi: tr.querySelector('[name="cpi"]')?.value ?? 0,
            feasibility_n: tr.querySelector('[name="feasibility_n"]')?.value ?? 0,
            fieldwork_days: tr.querySelector('[name="fieldwork_days"]')?.value ?? 0,
            revenue: tr.querySelector('[name="revenue"]')?.value ?? '',
            notes: tr.querySelector('[name="notes"]')?.value ?? ''
        };

        try {
            const res = await fetch('/admin/bids/store_option', { // single-option endpoint
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify({ bid_id: currentBidId, option: payload })
            });
            const data = await res.json();
            if (!data) { showToast('error', 'Invalid server response.'); return; }

            if (data.status === 1) {
                showToast('success', data.message || 'Option saved.');

                // Attach returned option id if any
                if (data.option_id) {
                    tr.dataset.optionId = data.option_id;
                    tr.dataset.saved = 'true';
                    lastSavedOptionIds.push(parseInt(data.option_id));
                } else {
                    tr.dataset.saved = 'true';
                }

                // update badge
                const badge = tr.querySelector('td span.badge');
                if (badge) { badge.className = 'badge bg-success'; badge.textContent = 'Saved'; }

                // show bid header if returned
                if (data.bid_info) {
                    bidInfoHeader.style.display = 'block';
                    bidNumberDisplay.textContent = data.bid_info.bid_number ?? '';
                    blockValueDisplay.textContent = data.bid_info.block_value ?? '';
                    bidValueDisplay.textContent = data.bid_info.bid_value ?? '';
                    createdDateDisplay.textContent = data.bid_info.created_at ?? '';
                }

                updateBookButtonVisibility();
            } else {
                showToast('error', data.message || 'Failed to save option.');
                console.error('Save single option error', data.errors ?? data);
            }
        } catch (err) {
            console.error(err);
            showToast('error', 'Network error while saving option.');
        }
    }

    // update Book button visibility
    function updateBookButtonVisibility() {
        const anySaved = Array.from(document.querySelectorAll('#bidOptionsBody tr'))
            .some(tr => (tr.dataset.saved === 'true' || tr.dataset.optionId));
        if (anySaved) {
            bookSelectedBtn.style.display = 'inline-block';
        } else {
            bookSelectedBtn.style.display = 'none';
        }
    }

    updateBookButtonVisibility();

    // -------------------------
    // Book selected (transfer to booking) - CLONE behavior
    // -------------------------
    bookSelectedBtn?.addEventListener('click', async function () {
        const selectedSavedRows = Array.from(document.querySelectorAll('#bidOptionsBody tr'))
            .filter(r => r.querySelector('.option-select')?.checked && (r.dataset.saved === 'true' || r.dataset.optionId));

        if (selectedSavedRows.length === 0) {
            showToast('info', 'Select saved rows (green) to book.');
            return;
        }

        const optionIds = selectedSavedRows.map(r => r.dataset.optionId).filter(Boolean);

        try {
            // ✅ Fetch stored bid option data from backend instead of posting
            const res = await fetch(`/admin/bids/get_booking_data?bid_id=${currentBidId}&option_ids=${optionIds.join(',')}`, {
                headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content }
            });
            const data = await res.json();

            if (data.status === 1) {
                showToast('success', 'Loaded booking data successfully!');
                populateBookingTab(data.booked_rows ?? [], data.bid_number ?? '');
                bookingTab.classList.remove('disabled');
                document.querySelector('#booking-tab').click();
            } else {
                showToast('error', 'Failed to fetch booking data.');
            }
        } catch (err) {
            console.error(err);
            showToast('error', 'Network error while fetching booking data.');
        }
    });

    // populate booking tab
    function populateBookingTab(rows, bidNumber) {
        bookingBody.innerHTML = '';
        if (Array.isArray(rows) && rows.length) {
            rows.forEach(r => {
                const tr = document.createElement('tr');
                tr.dataset.optionId = r.option_id ?? r.optionId ?? '';
                tr.innerHTML = `
                    <td>${r.option_id ?? r.optionId ?? '—'}</td>
                    <td>${r.country ?? ''}</td>
                    <td>${r.audience_type ?? ''}</td>
                    <td>${r.device_type ?? ''}</td>
                    <td>${r.feasibility_n ?? ''}</td>
                    <td>${r.ir ?? ''}</td>
                    <td>${r.loi ?? ''}</td>
                    <td>${r.cpi ?? ''}</td>
                    <td>${r.revenue ?? ''}</td>
                    <td>${r.notes ?? ''}</td>
                `;
                bookingBody.appendChild(tr);
            });
            bookingHeaderShow(bidNumber);
        } else {
            bookingBody.innerHTML = '<tr><td colspan="10">No booking rows found.</td></tr>';
            bookingHeaderShow(bidNumber);
        }
    }
// When Booking tab is clicked
document.getElementById('booking-tab')?.addEventListener('click', function () {

    const bidId = document.getElementById('bid_id')?.value || currentBidId;

    if (!bidId) {
        showToast('error', 'Bid ID not found. Please save specifications first.');
        return;
    }

    fetch(`/admin/bids/get-booking-data?bid_id=${bidId}`)
        .then(res => res.json())
        .then(data => {
            if (data.status === 1) {
                populateBookingTab(data.booked_rows, data.bid_number);
            } else {
                bookingBody.innerHTML = '<tr><td colspan="10">No data found.</td></tr>';
                bookingHeaderShow(data.bid_number);
            }
        })
        .catch(err => {
            console.error('Booking fetch error:', err);
            showToast('error', 'Failed to load booking data.');
        });
});

    function bookingHeaderShow(bidNumber) {
        const bookingHeader = document.getElementById('bookingHeader');
        if (bookingHeader) {
            bookingHeader.classList.remove('d-none');
            bookingBidNumber.textContent = bidNumber || '';
            if (bidNumberOnBtn) bidNumberOnBtn.textContent = bidNumber || '';
            if (sendBookingBtn) sendBookingBtn.style.display = bidNumber ? 'inline-block' : 'none';
        }
    }

    // -------------------------
    // Save booking (assign PM) - stores booking meta and links booked rows
    // -------------------------
    saveBookingBtn?.addEventListener('click', async function () {
        const rows = Array.from(document.querySelectorAll('#bookingBody tr'));
        if (rows.length === 0) { showToast('info', 'No booking rows to save.'); return; }
        const optionIds = rows.map(r => r.dataset.optionId).filter(Boolean);
        const pmUser = document.getElementById('pm_user')?.value ?? '';
        const bookingNotes = document.getElementById('booking_notes')?.value ?? '';

        if (!pmUser) { showToast('info', 'Please select a PM before saving.'); return; }

        try {
            const res = await fetch('/admin/bids/store_booking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify({ bid_id: currentBidId, option_ids: optionIds, pm_user: pmUser, booking_notes: bookingNotes })
            });
            const data = await res.json();
            if (!data) { showToast('error', 'Invalid server response.'); return; }

            if (data.status === 1) {
                showToast('success', data.message || 'Booking saved.');
                if (data.bid_number) {
                    bookingHeaderShow(data.bid_number);
                    sendBookingBtn.style.display = 'inline-block';
                    document.getElementById('booking_email_sent').value = data.email_sent ? 'Yes' : 'No';
                }
            } else {
                showToast('error', data.message || 'Failed to save booking.');
            }
        } catch (err) {
            console.error(err);
            showToast('error', 'Network error while saving booking.');
        }
    });

    // -------------------------
    // Create project (final) - sends create project request and expects redirect or success
    // -------------------------
    sendBookingBtn?.addEventListener('click', async function () {
        const rows = Array.from(document.querySelectorAll('#bookingBody tr'));
        const optionIds = rows.map(r => r.dataset.optionId).filter(Boolean);
        const pmUser = document.getElementById('pm_user')?.value ?? '';
        if (!optionIds.length) { showToast('info', 'No booking rows to create project.'); return; }
        if (!pmUser) { showToast('info', 'Select PM user first.'); return; }

        try {
            const res = await fetch('/admin/bids/create_project', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify({ bid_id: currentBidId, option_ids: optionIds, pm_user: pmUser })
            });
            const data = await res.json();
            if (!data) { showToast('error', 'Invalid server response.'); return; }

            if (data.status === 1) {
                showToast('success', data.message || 'Project created.');
                if (data.redirect) {
                    window.location.href = data.redirect;
                } else if (data.project_id) {
                    window.location.href = '/admin/projects';
                }
            } else {
                showToast('error', data.message || 'Failed to create project.');
            }
        } catch (err) {
            console.error(err);
            showToast('error', 'Network error while creating project.');
        }
    });

    // -------------------------
    // Save specs (existing behavior)
    // -------------------------
    document.getElementById('saveBidBtn')?.addEventListener('click', function () {
        if (isSpecSaved) {
            showToast('info', 'Specifications already saved.');
            document.querySelector('#options-tab').click();
            return;
        }

        const form = document.getElementById('bidForm');
        const formData = new FormData(form);

        fetch('/admin/bids/store_specifications', {
            method: 'POST',
            headers: { 
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content 
            },
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === 1) {
                 // Update header values
                $('#bidNumberDisplay').text(data.bidnumber);
                

                
               console.log('AJAX Response:', data);

                // Format date nicely
                let date = new Date(data.created);
                let formattedDate = date.toLocaleString(); 
                $('#createdDateDisplay').text(formattedDate);
                

                currentBidId = data.bid_id;
                isSpecSaved = true;

                // 🧩 Save bid_id into a hidden input for later use
                let bidInput = document.getElementById('bid_id');
                if (!bidInput) {
                    bidInput = document.createElement('input');
                    bidInput.type = 'hidden';
                    bidInput.id = 'bid_id';
                    bidInput.name = 'bid_id';
                    document.body.appendChild(bidInput);
                }
                bidInput.value = data.bid_id;
                console.log("✅ Bid ID saved in hidden field:", data.bid_id);

                // Enable other tabs
                optionsTab.classList.remove('disabled');
                bookingTab.classList.remove('disabled');
                
                showToast('success', '✅ Bid specifications saved!');
                
                // open Options tab next
                document.querySelector('#options-tab').click();
            } else {
                showToast('error', '❌ Failed to save specifications.');
                console.error(data.errors);
            }
        })
        .catch(err => {
            console.error('Error saving bid:', err);
            showToast('error', 'Something went wrong while saving bid.');
        });
    });

    // -------------------------
    // Utility: show toast
    // -------------------------
    function showToast(type, message) {
        const color = type === 'success' ? '#28a745'
                     : type === 'info' ? '#17a2b8'
                     : '#dc3545';
        const toast = document.createElement('div');
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.right = '20px';
        toast.style.padding = '10px 20px';
        toast.style.color = '#fff';
        toast.style.backgroundColor = color;
        toast.style.borderRadius = '5px';
        toast.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
        toast.style.zIndex = '9999';
        toast.innerText = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    // mark any blade-provided rows as saved (they have data-saved)
    updateBookButtonVisibility();
    

});
// ===============================================
// 📘 BOOKING TAB - SINGLE BUTTON ACTION FLOW
// ===============================================
let currentBidId = null;

// Triggered when “Book Selected” button clicked in Bid Options tab
$(document).on("click", "#bookSelected", function () {
    const bidId = $("#bid_id").val();
    if (!bidId) {
        alert("Please save specifications first!");
        return;
    }

    $.ajax({
        url: "/admin/bids/get_booking_data",
        type: "GET",
        data: { bid_id: bidId },
       success: function (response) {
        if (response.status === 1) {

            // ==== HEADER DATA ====
            $('#bookingBidNumber').text(response.bid_info.bid_number);
            $('#bookingBidValue').text(parseFloat(response.bid_info.bid_value).toFixed(2));
            $('#bookingCreated').text(new Date(response.bid_info.created_at).toLocaleString());

            $("#bookingTableBody").empty();

            response.booked_rows.forEach((row, index) => {
                $("#bookingTableBody").append(`
                    <tr data-option-id="${row.option_id}">
                        <td>${index + 1}</td>
                        <td>${row.country_name}</td>
                        <td>${row.target_audience}</td>
                        <td>${row.audience_type}</td>
                        <td>${row.device_type}</td>
                        <td>${row.n}</td>
                        <td>${row.ir}</td>
                        <td>${row.loi}</td>
                        <td>${row.cpi}</td>
                        <td>${row.revenue}</td>
                    </tr>
                `);
            });

            $("#booking-tab").tab("show");
    
                $("#bookingActionBtn")
                    .data("stage", "save")
                    .data("bid-id", bidId)
                    .text("💾 Save Booking")
                    .removeClass()
                    .addClass("btn btn-warning");
            } else {
                alert(response.message || "No data found.");
            }
        },
        error: function () {
            alert("Failed to load booking data!");
        },
    });
});

// Single button handles all stages
$(document).on("click", "#bookingActionBtn", function () {
    const btn = $(this);
    const stage = btn.data("stage");
    const bidId = btn.data("bid-id");   // Only required field
    const pmUser = $("#pm_user").val();
    const notes = $("#booking_notes").val();

    if (!bidId) {
        alert("Missing Bid ID!");
        return;
    }

    btn.prop("disabled", true).text("⏳ Processing...");

    // 1️⃣ SAVE BOOKING
    if (stage === "save") {
        if (!pmUser) {
            alert("Please select PM user!");
            btn.prop("disabled", false).text("💾 Save Booking");
            return;
        }

        $.ajax({
            url: "/admin/bids/store_booking",
            type: "POST",
            data: {
                _token: $('meta[name="csrf-token"]').attr("content"),
                bid_id: bidId,
                pm_user: pmUser,
                booking_notes: notes,
            },
            success: function (res) {
                if (res.status) {
                    Swal.fire({
                        icon: "success",
                        title: "Booking Saved!",
                        timer: 1500,
                        showConfirmButton: false,
                    });
                    btn.data("stage", "email")
                        .text("📧 Send Booking Email")
                        .removeClass()
                        .addClass("btn btn-success");
                } else {
                    alert(res.message || "Failed to save booking.");
                }
            },
            complete: function () {
                btn.prop("disabled", false);
            },
        });
    }

    // 2️⃣ SEND BOOKING EMAIL (Simulated)
    else if (stage === "email") {
        setTimeout(() => {
            Swal.fire({
                icon: "success",
                title: "Booking Email Sent!",
                timer: 1500,
                showConfirmButton: false,
            });

            btn.data("stage", "project")
                .text("🚀 Create Project")
                .removeClass()
                .addClass("btn btn-info")
                .prop("disabled", false);

        }, 1000);
    }

    // 3️⃣ CREATE PROJECT (Only bid_id)
    else if (stage === "project") {

        $.ajax({
            url: "/admin/bids/projectadd",
            type: "POST",
            data: {
                _token: $('meta[name="csrf-token"]').attr("content"),
                bid_id: bidId       // ONLY THIS
            },
            beforeSend: function () {
                btn.prop("disabled", true).text("⏳ Creating Project...");
            },
            success: function (res) {
                if (res.status === true || res.status === 1) {

                    Swal.fire({
                        icon: "success",
                        title: res.message,
                        confirmButtonText: "OK",
                    }).then(() => {

                        btn.data("project_id", res.project_id);

                        btn.data("stage", "view")
                            .text(`📂 View Project #${res.project_id}`)
                            .removeClass()
                            .addClass("btn btn-primary mt-2")
                            .prop("disabled", false);

                        btn.data("redirect", `/admin/projects?bid_id=${bidId}`);
                    });

                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: res.message || "Failed to create project.",
                    });
                }
            }
        });

    }

    // 4️⃣ VIEW PROJECT
    else if (stage === "view") {
        const redirect = btn.data("redirect");

        if (redirect) {
            window.location.href = `/admin/bid/${bidId}/projects`;
        } else {
            window.location.href = `/admin/bid/${bidId}/projects`;
        }
    }

});

// ❌ ROW CLICK REMOVED (No option needed)
// $(document).on("click", "#bookingTableBody tr", function () {
//     $("#bookingTableBody tr").removeClass("selected");
//     $(this).addClass("selected");
// });


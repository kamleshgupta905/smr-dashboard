with open('client/src/components/AssignVendorModal.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

if 'sendVendorAssignmentEmail' not in code:
    code = code.replace(
        "  deleteVendorAllotment,\n  searchVendors",
        "  deleteVendorAllotment,\n  searchVendors,\n  sendVendorAssignmentEmail"
    )

old_save = """      await saveVendorAllotment(allotmentPayload);
      setAllotSuccess(true);
      await loadAllotments();
      setTimeout(() => setAllotSuccess(false), 3500);"""

new_save = """      await saveVendorAllotment(allotmentPayload);
      try {
        await sendVendorAssignmentEmail({
          vendor_id: v,
          project_id: String(currentId),
          cpi: Number(vendorCpi) || 1.50,
          entry_link: generatedLive
        });
      } catch (me) {}
      setAllotSuccess(true);
      await loadAllotments();
      setTimeout(() => setAllotSuccess(false), 3500);"""

if 'sendVendorAssignmentEmail({' not in code and old_save in code:
    code = code.replace(old_save, new_save)
    print("Added sendVendorAssignmentEmail trigger to AssignVendorModal!")

with open('client/src/components/AssignVendorModal.jsx', 'w', encoding='utf-8', newline='') as f:
    f.write(code)

print("Updated AssignVendorModal successfully!")

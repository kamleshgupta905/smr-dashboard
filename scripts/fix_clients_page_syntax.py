with open('client/src/pages/ClientsPage.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Find the premature ending
split_marker = "    </div>\n  );\n}\n      {/* Multi-Contact Persons Modal"

if split_marker in text:
    parts = text.split(split_marker)
    before = parts[0]
    contacts_modal_part = "      {/* Multi-Contact Persons Modal" + parts[1]
    
    fixed = before + "\n\n" + contacts_modal_part.rstrip() + "\n    </div>\n  );\n}\n"
    with open('client/src/pages/ClientsPage.jsx', 'w', encoding='utf-8', newline='') as f:
        f.write(fixed)
    print("Fixed ClientsPage.jsx structure successfully!")
else:
    print("Trying alternate marker...")
    # fallback
    import re
    match = re.search(r"(\s*</div>\s*\);\s*}\s*)(\{/\*\s*Multi-Contact Persons Modal[\s\S]*$)", text)
    if match:
        closing = match.group(1)
        modal_content = match.group(2)
        before_closing = text[:match.start(1)]
        fixed = before_closing + "\n\n" + modal_content.rstrip() + "\n    </div>\n  );\n}\n"
        with open('client/src/pages/ClientsPage.jsx', 'w', encoding='utf-8', newline='') as f:
            f.write(fixed)
        print("Fixed ClientsPage.jsx with regex successfully!")
    else:
        print("Pattern not matched!")

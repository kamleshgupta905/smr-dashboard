import os
import sys
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            return

        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#475569"))

        # Running Header
        self.drawString(54, 11 * inch - 36, "VMH GROUP • SMR Platform — System Problems & Actionable Solutions Audit")
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#94A3B8"))
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(54, 11 * inch - 42, 8.5 * inch - 54, 11 * inch - 42)

        # Running Footer
        self.line(54, 45, 8.5 * inch - 54, 45)
        self.drawString(54, 32, "Confidential — Engineering Diagnostics & Resolution Blueprint")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(8.5 * inch - 54, 32, page_str)
        self.restoreState()

def build_pdf(filename="SMR_Problems_and_Solutions_Report.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Color Palette
    PRIMARY = colors.HexColor("#0F172A")    # Deep Slate
    SECONDARY = colors.HexColor("#1E40AF")  # Deep Navy Blue
    ACCENT = colors.HexColor("#2563EB")     # Vibrant Blue
    TEXT_DARK = colors.HexColor("#1E293B")
    TEXT_MUTED = colors.HexColor("#64748B")
    DANGER = colors.HexColor("#DC2626")     # Red
    SUCCESS = colors.HexColor("#15803D")   # Forest Green
    WARNING = colors.HexColor("#B45309")   # Amber / Orange
    BG_LIGHT = colors.HexColor("#F8FAFC")
    BG_CARD = colors.HexColor("#F1F5F9")
    BORDER_COLOR = colors.HexColor("#E2E8F0")

    # Typography
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=28,
        textColor=PRIMARY,
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=SECONDARY,
        spaceAfter=12
    )

    meta_style = ParagraphStyle(
        'DocMeta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=14,
        textColor=TEXT_MUTED
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=PRIMARY,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11.5,
        leading=15,
        textColor=SECONDARY,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    h3_style = ParagraphStyle(
        'Heading3_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=13,
        textColor=TEXT_DARK,
        spaceBefore=6,
        spaceAfter=2,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13.5,
        textColor=TEXT_DARK,
        spaceAfter=5
    )

    code_style = ParagraphStyle(
        'Code_Custom',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#0F172A")
    )

    story = []

    # ================= COVER / HEADER BLOCK =================
    story.append(Paragraph("VMH GROUP • TECHNICAL DIAGNOSTIC REPORT", ParagraphStyle(
        'TopKicker', fontName='Helvetica-Bold', fontSize=10, leading=12, textColor=ACCENT, spaceAfter=4
    )))
    story.append(Paragraph("SMR Platform: Codebase Audit &amp; Bug Analysis", title_style))
    story.append(Paragraph("Comprehensive Register of Identified Problems, Root Causes &amp; Step-by-Step Solutions", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=ACCENT, spaceBefore=2, spaceAfter=10))

    meta_text = f"""
    <b>Project:</b> Survey Management Router (SMR) &nbsp;|&nbsp; 
    <b>Technology:</b> Laravel 10 / PHP 8.1 &amp; 8.2 &nbsp;|&nbsp; 
    <b>Date:</b> {datetime.now().strftime('%B %d, %Y')}<br/>
    <b>Status:</b> Read-Only Diagnostic Assessment &nbsp;|&nbsp; 
    <b>Action Status:</b> Advisory Blueprint (Zero Code Alterations Applied)
    """
    story.append(Paragraph(meta_text, meta_style))
    story.append(Spacer(1, 12))

    # Executive Overview
    story.append(Paragraph("1. Executive Summary &amp; Scope", h1_style))
    story.append(Paragraph(
        "A rigorous line-by-line static inspection and error-log review was conducted across the <b>SMR (Survey Market Research)</b> "
        "codebase. The system functions as a high-traffic survey routing and sample management platform. "
        "This document details <b>13 critical flaws, architecture bugs, logic mismatches, and security exposures</b>, "
        "accompanied by their exact code locations, business impacts, and precise technical solutions.",
        body_style
    ))
    story.append(Spacer(1, 6))

    # Quick Summary Table
    summary_data = [
        [Paragraph("<b>Severity</b>", h3_style), Paragraph("<b>Count</b>", h3_style), Paragraph("<b>Key Affected Modules</b>", h3_style), Paragraph("<b>Urgency</b>", h3_style)],
        [
            Paragraph("<font color='#DC2626'><b>HIGH</b></font>", body_style),
            Paragraph("<b>5 Issues</b>", body_style),
            Paragraph("Routing engine (<code>web.php</code>), Project Controller, URL Controller, PHP Platform", body_style),
            Paragraph("Immediate (P0)", body_style)
        ],
        [
            Paragraph("<font color='#B45309'><b>MEDIUM</b></font>", body_style),
            Paragraph("<b>6 Issues</b>", body_style),
            Paragraph("Vendor callbacks, UID substitution, Bid cascade deletion, Payments <code>die()</code>", body_style),
            Paragraph("Within 48h (P1)", body_style)
        ],
        [
            Paragraph("<font color='#2563EB'><b>LOW / DEV</b></font>", body_style),
            Paragraph("<b>2 Issues</b>", body_style),
            Paragraph("Database migration files, server root storage cleanup", body_style),
            Paragraph("Planned (P2)", body_style)
        ],
    ]
    sum_table = Table(summary_data, colWidths=[1.3 * inch, 1.0 * inch, 3.4 * inch, 1.3 * inch])
    sum_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), BG_CARD),
        ('BOX', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(sum_table)
    story.append(Spacer(1, 14))

    # ================= 2. PROBLEM & SOLUTION DETAIL CARDS =================
    story.append(Paragraph("2. Detailed Problems, Root Causes &amp; Solutions", h1_style))
    story.append(Paragraph(
        "Each section below specifies the bug description, location in the code, potential or observed system failure, and the required fix.",
        body_style
    ))
    story.append(Spacer(1, 6))

    def make_issue_box(num, title, severity, file_path, problem_text, impact_text, solution_text, code_snippet=None):
        sev_color = DANGER if severity == "HIGH" else (WARNING if severity == "MEDIUM" else ACCENT)

        head_left = Paragraph(f"<b>PROBLEM #{num}: {title}</b>", ParagraphStyle(
            'IB_Head', fontName='Helvetica-Bold', fontSize=10, leading=13, textColor=PRIMARY
        ))
        head_right = Paragraph(f"<b>[{severity} SEVERITY]</b>", ParagraphStyle(
            'IB_Sev', fontName='Helvetica-Bold', fontSize=8.5, leading=12, textColor=sev_color, alignment=2
        ))

        h_tbl = Table([[head_left, head_right]], colWidths=[5.4 * inch, 1.6 * inch])
        h_tbl.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 0),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
        ]))

        box_items = [
            h_tbl,
            Spacer(1, 3),
            Paragraph(f"<b>File Location:</b> <code>{file_path}</code>", ParagraphStyle('Loc', fontName='Helvetica', fontSize=8.5, leading=11, textColor=TEXT_MUTED)),
            Spacer(1, 4),
            Paragraph(f"<b>Problem Description:</b> {problem_text}", body_style),
            Paragraph(f"<b>Observed / Potential Impact:</b> <font color='#DC2626'>{impact_text}</font>", body_style),
            Spacer(1, 2),
            Paragraph(f"<b>How to Solve:</b> <font color='#15803D'><b>{solution_text}</b></font>", body_style)
        ]

        if code_snippet:
            box_items.append(Spacer(1, 3))
            box_items.append(Table([[Paragraph(f"<code>{code_snippet}</code>", code_style)]], colWidths=[6.8 * inch], style=[
                ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#FFFFFF")),
                ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
                ('TOPPADDING', (0, 0), (-1, -1), 4),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
                ('LEFTPADDING', (0, 0), (-1, -1), 6),
                ('RIGHTPADDING', (0, 0), (-1, -1), 6),
            ]))

        outer = Table([[box_items]], colWidths=[7.0 * inch])
        outer.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), BG_LIGHT),
            ('BOX', (0, 0), (-1, -1), 1, BORDER_COLOR),
            ('LINELEFT', (0, 0), (0, -1), 3.5, sev_color),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ]))
        return KeepTogether([outer, Spacer(1, 9)])

    # Problem 1
    story.append(make_issue_box(
        num="01",
        title="Direct Database Queries in Route Definition File",
        severity="HIGH",
        file_path="routes/web.php (Lines 35–41)",
        problem_text="<code>routes/web.php</code> executes <code>if (Schema::hasTable('menus')) { $menus = Menu::all()... }</code> during file loading.",
        impact_text="If MySQL is momentarily offline or restarting, running any CLI artisan command or web page immediately crashes the application with <code>SQLSTATE[HY000] [2002] Connection refused</code> (already logged in laravel.log). Furthermore, route caching (<code>php artisan route:cache</code>) breaks permanently.",
        solution_text="Eliminate runtime DB calls from route files. Define admin routes statically or dynamically map them through a Controller Registrar, and retrieve menus inside Blade views/view composers only when rendering HTML.",
        code_snippet="// Remove Schema::hasTable('menus') and Menu::all() queries from routes/web.php.<br/>// Keep route registration static and predictable."
    ))

    # Problem 2
    story.append(make_issue_box(
        num="02",
        title="Nested Global Function Declaration in Controller Action",
        severity="HIGH",
        file_path="app/Http/Controllers/Admin/ProjectController.php (Lines 364–374)",
        problem_text="The function <code>flagEmoji($code)</code> is declared directly inside the controller method <code>public function view($id)</code>.",
        impact_text="In PHP, any function declared inside another function becomes global upon the first call. Calling <code>view()</code> a second time during the same PHP process (e.g. testing, sub-requests, batch tasks) throws a fatal error: <code>Cannot redeclare function flagEmoji()</code>.",
        solution_text="Relocate <code>flagEmoji()</code> to <code>app/Helpers/CommonHelper.php</code> (wrapped inside <code>if (!function_exists('flagEmoji'))</code>) or convert it to a <code>private function flagEmoji($code)</code> method within <code>ProjectController</code>.",
        code_snippet="// Move to ProjectController as class method:<br/>private function flagEmoji($code) { if(!$code || strlen($code) != 2) return ''; ... }"
    ))

    # Problem 3
    story.append(make_issue_box(
        num="03",
        title="Unchecked Null Object Access on Project Status Toggle",
        severity="HIGH",
        file_path="app/Http/Controllers/Admin/ProjectController.php (Lines 298–304)",
        problem_text="The status method accesses <code>$status->status</code> immediately after querying: <code>$status = DB::table('projects')->where(['id' => $id])->first();</code> without verifying if a matching record exists.",
        impact_text="Triggered in production log: <i>ErrorException: Attempt to read property 'status' on null at ProjectController.php:300</i>. Results in an unhandled 500 error when toggling project status.",
        solution_text="Implement a null check prior to accessing object properties and return a structured JSON response.",
        code_snippet="$project = DB::table('projects')->where('id', $id)->first();<br/>if (!$project) { return response()->json(['success' => false, 'message' => 'Project not found'], 404); }<br/>$updatedStatus = ($project->status === 'Live') ? 'Pause' : 'Live';"
    ))

    # Problem 4
    story.append(make_issue_box(
        num="04",
        title="PHP Version Platform Check Failures",
        severity="HIGH",
        file_path="error_log (Lines 1–41) & composer.json",
        problem_text="Composer packages require PHP >= 8.2.0, but the server was executing PHP 8.1.33, causing Composer's <code>platform_check.php</code> to abort requests with fatal errors.",
        impact_text="Repeated platform check failures causing full 500 downtime whenever the web server routes requests to a PHP 8.1 worker process.",
        solution_text="Ensure the hosting environment consistently executes PHP 8.2 (via cPanel EA-PHP82 handler), and lock Composer platform in composer.json to 8.2.",
        code_snippet="// In composer.json -> config block:<br/>\"config\": { \"platform\": { \"php\": \"8.2.0\" } }"
    ))

    story.append(PageBreak())

    # Problem 5
    story.append(make_issue_box(
        num="05",
        title="Survey Router Crashes on Geolocation API Failure",
        severity="HIGH",
        file_path="app/Http/Controllers/Admin/URLController.php (Lines 381, 240, 275)",
        problem_text="When the IP2Location external API request encounters an error, <code>getUserInfo()</code> returns <code>response()->json(['error' => ...])</code>. Later in <code>URLAction()</code>, this object is accessed as an array: <code>$userInfo['ip_address']</code>.",
        impact_text="If IP2Location experiences latency, rate limiting, or connection failure, PHP halts with: <i>Fatal Error: Cannot use object of type JsonResponse as array</i>, terminating incoming respondent traffic.",
        solution_text="Ensure <code>getUserInfo()</code> always returns a plain PHP associative array. On network failure or API error, return a fallback array populated with local request attributes (e.g. <code>$request->ip()</code>).",
        code_snippet="catch (\\Exception $e) {<br/>&nbsp;&nbsp;return ['ip_address' => $request->ip(), 'country' => 'Unknown', 'is_proxy' => false, ...];<br/>}"
    ))

    # Problem 6
    story.append(make_issue_box(
        num="06",
        title="Dual Vendor Table Schema Discrepancy",
        severity="HIGH",
        file_path="app/Http/Controllers/Admin/URLController.php vs VendorController.php",
        problem_text="Vendors created in the admin portal are stored in the <code>vendor</code> table with columns <code>redirect_success_url</code>, <code>redirect_fail_url</code>, etc. However, <code>URLController::checkVendorRedirect()</code> queries an entirely different table: <code>vendorlists</code> (columns: <code>success</code>, <code>terminate</code>).",
        impact_text="Vendors created through the standard admin workflow never receive completion or termination postbacks. Respondents are dropped onto generic error screens instead of their panel provider.",
        solution_text="Harmonize vendor tables. Update <code>checkVendorRedirect()</code> to query the master <code>vendor</code> table and retrieve the configured callback URLs.",
        code_snippet="$vendor = DB::table('vendor')->where('id', $vendorId)->first();<br/>// Return $vendor->redirect_success_url or appropriate status column."
    ))

    # Problem 7
    story.append(make_issue_box(
        num="07",
        title="Typo & Restrictive UID Token Replacement",
        severity="MEDIUM",
        file_path="app/Http/Controllers/Admin/URLController.php (Lines 51–55)",
        problem_text="<code>ReplaceUID($redirect, $uid)</code> strictly searches for <code>\"vmhgroupss\"</code> (spelled with double 's').",
        impact_text="If a vendor supplies a callback URL using standard market research tokens (<code>[UID]</code>, <code>{uid}</code>, <code>[RID]</code>) or the single-s brand name <code>vmhgroups</code>, the respondent ID is never replaced. Vendor panels cannot reconcile completes.",
        solution_text="Expand token substitution to handle industry-standard wildcards.",
        code_snippet="return str_replace(['vmhgroups', 'vmhgroupss', '[UID]', '{uid}', '[RID]', '{USER_ID}'], $uid, $redirect);"
    ))

    # Problem 8
    story.append(make_issue_box(
        num="08",
        title="Null Pointer in Complete Action Payment Calculation",
        severity="MEDIUM",
        file_path="app/Http/Controllers/Admin/URLController.php (Lines 122–129)",
        problem_text="In <code>completeAction()</code>, <code>$paymentInfo</code> is retrieved and accessed immediately (<code>$paymentInfo->amount + $paymentInfo->cpi</code>) without validating existence. It also checks <code>$vendorInfo->project_id</code> which is not maintained on the vendor record.",
        impact_text="When a newly assigned vendor achieves their first complete on a project, the null reference causes a fatal 500 error, aborting the completion flow.",
        solution_text="Retrieve project ID directly from <code>$leadsInfo->project_id</code>, check if a payment record exists, and initialize a new payment row if none is found.",
        code_snippet="$projectId = $leadsInfo->project_id;<br/>$payment = DB::table('payments')->where(['vendor_id' => $vendorInfo->id, 'project_id' => $projectId])->first();<br/>if ($payment) { ... } else { DB::table('payments')->insert([...]); }"
    ))

    # Problem 9
    story.append(make_issue_box(
        num="09",
        title="Singular Table Name Typos in Cascade Deletion",
        severity="MEDIUM",
        file_path="app/Http/Controllers/Admin/BidController.php (Lines 1197–1207)",
        problem_text="In <code>BidController::delete()</code>, the code attempts to delete from singular table names: <code>DB::table('bid_option')</code> and <code>DB::table('booking')</code>. The actual database tables are plural: <code>bid_options</code> and <code>bookings</code>.",
        impact_text="When a bid is deleted, its child options and bookings records are never purged, creating orphaned database records and distorting feasibility metrics.",
        solution_text="Correct table names to <code>bid_options</code> and <code>bookings</code>, or enforce foreign key cascades in MySQL.",
        code_snippet="DB::table('bid_options')->where('bid_id', $id)->delete();<br/>DB::table('bookings')->where('bid_id', $id)->delete();"
    ))

    story.append(PageBreak())

    # Problem 10
    story.append(make_issue_box(
        num="10",
        title="File Upload Field Name Inconsistency in Bid Updates",
        severity="MEDIUM",
        file_path="app/Http/Controllers/Admin/BidController.php (Lines 1327–1328)",
        problem_text="<code>updateSpec()</code> checks <code>if ($request->hasFile('bidfiles'))</code>, but iterates <code>foreach ($request->file('bid_files') as $file)</code>.",
        impact_text="Bid document attachments are silently dropped and never stored, or a TypeError is thrown if <code>$request->file('bid_files')</code> evaluates to null.",
        solution_text="Unify the field name across form inputs, validation rules, and file processing logic to <code>bid_files</code>.",
        code_snippet="if ($request->hasFile('bid_files')) {<br/>&nbsp;&nbsp;foreach ($request->file('bid_files') as $file) { ... }<br/>}"
    ))

    # Problem 11
    story.append(make_issue_box(
        num="11",
        title="Uncaught die($e) and Redundant Ghost Rows in Payments",
        severity="MEDIUM",
        file_path="app/Http/Controllers/Admin/PaymentsController.php (Lines 39–52)",
        problem_text="The catch block calls <code>die($e)</code>. Furthermore, updating a payment status unconditionally inserts a new blank payment record with <code>'amount' => 0</code> every time.",
        impact_text="Exceptions terminate execution abruptly with raw database stack traces exposed to client AJAX requests, and financial reporting tables are polluted with ghost zero-amount rows.",
        solution_text="Replace <code>die($e)</code> with Laravel logger: <code>\\Log::error(...)</code>, return a 500 JSON payload, and eliminate unnecessary row insertions.",
        code_snippet="catch (\\Exception $e) {<br/>&nbsp;&nbsp;DB::rollBack();<br/>&nbsp;&nbsp;\\Log::error('Payment Status Error: ' . $e->getMessage());<br/>&nbsp;&nbsp;return response()->json(['status' => false, 'message' => 'Update failed.'], 500);<br/>}"
    ))

    # Problem 12
    story.append(make_issue_box(
        num="12",
        title="Security Exposure: Adminer & Unprotected Root Files",
        severity="HIGH",
        file_path="adminer.php, .htaccess, and .env in Project Root",
        problem_text="1. <code>adminer.php</code> is present in the public web root.<br/>2. Root <code>.htaccess</code> lacks explicit denial rules preventing direct HTTP download of <code>.env</code>.",
        impact_text="High vulnerability to database credential compromise, automated port scans, and unauthorized remote database manipulation.",
        solution_text="1. Remove <code>adminer.php</code> from production.<br/>2. Configure Apache DocumentRoot to <code>public/</code>.<br/>3. Add explicit blocking rules in root <code>.htaccess</code> for <code>.env</code> and dotfiles.",
        code_snippet="# In root .htaccess:<br/>RewriteRule ^\\.env - [F,L]<br/>RewriteRule ^vendor/ - [F,L]"
    ))

    # Problem 13
    story.append(make_issue_box(
        num="13",
        title="Absence of Database Migrations for Core Tables",
        severity="LOW",
        file_path="database/migrations/",
        problem_text="Only 10 migrations exist in <code>database/migrations/</code>. 18+ core business tables (<code>projects</code>, <code>bids</code>, <code>vendor</code>, <code>leads</code>, <code>client</code>, etc.) have no migration files.",
        impact_text="Deploying to a fresh server or running <code>php artisan migrate:fresh</code> permanently destroys the schema with no automated reconstitution path.",
        solution_text="Reverse-engineer migrations from the live schema using <code>kitloong/laravel-migrations-generator</code> and commit them to version control.",
        code_snippet="composer require --dev kitloong/laravel-migrations-generator<br/>php artisan migrate:generate"
    ))

    # ================= 3. STEP-BY-STEP RESOLUTION MATRIX =================
    story.append(Spacer(1, 4))
    story.append(Paragraph("3. Actionable Priority Remediation Matrix", h1_style))
    story.append(Paragraph("This matrix sequences the fixes in order of criticality to ensure zero regressions during maintenance.", body_style))
    story.append(Spacer(1, 4))

    plan_table_data = [
        [Paragraph("<b>Priority</b>", h3_style), Paragraph("<b>Issue Reference</b>", h3_style), Paragraph("<b>Required Technical Fix</b>", h3_style), Paragraph("<b>Est. Time</b>", h3_style)],
        [
            Paragraph("<font color='#DC2626'><b>P0 (Blocker)</b></font>", body_style),
            Paragraph("Issue #01 (routes/web.php)", body_style),
            Paragraph("Remove DB query from routing file; define static controller routes.", body_style),
            Paragraph("20 mins", body_style)
        ],
        [
            Paragraph("<font color='#DC2626'><b>P0 (Blocker)</b></font>", body_style),
            Paragraph("Issue #02 (ProjectController)", body_style),
            Paragraph("Move <code>flagEmoji()</code> out of controller action to helper.", body_style),
            Paragraph("5 mins", body_style)
        ],
        [
            Paragraph("<font color='#DC2626'><b>P0 (Blocker)</b></font>", body_style),
            Paragraph("Issue #03 (ProjectController)", body_style),
            Paragraph("Add null check before reading <code>$status->status</code>.", body_style),
            Paragraph("5 mins", body_style)
        ],
        [
            Paragraph("<font color='#DC2626'><b>P0 (Blocker)</b></font>", body_style),
            Paragraph("Issue #05 (URLController)", body_style),
            Paragraph("Fix <code>getUserInfo()</code> to always return array fallback.", body_style),
            Paragraph("15 mins", body_style)
        ],
        [
            Paragraph("<font color='#DC2626'><b>P0 (Blocker)</b></font>", body_style),
            Paragraph("Issue #12 (Security)", body_style),
            Paragraph("Delete <code>adminer.php</code>; add <code>.htaccess</code> block for <code>.env</code>.", body_style),
            Paragraph("5 mins", body_style)
        ],
        [
            Paragraph("<font color='#B45309'><b>P1 (Next 48h)</b></font>", body_style),
            Paragraph("Issues #06, #07, #08", body_style),
            Paragraph("Sync vendor tables, support <code>[UID]</code> tokens, fix payment null check.", body_style),
            Paragraph("45 mins", body_style)
        ],
        [
            Paragraph("<font color='#B45309'><b>P1 (Next 48h)</b></font>", body_style),
            Paragraph("Issues #09, #10, #11", body_style),
            Paragraph("Fix table name typos in Bids; clean <code>die()</code> in Payments.", body_style),
            Paragraph("30 mins", body_style)
        ],
        [
            Paragraph("<font color='#2563EB'><b>P2 (Planned)</b></font>", body_style),
            Paragraph("Issue #13 (Migrations)", body_style),
            Paragraph("Generate missing migration scripts for all 18+ core tables.", body_style),
            Paragraph("1 hour", body_style)
        ],
    ]

    p_tbl = Table(plan_table_data, colWidths=[1.2 * inch, 1.8 * inch, 3.0 * inch, 1.0 * inch])
    p_tbl.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), BG_CARD),
        ('BOX', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(p_tbl)

    # Build PDF
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Report generated successfully: {filename}")

if __name__ == "__main__":
    out_pdf = os.path.join(os.getcwd(), "SMR_Problems_and_Solutions_Report.pdf")
    build_pdf(out_pdf)

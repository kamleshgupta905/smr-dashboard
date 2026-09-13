<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Project Assignment</title>
    <style>
        body,
        html {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            line-height: 1.6;
            font-size: 16px;
        }

        .email-container {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            border: 1px solid #007bff;
            border-radius: 10px;
            background-color: #f0f8ff;
        }

        .header {
            text-align: center;
            margin-bottom: 20px;
        }

        .header h2 {
            color: #007bff;
        }

        .project-details {
            margin-bottom: 20px;
            color: #333;
        }

        .project-details strong {
            color: #007bff;
        }

        .entry-link {
            color: #007bff;
            text-decoration: none;
            font-weight: bold;
            display: inline-flex;
            align-items: center;
        }

        .entry-link:hover {
            text-decoration: underline;
        }

        .entry-link::before {
            content: '🔗';
            margin-right: 5px;
        }

        .project-details ul {
            list-style-type: none;
            padding: 0;
        }

        .project-details li {
            margin-bottom: 10px;
        }
    </style>
</head>

<body>
    <div class="email-container">
        <div class="header">
            <h2>{{ $mailData->project_id }} Project Assigned Successfully!</h2>
        </div>
        <div class="project-details">
            <h2>Dear {{ $mailData->name }},</h2>
            <h3>We are pleased to inform you that a {{ $mailData->project_name }} project has been successfully assigned
                to you. Below are the details:</h3>
            <ul>
                <li><strong>Project ID :</strong> {{ $mailData->project_id }}</li>
                <li><strong>Client ID :</strong> {{ $mailData->client_id }}</li>
                <li><strong>Vendor ID :</strong> {{ $mailData->vendor_id }}</li>
                <li><strong>Project Entry Link:</strong> <a href="{{ url('/') }}/{{ $mailData->entry_link }}" class="entry-link" target="_blank">Click here to access</a></li>
                <li><strong>CPI Rate:</strong> {{ $mailData->cpi }}</li>
            </ul>
            <p>Please proceed with the project according to the provided details. If you have any questions or need
                further assistance, feel free to contact us.</p>
            <p>Thank you!</p>
        </div>
    </div>
</body>

</html>

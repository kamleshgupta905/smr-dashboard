<style>
    body {
        background: #f8f9fa;
        font-family: Arial, sans-serif;
    }

    .card {
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
    }

    .card:hover {
        box-shadow: 0 8px 12px rgba(0, 0, 0, 0.1);
    }

    .copy-icon {
        cursor: pointer;
        color: #007bff;
        font-size: 0.9rem;
        margin-left: 5px;
    }

    .copy-icon:hover {
        color: #0056b3;
    }

    .redirect-url {
        font-size: 0.8rem;
        color: #142df8;
    }

    .redirect-url:hover {
        color: #0056b3;
        text-decoration: none;
    }

    .center-heading {
        text-align: center;
    }
</style>
<div class="container-fluid">
    <div class="container">
        <div class="row">
            <div class="col">
                <!-- Centered heading with edit button -->
                <div class="d-flex justify-content-between align-items-center py-3">
                    <h2 class="h5 mb-0"><span class="text-muted .center-heading" style="margin: 5px 0 0 5px;">Client
                            Details</span></h2>
                    <a href="{{ url('admin/client/addedit') }}/{{ $userData->id }}" class="btn btn-outline-primary">Edit</a>
                </div>
                <div class="card mb-4" style="border-radius: 15px; margin-top: 20px; border: 1px solid black;">
                    <div class="card-body">
                        <p><strong>Client ID:</strong> {{ $userData->client_id }}</p>
                        <p><strong>Client Name:</strong> {{ $userData->client_name }}</p>
                        <p><strong>Registration Date:</strong> {{ date('d-M-Y', strtotime($userData->date)) }}</p>
                    </div>
                </div>
                <div class="card mb-4" style="border-radius: 15px; border: 1px solid black;">
                    <div class="card-body">
                        <h5>Description</h5>
                        <hr>
                        {!! $userData->description !!}
                    </div>
                </div>
                <div class="card mb-4" style="border-radius: 15px; border: 1px solid black;">
                    <div class="card-body">
                        <h5>Redirects</h5>
                        <hr>
                        <p><strong>Complete URL:</strong><br> <a
                                href="{{ url('/') }}/{{ $userData->complete_url }}" target="_blank"
                                class="redirect-url">"{{ url('/') }}/{{ $userData->complete_url }}"</a>
                            <i class="fas fa-copy copy-icon"></i>
                        </p>
                        <p><strong>Terminate URL:</strong><br> <a
                                href="{{ url('/') }}/{{ $userData->terminate_url }}" target="_blank"
                                class="redirect-url">"{{ url('/') }}/{{ $userData->terminate_url }}"</a>
                            <i class="fas fa-copy copy-icon"></i>
                        </p>
                        <p><strong>Quotafull URL:</strong><br> <a
                                href="{{ url('/') }}/{{ $userData->quotafull_url }}" target="_blank"
                                class="redirect-url">"{{ url('/') }}/{{ $userData->quotafull_url }}"</a>
                            <i class="fas fa-copy copy-icon"></i>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

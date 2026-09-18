<style>
    body {
        background: #f8f9fa;
        font-family: Arial, sans-serif;
    }

    .card {
        /* background: linear-gradient(135deg, #111827, #2d80f0) !important; */
        transition: all 0.3s ease;
        border-radius: 15px;
        border: 1px solid black;
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
        font-size: 0.9rem;
        color: #142df8;
        word-break: break-word;
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

                <!-- Heading -->
                <div class="d-flex justify-content-between align-items-center py-3">
                    <h2 class="h5 mb-0 text-muted">Client Details</h2>
                    <div class="d-flex gap-5">
                        <a href="{{ url('admin/client/addedit') }}/{{ $userData->id }}" class="btn btn-outline-primary">Edit</a>
                        <a href="{{ url('admin/client/') }}" class="btn btn-outline-primary">Clients List</a>
                    </div>
                </div>

                <!-- Basic Details -->
                <!--<div class="card mb-4 mt-3">-->
                <!--    <div class="card-body">-->
                <!--        <p><strong>Client ID:</strong> {{ $userData->client_id }}</p>-->
                <!--        <p><strong>Client Name:</strong> {{ $userData->client_name }}</p>-->
                <!--        <p><strong>Email:</strong> {{ $userData->email ?? '-' }}</p>-->
                <!--        <p><strong>Phone:</strong> {{ $userData->phone ?? '-' }}</p>-->
                <!--        <p><strong>Sales Rep:</strong> {{ $salesrep->name ?? '-' }}</p>-->
                <!--        <p><strong>Registration Date:</strong> {{ date('d-M-Y', strtotime($userData->date)) }}</p>-->
                <!--    </div>-->
                <!--</div>-->
                <div class="card mb-4 mt-3" id="client-details">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <h5>Client Details</h5>
                            <button class="btn btn-sm btn-outline-primary"
                                    onclick="copySection('client-details')">
                                <i class="fas fa-copy"></i> Copy
                            </button>
                        </div>
                        <hr>
                
                        <p><strong>Client ID:</strong> {{ $userData->client_id }}</p>
                        <p><strong>Client Name:</strong> {{ $userData->client_name }}</p>
                        <p><strong>Email:</strong> {{ $userData->email ?? '-' }}</p>
                        <p><strong>Phone:</strong> {{ $userData->phone ?? '-' }}</p>
                        <p><strong>Sales Rep:</strong> {{ $salesrep->name ?? '-' }}</p>
                        <p><strong>Registration Date:</strong> {{ date('d-M-Y', strtotime($userData->date)) }}</p>
                    </div>
                </div>


                <!-- Description -->
                <!--

                <!-- Address Section -->
                <!--<div class="card mb-4">-->
                <!--    <div class="card-body">-->
                <!--        <h5>Address</h5>-->
                <!--        <hr>-->
                <!--        <p><strong>Country:</strong> {{ $userData->country ?? '-' }}</p>-->
                <!--        <p><strong>State:</strong> {{ $userData->state ?? '-' }}</p>-->
                <!--        <p><strong>Street:</strong> {{ $userData->street ?? '-' }}</p>-->
                <!--        <p><strong>City:</strong> {{ $userData->city ?? '-' }}</p>-->
                <!--        <p><strong>ZIP:</strong> {{ $userData->zip ?? '-' }}</p>-->
                <!--    </div>-->
                <!--</div>-->
                <div class="card mb-4" id="address-details">
                    <div class="
                    card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <h5>Address</h5>
                            <button class="btn btn-sm btn-outline-primary"
                                    onclick="copySection('address-details')">
                                <i class="fas fa-copy"></i> Copy
                            </button>
                        </div>
                        <hr>
                
                        <p><strong>Country:</strong> {{ $userData->country ?? '-' }}</p>
                        <p><strong>State:</strong> {{ $userData->state ?? '-' }}</p>
                        <p><strong>Street:</strong> {{ $userData->street ?? '-' }}</p>
                        <p><strong>City:</strong> {{ $userData->city ?? '-' }}</p>
                        <p><strong>ZIP:</strong> {{ $userData->zip ?? '-' }}</p>
                    </div>
                </div>

                

                <!-- Banking Section -->
                <!--<div class="card mb-4">-->
                <!--    <div class="card-body">-->
                <!--        <h5>Banking Information</h5>-->
                <!--        <hr>-->
                <!--        <p><strong>Bank:</strong> {{ $userData->bank ?? '-' }}</p>-->
                <!--        <p><strong>IBAN:</strong> {{ $userData->iban ?? '-' }} -->
                <!--            @if($userData->iban)-->
                <!--                <i class="fas fa-copy copy-icon" onclick="copyToClipboard('{{ $userData->iban }}')"></i>-->
                <!--            @endif-->
                <!--        </p>-->
                <!--        <p><strong>Swift:</strong> {{ $userData->swift ?? '-' }} -->
                <!--            @if($userData->swift)-->
                <!--                <i class="fas fa-copy copy-icon" onclick="copyToClipboard('{{ $userData->swift }}')"></i>-->
                <!--            @endif-->
                <!--        </p>-->
                <!--        <p><strong>Tax No:</strong> {{ $userData->tax_no ?? '-' }}-->
                <!--            @if($userData->tax_no)-->
                <!--                <i class="fas fa-copy copy-icon" onclick="copyToClipboard('{{ $userData->tax_no }}')"></i>-->
                <!--            @endif-->
                <!--        </p>-->
                <!--        <p><strong>Currency:</strong> {{ $userData->currency ?? '-' }}</p>-->
                <!--    </div>-->
                <!--</div>-->
                <div class="card mb-4" id="banking-details">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <h5>Banking Information</h5>
                            <button class="btn btn-sm btn-outline-primary"
                                    onclick="copySection('banking-details')">
                                <i class="fas fa-copy"></i> Copy
                            </button>
                        </div>
                        <hr>
                
                        <p><strong>Bank:</strong> {{ $userData->bank ?? '-' }}</p>
                        <p><strong>IBAN:</strong> {{ $userData->iban ?? '-' }}</p>
                        <p><strong>Swift:</strong> {{ $userData->swift ?? '-' }}</p>
                        <p><strong>Tax No:</strong> {{ $userData->tax_no ?? '-' }}</p>
                        <p><strong>Currency:</strong> {{ $userData->currency ?? '-' }}</p>
                    </div>
                </div>


                <!-- Contacts Section -->
                @if(isset($userData->contacts) && count($userData->contacts) > 0)
                <div class="card mb-4">
                    <div class="card-body">
                        <h5>Contacts</h5>
                        <hr>
                        @foreach($userData->contacts as $contact)
                            <p>📞 {{ $contact->contact }}</p>
                        @endforeach
                    </div>
                </div>
                @endif

                <!-- Redirect URLs -->
                <!--<div class="card mb-4">-->
                <!--    <div class="card-body">-->
                <!--        <h5>Redirects</h5>-->
                <!--        <hr>-->

                <!--        @foreach(['complete_url' => 'Complete URL', 'terminate_url' => 'Terminate URL', 'quotafull_url' => 'Quotafull URL'] as $field => $label)-->
                <!--            @if($userData->$field)-->
                <!--                <p><strong>{{ $label }}:</strong><br>-->
                <!--                    <a href="{{ url('/') }}/{{ $userData->$field }}" target="_blank" class="redirect-url">-->
                <!--                        {{ url('/') }}/{{ $userData->$field }}-->
                <!--                    </a>-->
                <!--                    <i class="fas fa-copy copy-icon" onclick="copyToClipboard('{{ url('/') }}/{{ $userData->$field }}')"></i>-->
                <!--                </p>-->
                <!--            @endif-->
                <!--        @endforeach-->

                <!--    </div>-->
                <!--</div>-->
                <!-- Redirect URLs -->
                <div class="card mb-4" id="redirect-details">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <h5>Redirects</h5>
                            <button class="btn btn-sm btn-outline-primary"
                                    onclick="copySection('redirect-details')">
                                <i class="fas fa-copy"></i> Copy
                            </button>
                        </div>
                        <hr>
                
                        @if($userData->complete_url)
                            <p><strong>Complete URL:</strong> {{ url('/') }}/{{ $userData->complete_url }}</p>
                        @endif
                        @if($userData->terminate_url)
                            <p><strong>Terminate URL:</strong> {{ url('/') }}/{{ $userData->terminate_url }}</p>
                        @endif
                        @if($userData->quotafull_url)
                            <p><strong>Quotafull URL:</strong> {{ url('/') }}/{{ $userData->quotafull_url }}</p>
                        @endif
                    </div>
                </div>



            </div>
        </div>
    </div>
</div>
<script>
function copySection(sectionId) {
    const section = document.getElementById(sectionId);

    if (!section) {
        alert("Section not found");
        return;
    }

    let text = section.innerText
        .replace(/\n{2,}/g, '\n')
        .trim();

    navigator.clipboard.writeText(text).then(() => {
        alert("Copied successfully!");
    });
}
</script>


<script>
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text);
        alert("Copied: " + text);
    }
</script>

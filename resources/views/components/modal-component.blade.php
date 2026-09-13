<section class="layout-box-content-format1">
    <div class="modal fade" id="{{ $id }}" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog {{ $dialogclass }}">
            <div class="modal-content">
                <div class="modal-header card-header box-shdw text-white">
                    <h5 class="modal-title fa-1x p-1" id="header_title">{{ $title }}</h5>
                    <button type="button" class="close text-white" data-dismiss="modal">&times;</button>
                </div>
                <div class="modal-body {{ $bodyclass }}" id="bodyContent">

                </div>
                <!--/ App Wizard -->
                <div class="modal-footer">
                    <button type="button" class="btn btn-sm btn-danger" data-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>
</section>
<!--/ Create App Modal -->

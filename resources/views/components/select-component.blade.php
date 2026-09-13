<style>
/* ===== SELECT2 CLEAN UI ===== */

.select2-container--default .select2-selection--single {
    border: none !important;
    border-bottom: 2px solid #d1d5db !important;
    border-radius: 0 !important;
    background: transparent !important;
    height: 38px !important;
    display: flex !important;
    align-items: center !important;
}

/* TEXT */
.select2-container--default .select2-selection--single .select2-selection__rendered {
    padding-left: 0 !important;
    font-size: 14px !important;
    color: #111827 !important;
}

/* ARROW */
.select2-container--default .select2-selection--single .select2-selection__arrow {
    height: 100% !important;
    right: 0 !important;
}

/* DROPDOWN */
.select2-dropdown {
    background: #fff !important;
    border-radius: 8px !important;
    border: 1px solid #e5e7eb !important;
}

/* OPTIONS */
.select2-results__option {
    padding: 10px !important;
}

/* HOVER */
.select2-results__option--highlighted {
    background-color: #4f46e5 !important;
    color: #fff !important;
}

/* SELECTED */
.select2-results__option[aria-selected=true] {
    background-color: #e0e7ff !important;
}

/* WIDTH */
.select2-container {
    width: 100% !important;
}
</style>



<div class="{{ $column }}">
    <div class="form-group mb-2">
        <label for="{{ $id }}" class="form-label">{{ $label }}</label>

        <div id="{{ $id }}err">
            <select 
                class="form-control select2" 
                name="{{ $name }}" 
                id="{{ $id }}" 
                data-placeholder="Select {{ $label }}"
            >
                <option value=""></option>

                @foreach ($data as $list)
                    <option value="{{ $list->$arraykey }}"
                        {{ $value == $list->$arraykey ? 'selected' : '' }}>
                        {{ $list->$arrayValue }}
                    </option>
                @endforeach

            </select>  
        </div>   

        <div id="{{ $id }}_error" class="invalid-feedback d-block error-text"></div>
    </div>
</div>
<link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />

<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>
<script>
$(document).ready(function () {

    $('.select2').select2({
        width: '100%',
        dropdownParent: $('body'), // 🔥 important fix
        placeholder: function () {
            return $(this).data('placeholder');
        }
    });

});
</script>
<div class="{{ $column }}">
    <div class="form-group mb-3 validate-input">
        <label for="{{ $id }}" class="form-label">{{ $label }}</label>
        <input type="{{ $type }}" class="form-control {{ $class }}" id="{{ $id }}" name="{{ $name }}" placeholder="{{ $placeholder }}" value="{{ $value }}" autocomplete="off" />
        <div id="{{ $id }}_error" class="invalid-feedback d-block error-text">{{ $errorMsg ?? '' }}</div>
    </div>
</div>

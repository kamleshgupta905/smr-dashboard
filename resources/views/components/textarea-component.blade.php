<div class="{{ $column }}">
    <div class="form-group mb-3">
        <label for="{{ $id }}" class="form-label">{{ $label }}</label>
        <textarea id="{{ $id }}" name="{{ $name }}" class="form-control {{ $class }}" cols="{{ $cols }}" rows="{{ $rows }}" placeholder="{{ $placeholder }}">{{ $value }}</textarea>
       
        <div id="{{ $id }}_error" class="invalid-feedback d-block error-text"></div>
    </div>
</div>
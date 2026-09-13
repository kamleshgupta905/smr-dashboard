<div class="{{ $column }}">
    <div class="form-check {{ $radioColor }} mt-3">
        <input class="form-check-input" type="radio" value="{{ $value }}" name="{{ $name }}" id="{{ $id }}"  {{ $isChecked }} />
        <label class="form-check-label" for="{{ $id }}">
          {{ $label }}
        </label>
      </div>    
</div>
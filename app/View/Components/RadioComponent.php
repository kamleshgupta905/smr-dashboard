<?php

namespace App\View\Components;

use Illuminate\View\Component;

class RadioComponent extends Component
{
    public $column;
    public $name;
    public $id;
    public $class;
    public $label;  
    public $value;
    public $isChecked;
    public $radioColor;

    public function __construct( $column=null, $label = null, $name=null, $id = null, $class = null, $value=null,$isChecked,$radioColor='form-check-primary')    {
       
        $this->column = $column;
        $this->label = $label;
        $this->name = $name;       
        $this->id = $id;
        $this->class = $class; 
        $this->value = $value;
        $this->isChecked = $isChecked;
        $this->radioColor = $radioColor;
    }
    public function render()
    {
        return view('components.radio-component');
    }
}

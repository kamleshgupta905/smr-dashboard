<?php

namespace App\View\Components;

use Illuminate\View\Component;

class CheckboxComponent extends Component
{
    public $column;
    public $name;
    public $id;
    public $class;
    public $label;  
    public $value;
    public $isChecked;

    public function __construct( $column=null, $label = null, $name=null, $id = null, $class = null, $value=null,$isChecked)    {
       
        $this->column = $column;
        $this->label = $label;
        $this->name = $name;       
        $this->id = $id;
        $this->class = $class; 
        $this->value = $value;
        $this->isChecked = $isChecked;
    }
    public function render()
    {
        return view('components.checkbox-component');
    }
}

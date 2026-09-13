<?php

namespace App\View\Components;

use Illuminate\View\Component;

class InputComponent extends Component
{
    
    public $data;
    public $column;
    public $type;
    public $name;
    public $id;
    public $class;
    public $label;
    public $placeholder;
    public $value;
    public $errorMsg;

    public function __construct($data=[], $column=null,$type=null, $label = null, $name=null, $id = null, $class = null, $placeholder = null,$value=null,$errorMsg=null)
    {
        $this->data = $data;        
        $this->column = $column;
        $this->type = $type;
        $this->label = $label;
        $this->name = $name;       
        $this->id = $id;
        $this->class = $class;        
        $this->placeholder = $placeholder;
        $this->value = $value;
        $this->errorMsg = $errorMsg;
    }
    public function render()
    {
        return view('components.input-component');
    }
}

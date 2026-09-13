<?php

namespace App\View\Components;

use Illuminate\View\Component;

class TextareaComponent extends Component
{
    public $data;
    public $column;
    public $name;
    public $id;
    public $class;
    public $label;
    public $placeholder;
    public $value;
    public $cols;
    public $rows;

    public function __construct($data=[], $column=null, $label = null, $name=null, $id = null, $class = null, $placeholder = null,$value=null,$cols=null,$rows=null)
    {
        $this->data = $data;        
        $this->column = $column;
        $this->label = $label;
        $this->name = $name;       
        $this->id = $id;
        $this->class = $class;        
        $this->placeholder = $placeholder;
        $this->value = $value;
        $this->cols = $cols;
        $this->rows = $rows;
    }
    public function render()
    {
        return view('components.textarea-component');
    }
}

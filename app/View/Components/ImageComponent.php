<?php

namespace App\View\Components;

use Illuminate\View\Component;

class ImageComponent extends Component
{
    
    public $data;
    public $column;
    public $name;
    public $id;
    public $class;
    public $label;
    public $imagePreview;
    public $value;
    public $errorMsg;

    public function __construct($data=[], $column=null, $label = null, $name=null, $id = null, $class = null, $imagePreview = null,$value=null,$errorMsg=null)
    {
        $this->data = $data;        
        $this->column = $column;
        $this->label = $label;
        $this->name = $name;       
        $this->id = $id;
        $this->class = $class;        
        $this->imagePreview = $imagePreview;
        $this->value = $value;
        $this->errorMsg = $errorMsg;
    }
   
    public function render()
    {
        return view('components.image-component');
    }
}

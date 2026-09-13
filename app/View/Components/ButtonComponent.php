<?php

namespace App\View\Components;

use Illuminate\View\Component;

class ButtonComponent extends Component
{
    public $title;
    public $url; 
    public $mclass;  
    public $mtitle;  
    public $mhref;  
    public function __construct($title,$url=null,$mclass=null,$mtitle=null,$mhref=null)
    {
        $this->title = $title;
        $this->url = $url;    
        $this->mclass = $mclass;      
        $this->mtitle = $mtitle;      
        $this->mhref = $mhref;      
    }
  
    public function render()
    {
       
        return view('components.button-component');
    }
}

<?php

namespace App\View\Components;

use Illuminate\View\Component;

class ModalComponent extends Component
{
    public $id;
    public $title;
    public $dialogclass;
    public $bodyclass;
    public function __construct($id,$title,$dialogclass,$bodyclass)
    {
        $this->id= $id;
        $this->title= $title;
        $this->dialogclass= $dialogclass;
        $this->bodyclass= $bodyclass;
    }

    public function render()
    {
        return view('components.modal-component');
    }
}

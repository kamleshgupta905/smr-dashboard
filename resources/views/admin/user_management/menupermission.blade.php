<link rel="stylesheet" href="{{ asset('assets') }}/jstree/themes/default/style.min.css">
<script src="{{ asset('assets') }}/jstree/jstree.js"></script>
<script src="{{ asset('assets') }}/js/customJs/menupermission.js"></script>
<style>
    div.bhoechie-tab-container {
        z-index: 10;
        background-color: #eee;
        padding: 0 !important;
        border-radius: 4px;
        -moz-border-radius: 4px;
        border: 1px solid #ddd;
        -webkit-box-shadow: 0 6px 12px rgba(0, 0, 0, .175);
        box-shadow: 0 6px 12px rgba(0, 0, 0, .175);
        -moz-box-shadow: 0 6px 12px rgba(0, 0, 0, .175);
        background-clip: padding-box;
        opacity: 0.97;
        filter: alpha(opacity=97);
    }

    div.bhoechie-tab-menu {
        padding-right: 0;
        padding-left: 0;
        padding-bottom: 0;
    }

    div.bhoechie-tab-menu div.list-group {
        margin-bottom: 0;
    }

    div.bhoechie-tab-menu div.list-group>a {
        margin-bottom: 0;
    }

    div.bhoechie-tab-menu div.list-group>a .glyphicon,
    div.bhoechie-tab-menu div.list-group>a .fa {
        color: #5A55A3;
    }
    
    div.bhoechie-tab-menu div.list-group>a:first-child {
        border-top-right-radius: 0;
        -moz-border-top-right-radius: 0;
    }

    div.bhoechie-tab-menu div.list-group>a:last-child {
        border-bottom-right-radius: 0;
        -moz-border-bottom-right-radius: 0;
    }

    div.bhoechie-tab-menu div.list-group>a.active,
    div.bhoechie-tab-menu div.list-group>a.active .glyphicon,
    div.bhoechie-tab-menu div.list-group>a.active .fa {
        background-color: #5A55A3;
        background-image: #5A55A3;
        color: #ffffff;
    }

    div.bhoechie-tab-menu div.list-group>a.active:after {
        content: '';
        position: absolute;
        left: 100%;
        top: 50%;
        margin-top: -13px;
        border-left: 0;
        border-bottom: 13px solid transparent;
        border-top: 13px solid transparent;
        border-left: 10px solid #5A55A3;
    }

    div.bhoechie-tab-content {
        background-color: #eee;
        padding-left: 20px;
        padding-top: 10px;
    }

    div.bhoechie-tab div.bhoechie-tab-content:not(.active) {
        display: none;
    }

    .color-panel-heading {
        color: white !important;
        text-align: center;
        font-weight: 700;
        letter-spacing: 5px;
        border-bottom: 0px !important;
    }

    .list-group .custom-list-group-item {
        background: none;
        text-align: left;
        color: #FFF;
        font-weight: 600;
        font-family: Sans-serif;
        letter-spacing: 1px;
        border: 0;
        border-bottom-color: currentcolor;
        border-bottom-style: none;
        border-bottom-width: 0px;
        border-bottom: 1px dashed #f0f0f0;
        font-size: 12px;
    }

    .padding-col {
        padding-right: 14px !important;
        padding-left: 3px !important;
    }

    .mCustomScrollbar {
        max-height: 155px;
        height: 155px;
    }

    .col-lg-33 {
        width: 32% !important;
    }
    
    .row1 {
        margin-right: -36px !important;
        margin-left: -15px !important;
    }

    .col-mdpadding {
        padding-right: 4px !important;
        padding-left: 3px !important;
        margin-top: 7px;
    }

    .view-profile-button {
        border: 0;
        padding: 4px 6px !important;
        font-weight: 700 !important;
        font-size: 10px !important;
    }

    .book-emplyee-btn {
        border: 0;
        padding: 4px 6px !important;
        color: #bd1385 !important;
        font-weight: 700 !important;
        font-size: 10px !important;
        margin-left: 1px;
    }

    div.bhoechie-tab-menu div.list-group>a.active,
    div.bhoechie-tab-menu div.list-group>a.active .glyphicon,
    div.bhoechie-tab-menu div.list-grou {
        background-color: #468266 !important;
        color: #ffffff !important;
    }

    div.bhoechie-tab-menu div.list-group>a .glyphicon,
    div.bhoechie-tab-menu div.list-group>a .fa {
        color: #468266 !important;
        font-size: 13px !important;
    }

    .list-group-item.active {
        border-color: #468266 !important;
    }

    div.bhoechie-tab-menu div.list-group>a.active::after {
        border-left: 10px solid #468266 !important;
    }

    .img-margin {
        margin-top: 0% !important;
    }

    a.serviceName {
        color: #3f3030 !important;
        font-size: 12px !important;
        font-weight: 600 !important;
        text-align: left !important;
        letter-spacing: 1px !important;
    }

    .text-styling {
        line-height: 20px !important;
        letter-spacing: 45px;
    }

    .modal-dialog-custom {
        width: auto !important;
        margin: 9% 2% !important;
    }

    .booking-modal-dialog {
        width: 67% !important;
    }

    .team-employee-img {
        width: 250px;
        height: 250px;
        margin-top: 1% !important;
        margin-bottom: 1% !important;
        margin-left: initial !important;
    }

    .button-center-single-button {
        text-align: center;
    }

    .button-center {
        text-align: center;
    }

    ul .tabStyle {
        width: 50%;
        text-align: center;
        box-shadow: 0px 3px 8px -1px #ccc;
    }

    .nav-tabs>li.active>a,
    .nav-tabs>li.active>a:hover,
    .nav-tabs>li.active>a:focus {
        color: #fff !important;
        background-color: #F2652D !important;
        border: 1px solid #ccc !important;
    }


    .nav-tabs>li>a {
        color: #F2652D !important;
    }
</style>
<input type="hidden" name="userId" id="userId" value="">
<div class="container-fluid" style="width: 78%;">
   <div class="row row-container">
      <div class="col-md-12">
         <div id="getBranchWiseService" class="service-accordian-container">
            <div class="row bhoechie-tab-container">
               <div class="col-lg-3 col-lg-33 col-md-3 col-sm-3 col-xs-3 bhoechie-tab-menu">
                  <div class="list-group">
                     <?php 
                        foreach ($userList as $user) { ?>
                     <a href="javascript:;" id="<?php echo $user->id; ?>"
                        onclick="getUsersPermittedMenu(<?php echo $user->id; ?>);"
                        class="list-group-item serviceName text-center">
                        <h4 class="glyphicon glyphicon-user"> </h4>
                        <?php    echo $user->name; ?>
                     </a>
                     <?php } ?> 
                  </div>
               </div>
               <div id="myjstree" class="col-sm-6">
                    <ul>
                     <?php if (count($menulist) > 0) {
                        foreach ($menulist as $firstlevel) {
                            if (isset($firstlevel->children)) {  ?>
                                <li id="<?php echo $firstlevel->id; ?>">
                                    <?php echo $firstlevel->name;?>
                                        <ul><?php foreach ($firstlevel->children as $second_lvl) {
                                            if (isset($second_lvl->children)) { ?>
                                            <li id="<?php echo $second_lvl->id; ?>">
                                                <?php echo $second_lvl->name; ?>
                                        <ul>
                                        <?php foreach ($second_lvl->children as $third_lvl) { ?>
                                        <li id="<?php echo $third_lvl->id; ?>">
                                            <?php echo $third_lvl->name; ?>
                                        </li>
                                    <?php } ?>
                                    </ul>
                                </li>
                                <?php } else { ?>
                                    <li id="<?php echo $second_lvl->id;?>">
                                        <?php echo $second_lvl->name;?>
                                    </li>
                                <?php } } ?>
                    </ul>
                    </li> <?php } else { ?>
                    <li id="<?php echo $firstlevel->id; ?>">
                        <?php echo $firstlevel->name; ?>
                    </li>
                    <?php } } }?> 
                  </ul>
               </div>
            </div>
         </div>
      </div>
   </div>
</div>
<div id="btnusersaveDiv" style="margin: 50px auto;text-align: center;display: none;">
   <input type="Button" id="btnusersave" class="btn formBtn  bg-vio" value="Save" />
</div>

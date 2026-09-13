<?php

namespace App\Models\admin;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Menu extends Model
{
    use HasFactory;
    protected $fillable = ['name', 'url', 'parent_id'];
    public static $myGlobalVar = null;

    public function parent()
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children()
    {
        $userId = Menu::$myGlobalVar;
        return $this->hasMany(Menu::class, 'parent_id')
            ->leftJoin('menu_permissions', function ($join) use ($userId) {
                $join->on('menu_permissions.menu_id', '=', 'menus.id')
                    ->where('menu_permissions.user_id', '=', $userId);

            })
            ->where('menus.is_active', "Y")
            ->where('menu_permissions.id', '>', 0)    // added this condition for menu_permissions
            ->select(DB::raw('DISTINCT menus.*'))
            ->orderBy('menus.menu_srl');

    }
    public function scopeParents($query, $userId)
    {
        Menu::$myGlobalVar = $userId;
        return
            $query->whereNull('menus.parent_id')
                // ->where('menu_permissions.id', '>', 0)
                ->where('menus.is_active', 'Y')
                ->orderBy('menus.menu_srl');
    }

    public function childrenRecursive()
    {
        return $this->children()->with('childrenRecursive');
    }

    public function scopeRecursiveChildren($query, $parentIds = [])
    {
        $query->whereIn('parent_id', $parentIds);
        $childrenIds = $query->pluck('id')->toArray();

        if (!empty($childrenIds)) {
            $this->scopeRecursiveChildren($query, $childrenIds);
        }

        return $query;
    }

    public function menuPermissions()
    {
        return $this->hasMany(MenuPermission::class);
    }

    public function getUsersPermittedMenu($userId)
    {

        $menus = DB::table('menus')
            ->leftjoin('menu_permissions', 'menus.id', '=', 'menu_permissions.menu_id')
            ->select('menus.id')
            ->where('menu_permissions.user_id', '=', $userId)
            ->whereNotNull('menus.route')
            ->get();
        return $menus;
    }
    public function getPermittedMenuser($id)
    {

        $menus = DB::table('menus')
            ->leftjoin('menu_permissions', 'menus.id', '=', 'menu_permissions.menu_id')
            ->select('menus.id')
            ->where('menu_permissions.user_id', '=', $id)
            ->whereNotNull('menus.route')
            ->get();
        return $menus;
    }
}

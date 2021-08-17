<?php
header("Content-Type: application/json");
$data = json_decode(file_get_contents('data.json'));

// emulate network delay
// sleep(1);

$dir = SORT_ASC;
$sort = null;
$limit = 10;
$offset = 0;
if (isset($_GET['limit'])) {
    $limit = (int) $_GET['limit'];
    if ($limit < 1) {
        $limit = 10;
    }
}
if (isset($_GET['sort'])) {
    foreach (explode(',', $_GET['sort']) as $column) {
        //TODO handle multiple sort columns, use array, later check for array or string
        if (stristr($_GET['sort'], ':')) {
            $parts = explode(':', $_GET['sort'], 2);
            $sort = preg_replace('/[^a-z0-9\.\_\-]/i', '', $parts[0]);
            if ($parts[1] == 'dsc') {
                $dir = SORT_DESC;
            }
        }
    }
}
// do filters
if (isset($_GET['search'])) {
    $search = preg_replace('/[^a-z0-9\s\.\_\-]/i', '', $_GET['search']);
    $data = array_filter($data, function($o) use ($search) {
        foreach (get_object_vars($o) as $k=>$v) {
            if (stristr($v, $search)) {
                return true;
            }
        }
        return false;
    });
}
// do limit 
$data = array_slice($data, 0, $limit);
// format content
foreach ($data as &$item)
{
    $flag = strtolower($item->id);
    $item->content = sprintf("<img src=\"https://flagcdn.com/40x30/${flag}.png\" alt=\"{$item->value} flag\"> <strong>{$item->value}</strong>");
}

echo json_encode($data, JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE);

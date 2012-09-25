<?php

$post = file_get_contents( "php://input" );
$get = $_SERVER[ "QUERY_STRING" ];
echo $post ? $post : ( $get ? urldecode( $get ) : "empty" );

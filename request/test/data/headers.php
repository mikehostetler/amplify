<?php

header( "X-Amplify-Response: custom response header" );
echo json_encode( array( "header" => $_SERVER[ "HTTP_X_AMPLIFY_REQUEST" ] ) );

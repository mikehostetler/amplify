<?php

header( "X-AMPLIFY-RESPONSE: custom response header" );
echo json_encode( array( "header" => $_SERVER[ "HTTP_X_AMPLIFY_REQUEST" ] ) );

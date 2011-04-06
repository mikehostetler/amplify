<?php

echo $_REQUEST[ "callback" ] . "(" . json_encode( array( "foo" => "bar" ) ) . ")";
<!DOCTYPE html>
<html>
    <head>
        <title data-i18n="bre-title">Business rule editor</title>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        
        <link rel="stylesheet" href="css/style.css" />
        
        <script type="text/javascript">
            var $_GET = <?php echo json_encode($_GET); ?>;
        </script>
    </head>
    <body>
        <?php require 'content.inc.php';?>
        <script src="js/jquery-2.1.1.min.js"></script>
        <script src="js/jquery-ui-1.10.4.custom.min.js"></script>
        <script src="js/jstorage-0.4.8.min.js"></script>
        <script src="js/jquery.i18n.min.js"></script>
        <script src="js/jquery.json2.js"></script>
        <script src="js/jquery.ui-contextmenu.js"></script>
        <script src="js/jquery.apprise-v2.js"></script>
        <script src="js/jquery.bre.js"></script>
        <script src="js/jquery.bre.dragdrop.js"></script>
    </body>
</html>

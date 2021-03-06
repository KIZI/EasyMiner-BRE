<?php

namespace EasyMiner\BRE;

class Integration {

  /** @const string MODULE_NAME */
  const MODULE_NAME='BRE';

  /**
   * @var $javascriptFiles - this array contains list of javascript files for inclusion into page
   */
  public static $javascriptFiles = [
    'js/jquery-2.1.1.min.js',
    'js/jquery-ui-1.10.4.custom.min.js',
    'js/jstorage-0.4.8.min.js',
    'js/jquery.i18n.min.js',
    'js/jquery.json2.js',
    'js/jquery.ui-contextmenu.js',
    'js/jquery.apprise-v2.js',
    'js/jquery.bre.js',
    'js/jquery.bre.dragdrop.js'
  ];

  /**
   * @var $cssFiles - this array contains list of CSS files for inclusion into page
   */
  public static $cssFiles = [
    '../_miningUI/css/index.css',
    'css/index.css',
    'css/jquery.apprise-v2.css'
  ];

  /**
   * Funkce vracející obsah šablony
   * @return string
   */
  public static function getContent(){
    return file_get_contents(__DIR__.'/content.inc.php');
  }

}
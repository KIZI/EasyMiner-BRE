/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
(function($){
    
    /**
     * Overwrites original jQuery selector :contains to Case-Insensitive version.
     * Source: http://css-tricks.com/snippets/jquery/make-jquery-contains-case-insensitive/
     */
    $.expr[":"].contains = $.expr.createPseudo(function(arg) {
        return function( elem ) {
            return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
        };
    });
    
    /**
     * Array of all ajax requests, which can be aborted using abortAll function.
     * Source: http://stackoverflow.com/questions/1802936/stop-all-active-ajax-requests-in-jquery
     */
    $.xhrPool = [];
    $.xhrPool.abortAll = function() {
        $(this).each(function(idx, jqXHR) {
            jqXHR.abort();
        });
        $.event.trigger("ajaxStop");
        $.xhrPool.length = 0
    };
    $.ajaxSetup({
        beforeSend: function(jqXHR) {
            $.xhrPool.push(jqXHR);
        },
        complete: function(jqXHR) {
            var index = $.xhrPool.indexOf(jqXHR);
            if (index > -1) {
                $.xhrPool.splice(index, 1);
            }
        }
    });
    
    /** 
    * Applies i18n on element. Element has to have attribute 'data-i18n'.
    * If value of this attribute contains something between parentheses, rest
    * of value will be replaced instead of attribute, which name suits to expression
    * between parentheses. If not, it will call normal i18n function for content.
    */
    $.fn.i18nApply = function() {
        $(this).each(function(){
            var attr = $(this).attr('data-i18n'),
                regExp = /\(([^)]+)\)/,
                matches = regExp.exec($(this).attr('data-i18n')) || [];
            if(matches.length < 1){
                $(this)._t(attr);
            } else{
                $(this).attr(matches[1], $.i18n._(attr.replace(matches[0],'')));
            }
        });
    };
    
    /** 
    * Converts XML Interval to JSON.
    */
    $.fn.intervalToJson = function() { 
        var intervals = [];
        $(this).each(function(){
            intervals.push('["'+$(this).attr("closure")+'", "'+$(this).attr("leftMargin")
                +'", "'+$(this).attr("rightMargin")+'"]');
        });
        return (intervals.join(', '));
    };
    
    /** 
    * Converts XML Values to JSON.
    */
    $.fn.valuesToJson = function() { 
        var values = [];
        $(this).each(function(){
            values.push('"'+$(this).text()+'"');
        });
        return (values.join(', '));
    };
    
    /** 
    * Saves XML of rules to localStorage as String using jStorage plugin.
    * No more used, only for local files.
    */
//    $.fn.xmlToJsonRules = function() {  
//        $(this).find('AssociationRule').each(function(){
//            var actMetaId = $(this).attr('id');
//            if (window.ActiveXObject){ 
//                var xmlString = this; 
//            }
//            else {
//                var oSerializer = new XMLSerializer(); 
//                var xmlString = oSerializer.serializeToString(this);
//            } 
//            $.jStorage.set("rule-"+actMetaId, xmlString);
//            //$('#logDiv').append("rule-"+actMetaId+":"+actMeta+"<br />")
//            $('#rules ul').append('<li><a href="#" title="'+$.i18n._('bre-editRule')+' '+$(this).children('Text').text()+'" rel="'+actMetaId+'" class="linkRuleEdit">'+$(this).children('Text').text()+'</a></li>')
//        });
//        //$('#logDiv').append("<br />")
//    };
    
    /** 
    * Prints rule list to UI.
    */
    $.fn.printRuleList = function() {
        $('#rules ul').empty();
        $(this).find('AssociationRule').each(function(){
            $('#rules ul').append('<li><a href="#" title="'+$.i18n._('bre-editRule')+' '+$(this).children('Text').text()+'" rel="'+$(this).attr('id')+'" class="linkRuleEdit">'+$(this).children('Text').text()+'</a></li>');
        });
    };
    
    /** 
    * Saves XML of rule to localStorage as String using jStorage plugin.
    * @param {String} ruleId rules unique ID
    */
    $.fn.storageRule = function(ruleId) {
        var rule = $(this);
        if (window.ActiveXObject){ 
            var xmlString = rule[0]; 
        }
        else {
            var oSerializer = new XMLSerializer(); 
            var xmlString = oSerializer.serializeToString(rule[0]);
        } 
        $.jStorage.set("rule-"+ruleId, xmlString);
    };
    
    /** 
    * Converts XML of format to String in form of JSON.
    * Save all rules as jStorage.
    */
    $.fn.xmlToJsonFormat = function() {  
//        $(this).find('MetaAttribute').each(function(){
            var Format;
            var attName = $(this).children('Name').text();
            var attId = $(this).attr('id');
//            alert(attId);
            $(this).find('Format').each(function(){
                var forId = $(this).attr('id');
                binJson[forId] = {};
                var rangeType = $(this).find('Range').children()[0].nodeName;
                var range;
                if(rangeType=="Interval"){
                    range = $(this).find('Range Interval').intervalToJson();
                }
                else if(rangeType=="Value"){
                    range = $(this).find('Range Value').valuesToJson();
                }
                var Discrets = [];
                $(this).find('DiscretizationHint').each(function(){
                    var discretizationType = $(this).children()[1].nodeName;
                    var Bins = [];
                    if(discretizationType=="IntervalEnumeration"){
                        $(this).find('IntervalBin').each(function(){
//                            Bins.push('{"id": "'+$(this).attr('id')+'", "name": "'+
//                                    $(this).children('Name').text()+'", "vals": ['+
//                                    $(this).children('Interval').intervalToJson()+']}');
                            binJson[forId][$(this).attr('id')] = $.parseJSON('{"name": "in '+
                                    $(this).children('Name').text()+'", "vals": ['+
                                    $(this).children('Interval').intervalToJson()+']}');
                        });
                    }
                    else if(discretizationType=="NominalEnumeration"){
                        $(this).find('NominalBin').each(function(){
//                            Bins.push('{"id": "'+$(this).attr('id')+'", "name": "'+
//                                    $(this).children('Name').text()+'", "vals": ['+
//                                    $(this).children('Value').valuesToJson()+']}');
                            binJson[forId][$(this).attr('id')] = $.parseJSON('{"name": "'+
                                    $(this).children('Name').text()+'", "vals": ['+
                                    $(this).children('Value').valuesToJson()+']}');
                        });
                    }
                    Discrets.push('{"'+$(this).attr('id')+'": [{"name": "'+
                            $(this).children('Name').text()+'", "bins": ['+
                            Bins.join(', ')+']}]}');
                });
                Format = '{"name": "'+$(this).children('Name').text()+'", "metid": "'+attId+'", "range": {"'+rangeType+'": ['+range+']}, "discrets": ['+Discrets.join(', ')+']}';
                forJson[$(this).attr('id')] = $.parseJSON(Format);
            });
//        });
    };
    
    /** 
    * Converts XML datas to String in form of JSON.
    * Save all rules as jStorage.
    * No more used, leave only for local files testing.
    */
//    $.fn.xmlToJsonDatas = function() {  
//        $(this).find('MetaAttribute').each(function(){
//            var Format;
//            var attName = $(this).children('Name').text();
//            var attId = $(this).attr('id');
//            $(this).find('Format').each(function(){
//                var forId = $(this).attr('id');
//                binJson[forId] = {};
//                var rangeType = $(this).find('Range').children()[0].nodeName;
//                var range;
//                if(rangeType=="Interval"){
//                    range = $(this).find('Range Interval').intervalToJson();
//                }
//                else if(rangeType=="Value"){
//                    range = $(this).find('Range Value').valuesToJson();
//                }
//                var Discrets = [];
//                $(this).find('DiscretizationHint').each(function(){
//                    var discretizationType = $(this).children()[1].nodeName;
//                    var Bins = [];
//                    if(discretizationType=="IntervalEnumeration"){
//                        $(this).find('IntervalBin').each(function(){
////                            Bins.push('{"id": "'+$(this).attr('id')+'", "name": "'+
////                                    $(this).children('Name').text()+'", "vals": ['+
////                                    $(this).children('Interval').intervalToJson()+']}');
//                            binJson[forId][$(this).attr('id')] = $.parseJSON('{"name": "in '+
//                                    $(this).children('Name').text()+'", "vals": ['+
//                                    $(this).children('Interval').intervalToJson()+']}');
//                        });
//                    }
//                    else if(discretizationType=="NominalEnumeration"){
//                        $(this).find('NominalBin').each(function(){
////                            Bins.push('{"id": "'+$(this).attr('id')+'", "name": "'+
////                                    $(this).children('Name').text()+'", "vals": ['+
////                                    $(this).children('Value').valuesToJson()+']}');
//                            binJson[forId][$(this).attr('id')] = $.parseJSON('{"name": "'+
//                                    $(this).children('Name').text()+'", "vals": ['+
//                                    $(this).children('Value').valuesToJson()+']}');
//                        });
//                    }
//                    Discrets.push('{"'+$(this).attr('id')+'": [{"name": "'+
//                            $(this).children('Name').text()+'", "bins": ['+
//                            Bins.join(', ')+']}]}');
//                });
//                Format = '{"name": "'+$(this).children('Name').text()+'", "metid": "'+attId+'", "range": {"'+rangeType+'": ['+range+']}, "discrets": ['+Discrets.join(', ')+']}';
//                forJson[$(this).attr('id')] = $.parseJSON(Format);
//            });
////            var actMeta = '{"name": "'+attName+'", "formats": ['+Formats.join(', ')+']}';
//            
//            //$.cookie(actMetaId, actMeta, { expires: 1, path: '/' });
//            
//            attJson[attId] = attName;
//            
////            att.push({label: attJson[attId], category: "Att"});
//            
////            $('#logDiv').append(attId+": "+Format+"<br /><br />");
//        });
////        $('#logDiv').append("<br />");
//    };

})(jQuery);

/* probably unused 
var catJson = {};
var relJson = {};*/

var actRule,        // actual Rule, which is edited
    api,            // JSON with api-connect
    attJson = {},   // JSON of all metaattributes in knowledge base
    binJson = {},   // JSON of all bins in knowledge base
    config,         // JSON of config
    edited = false, // boolean if the rule was changed or not
    forJson = {},   // JSON of formats
    rels = [];      // relations - used mainly in Autocomplete version

$.when(
    $.ajax({
        url: "js/config.json",
        dataType: "json",
        success: function(data) {
            config = data;
            api = config['api-connect'];
        }
//    }),
//  these AJAX calls used to be datas and rules for testing
//    $.ajax({
//        url: "js/data-demo.xml",
//        dataType: "xml",
//        success: function(xml){
//            $(xml).xmlToJsonDatas();
//        }
//    }),
//
//    $.ajax({
//        url: "js/rules-demo.xml",
//        dataType: "xml",
//        success: function(xml){
//            $(xml).xmlToJsonRules();
//        }
    })
).then(function(){
    $.jStorage.flush()
    getRules();
    $.ajax({
        url: api.server+api['metaattribute-list'],
        dataType: "xml",
        success: function(xml){
            $(xml).find('MetaAttribute').each(function(){
                attJson[$(this).attr('id')] = $(this).children('Name').text();
            });
            printAtt();
        }
    });
    $.ajax({
        url: "i18n/"+config.locale+".json",
        dataType: "json",
        success: function(data) {
            $.i18n.load(data);
            $('*[data-i18n]').i18nApply();
            applyConfig();
        }
    });
});

/**
 * Gets rule list from server.
 */
getRules = function(){
    $.ajax({
        url: api.server+api['rule-list'],
        dataType: "xml",
        success: function(xml){
            $(xml).printRuleList();
        }
    });
}

/** 
* Converts rule in JSON form to editable HTML in editor.
* @param {String} id of rule to be print
*/
ruleToHtml = function(id) {
    emptyConExe();
    getRule(id, function(){
        actRule = id;
        var ruleJson = $.parseXML($.jStorage.get("rule-"+id));
        var $attributes = $(ruleJson).find('Attribute');
        var i = 0
        $attributes.each(function(){
            if(typeof forJson[$(this).attr('format')] == 'undefined'){
                $.ajax({
                    url: api.server+api['format-detail']+$(this).attr('format'),
                    dataType: "xml",
                    async: false,
                    success: function(xml){
                        i++;
                        $(xml).find('MetaAttribute').xmlToJsonFormat();
                    }
                });
            }
        });
        var $Antecedent = $(ruleJson).find('Antecedent');
        var $Consequent = $(ruleJson).find('Consequent');
        $($Antecedent[0]).rulePartToxHtml('Antecedent');
        $($Consequent[0]).rulePartToxHtml('Consequent');
        edited = false;
        triggerAfterInsert();
    });
};
    
/** 
* Checks if is XML of rule in localStorage or not.
* @param {String} ruleId of rule
* @param {callback} callback function to be called after ajax or function ends
*/
getRule = function(ruleId, callback) {
    var storageRules = $.jStorage.index();
    if($.inArray("rule-"+ruleId, storageRules) < 0){
        $.ajax({
            url: api.server+api['rule-detail']+ruleId,
            dataType: "xml",
            success: function(xml){
                $(xml).find('AssociationRule').storageRule(ruleId);
                callback();
            }
        });
    }
    else{
        callback();
    }
};

/*
 * Controls if the rule should be saved on unload event.
 * Checks if the rule has interesting amount of elements and than if was edited.
 */
$( window ).bind('beforeunload', function(){
    var notEmpty = ($(".dragDropBox .button:not(.noSortable)", '#Antecedent').length > 2 ||
        $(".dragDropBox .button:not(.noSortable)", '#Consequent').length > 2);
    if(notEmpty){
        if(edited) return $.i18n._('bre-info-unloadQuestion');
    }
});

/*
 * Adds click listener for list of rules.
 */
$( document ).on("click", ".linkRuleEdit", function(){
    ruleToHtml($(this).attr('rel'));
}).ajaxStart(function(){
    $('#infoBox').css('visibility', 'visible');
}).ajaxStop(function() {
    $('#infoBox').css('visibility', 'hidden');
});

$('#saveRule').click(function(){
    var lastId;
    var ruleXml = '<AssociationRule';
    if(typeof actRule != 'undefined'){
        ruleXml += ' id="'+actRule+'"';
    }
    ruleXml += '><Text>'+defRuleName()+'</Text><Antecedent>'+
            $('#Antecedent').validateRule()+'</Antecedent><Consequent>'+
            $('#Consequent').validateRule()+'</Consequent></AssociationRule>';
    var $ruleXml = $.parseXML(ruleXml);
    $($ruleXml).find('AssociationRule').storageRule(actRule);
    $.ajax({
        type: 'POST',
        url: api.server+api['rule-save'],
        data: { id: actRule, data: ruleXml },
        dataType: "xml",
        success: function(response){
            emptyConExe();
            showSmallError($.i18n._('bre-rule-saved'));
            getRules();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            alert(xhr.status);
            alert(ajaxOptions);
            alert(thrownError);
       }
    });
    
//    alert(ruleXml);
}).button({
    icons: {
        primary: 'ui-icon-disk'
    }
});

$('#resetServer').click(function(){
    $.ajax({
        url: api.server+api.reset,
        success: function(response){
            location.reload(true);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            alert(xhr.status);
            alert(ajaxOptions);
            alert(thrownError);
       }
    });
}).button({
    icons: {
        primary: 'ui-icon-refresh'
    }
});

$('#closeRule').click(function(){
    actRule = undefined;
    emptyConExe();
}).button({
    icons: {
        primary: 'ui-icon-trash'
    }
});

$('#cssTouch').click(function(){
    if($('head link[href="css/styleTouch.css"]').length > 0){
        $('head link[href="css/styleTouch.css"]').remove();
        $('.ui-button-text', this).text($.i18n._('bre-button-touchCssEnable'));
    }
    else{
        $('head').append('<link rel="stylesheet" href="css/styleTouch.css" type="text/css" />');
        $('.ui-button-text', this).text($.i18n._('bre-button-touchCssDisable'));
    }
}).button({
    icons: {
        primary: 'ui-icon-newwin'
    }
});
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
    * Prints rule list to UI.
    */
    $.fn.printRuleList = function() {
        $('#rules ul').empty();
        $(this).find('Rule').each(function(){
            $('#rules ul').append('<li><a href="#" title="'+$.i18n._('bre-editRule')+' '+$(this).children('Text').text()+'" rel="'+$(this).attr('id')+'" class="linkRuleEdit">'+$(this).children('Text').text()+'</a><a href="#" title="'+$.i18n._('bre-link-ruleDelete')+'" class="ui-state-error ruleDelete"><span class="ui-icon ui-icon-cancel"/></li>');
        });
    };
    
    /** 
    * Saves XML of rule to localStorage as String using jStorage plugin.
    * @param {String} ruleId rules unique ID
    */
    $.fn.storageRule = function(ruleId) {
        var rule = $(this);
        var xmlString;
        if (window.ActiveXObject){ 
            xmlString = rule[0]; 
        }
        else {
            var oSerializer = new XMLSerializer(); 
            xmlString = oSerializer.serializeToString(rule[0]);
        } 
        $.jStorage.set("rule-"+ruleId, xmlString);
    };
    
    /** 
    * Converts XML of format to String in form of JSON.
    * Save all rules as jStorage.
    */
    $.fn.xmlToJsonFormat = function() {  
            var Format;
            var attName = $(this).children('Name').text();
            var attId = $(this).attr('id');
            binJson[attId] = {};
            var rangeType = $(this).find('Range').children()[0].nodeName;
            var range;
            if(rangeType=="Interval"){
                range = $(this).find('Range Interval').intervalToJson();
            }
            else if(rangeType=="Value"){
                range = $(this).find('Range Value').valuesToJson();
            }
            $(this).find('Bin').each(function(){
                var discretizationType = $(this).children()[1].nodeName;
                var Bins = [];
                if(discretizationType=="Interval"){
                        var vals = $(this).children('Interval').intervalToJson();
                        var title = $($.parseJSON('['+vals+']')).printInterval();
                        binJson[attId][$(this).attr('id')] = $.parseJSON('{"name": "in '+
                                $(this).children('Name').text()+'", "title": "'+
                                title+'", "vals": ['+vals+']}');
                }
                else if(discretizationType=="Value"){
                        var vals = $(this).children('Value').valuesToJson();
                        binJson[attId][$(this).attr('id')] = $.parseJSON('{"name": "'+
                                $(this).children('Name').text()+'", "title": ['+
                                vals+'], "vals": ['+vals+']}');
                }
            });
            Format = '{"name": "'+$(this).children('Name').text()+'", "range": {"'+rangeType+'": ['+range+']}}';
            forJson[$(this).attr('id')] = $.parseJSON(Format);
    };

})(jQuery);

var actRule,        // actual Rule, which is edited
    api,            // JSON with api-connect
    attJson = {},   // JSON of all metaattributes in knowledge base
    binJson = {},   // JSON of all bins in knowledge base
    config,         // JSON of config
    edited = false, // boolean if the rule was changed or not
    forJson = {},   // JSON of formats
    changedFormats = [],    // array of changed Formats
    rels = [];      // relations - used mainly in Autocomplete version

$.when(
    $.ajax({
        url: "js/config.json",
        dataType: "json",
        success: function(data) {
            config = data;
            api = config['api-connect'];
        }
    })
).then(function(){
    $.jStorage.flush()
    getRules();
    $.ajax({
        url: api.server+strSymReplace(api['attribute-list'], $_GET.baseId),
        dataType: "xml",
        success: function(xml){
            $(xml).find('Attribute').each(function(){
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
        url: api.server+strSymReplace(api['rule-list'], $_GET.ruleset, $_GET.baseId),
        dataType: "xml",
        success: function(xml){
            $(xml).printRuleList();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            alert(xhr.status);
            alert(ajaxOptions);
            alert(thrownError);
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
        var $attributes = $(ruleJson).find('RuleAttribute');
        var i = 0
        $attributes.each(function(){
            if(typeof forJson[$(this).attr('attribute')] == 'undefined'){
                $.ajax({
                    url: api.server+strSymReplace(api['attribute-get'], $(this).attr('attribute'), $_GET.baseId),
                    dataType: "xml",
                    async: false,
                    success: function(xml){
                        i++;
                        $(xml).find('Attribute').xmlToJsonFormat();
                    }
                });
            }
        });
        var $Antecedent = $(ruleJson).find('Antecedent');
        var $Consequent = $(ruleJson).find('Consequent');
        $($Antecedent[0]).rulePartToxHtml('Antecedent');
        $($Consequent[0]).rulePartToxHtml('Consequent');
        var $rating = $(ruleJson).find('Rating');
        $("#confidence").val($rating.attr('confidence'));
        $("#support").val($rating.attr('support'));
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
            url: api.server+strSymReplace(api['rule-get'], ruleId, $_GET.ruleset, $_GET.baseId),
            dataType: "xml",
            success: function(xml){
                $(xml).find('Rule').storageRule(ruleId);
                callback();
            }
        });
    }
    else{
        callback();
    }
};
    
/** 
* Substitutes %s with parameters given in list. %%s is used to escape %s.
* Source: i18n plugin https://github.com/recurser/jquery-i18n/blob/master/jquery.i18n.js
* @param {String} str to perform printf on
* @param {String} args Array of arguments for printf
* @returns {String} substituted string
*/
strSymReplace = function(str) {
    var args = Array.prototype.slice.call(arguments, 1);
    $.each(args, function(key, val){
        if(typeof val == 'undefined'){
            args[key] = '';
        }
    });
    if(arguments.length < 2) return str;
    return str.replace(/([^%]|^)%(?:(\d+)\$)?s/g, function(p0, p, position) {
        if(position) return p + args[parseInt(position)-1];
        return p + args.shift();
    }).replace(/%%s/g, '%s');
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
}).on("click", ".ruleDelete", function(){
    var $this = $(this),
        $rule = $this.siblings('a');
    if($rule.attr('rel') == actRule){
        showSmallError($.i18n._('bre-rule-cantDelete'));
    }
    else{
        Apprise($.i18n._('bre-apprise-delrule-question', $rule.text()), {
            animation: 10,
            buttons: {
                confirm: {
                    text: $.i18n._('bre-apprise-newrule-confirm'),
                    id: 'delrule-confirm',
                    action: function(e){
                        $.ajax({
                            url: api.server+strSymReplace(api['rule-delete'], $rule.attr('rel'), $_GET.ruleset, $_GET.baseId),
                            dataType: "html",
                            success: function(response){
                                if(response == 'DELETED'){
                                    showAlert($.i18n._('bre-rule-deleted'), 'success');
                                }
                                else{
                                    showSmallError($.i18n._('bre-rule-undeleted'))
                                }
                                getRules();
                            }
                        });
                        Apprise('close');
                    }
                },
                cancel: {
                    text: $.i18n._('bre-apprise-newrule-cancel'),
                    id: 'delrule-cancel',
                    action: function(e){
                        Apprise('close');
                    }
                }
            },
            input: false,
            opacity: '0.80'
        });
    }
}).ajaxStart(function(){
    $('#infoBox').css('visibility', 'visible');
}).ajaxStop(function() {
    $('#infoBox').css('visibility', 'hidden');
});

$("#confidence").spinner({
    min: 0.01,
    max: 1.00,
    step: 0.01,
    numberFormat: "n"
});
$("#support").spinner({
    min: 0.01,
    max: 1.00,
    step: 0.01,
    numberFormat: "n"
});

$('#newRule').click(function(){
    if((($(".dragDropBox .button:not(.noSortable)", '#Antecedent').length > 2 &&
        $(".dragDropBox .button:not(.noSortable)", '#Consequent').length > 2) ||
        typeof actRule != 'undefined') && edited){
        Apprise($.i18n._('bre-apprise-newrule-question'), {
            animation: 10,
            buttons: {
                confirm: {
                    text: $.i18n._('bre-apprise-newrule-confirm'),
                    id: 'newrule-confirm',
                    action: function(e){
                        Apprise('close');
                        $('#saveRule').click();
                    }
                },
                cancel: {
                    text: $.i18n._('bre-apprise-newrule-cancel'),
                    id: 'newrule-cancel',
                    action: function(e){
                        edited = true;
                        emptyConExe();
                        Apprise('close');
                    }
                }
            },
            input: false,
            opacity: '0.80'
        });
    }
    else{
        edited = true;
        emptyConExe();
    }
}).button({
    icons: {
        primary: 'ui-icon-document'
    }
});

$('#saveRule').click(function(){
    var lastId;
    var ruleXml = '<Rule xmlns="'+config["rule-ns"]+'"';
    if(typeof actRule != 'undefined'){
        ruleXml += ' id="'+actRule+'"';
    }
    ruleXml += '><Text>'+defRuleName()+'</Text><Antecedent>'+
            $('#Antecedent').validateRule()+'</Antecedent><Consequent>'+
            $('#Consequent').validateRule()+'</Consequent><Rating confidence="'+
            $("#confidence").val()+'" support="'+$("#support").val()+'"/></Rule>';
//    var $ruleXml = $.parseXML(ruleXml);
    $.ajax({
        type: 'POST',
        url: api.server+strSymReplace(api['rule-save'], actRule, $_GET.ruleset, $_GET.baseId),
        data: { data: ruleXml },
        dataType: "xml",
        success: function(response){
            if(changedFormats.length > 0){
                $(changedFormats).each(function(){
                    forJson[this] = undefined;
                    binJson[this] = undefined;
                    $.ajax({
                        url: api.server+strSymReplace(api['attribute-get'], this, $_GET.baseId),
                        dataType: "xml",
                        async: false,
                        success: function(xml){
                            $(xml).find('Attribute').xmlToJsonFormat();
                        }
                    });
                });
                changedFormats = [];
            }
            emptyConExe();
            showAlert($.i18n._('bre-rule-saved'), 'success');
            getRules();
            $newRule = $(response).find('Rule');
            $newRule.storageRule($($newRule).attr('id'));
        },
        error: function (xhr, ajaxOptions, thrownError) {
            alert(xhr.status);
            alert(ajaxOptions);
            alert(thrownError);
       }
    });
}).button({
    icons: {
        primary: 'ui-icon-disk'
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
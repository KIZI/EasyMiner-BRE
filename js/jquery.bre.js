var actRule,        // actual Rule, which is edited
    dataJson = {},  // JSON of data of attributes
    binJson = {},   // JSON of all bins in knowledge base //TODO remove?
    edited = false, // boolean if the rule was changed or not
    forJson = {},   // JSON of formats //TODO remove?
    changedFormats = [],    // array of changed Formats //TODO remove?
    rels = [];      // relations - used mainly in Autocomplete version

var init = function(){
    $.jStorage.flush();
    getRules();
    $.ajax({
        url: config.getAttributeListUrl(minerId),
        dataType: "json",
        success: function(data){
            printAttributes(data);
        }
    });

    $.ajax({
        url: breResourcesUrl+"/i18n/"+config.locale+".json",
        dataType: "json",
        success: function(data) {
            $.i18n.load(data);
            $('*[data-i18n]').i18nApply();
            applyConfig();
        }
    });
};

/**
 * Gets rule list from server.
 */
getRules = function(){
    $.ajax({
        url: config.getRuleListUrl(rulesetId),
        dataType: "json",
        success: printRuleList,
        error: function (xhr, ajaxOptions, thrownError) {
            alert(xhr.status);
            alert(ajaxOptions);
            alert(thrownError);
       }
    });
};

/** 
* Converts rule in JSON form to editable HTML in editor.
* @param {String} id of rule to be print
*/
ruleToHtml = function(id) {
    emptyConExe();
    getRule(id, function(){
        actRule = id;
        var ruleXml = $.parseXML($.jStorage.get("rule-"+id));
        var ruleAttributes = $(ruleXml).find('RuleAttribute');
        ruleAttributes.each(function(){
            var ruleAttribute=$(this);
            var attributeId=ruleAttribute.attr('attribute');

            //region načtení atributu, pokud ještě není známý
            if(typeof dataJson['attribute:'+attributeId] == 'undefined'){
                $.ajax({
                    url: config.getAttributeUrl(attributeId),
                    dataType: "json",
                    async: false,
                    success: function(json){
                        processAttributeDetailsJson(json);
                    }
                });
            }
            //endregion načtení atributu, pokud ještě není známý
        });

        var $Antecedent = $(ruleXml).find('Antecedent');
        var $Consequent = $(ruleXml).find('Consequent');
        $($Antecedent[0]).rulePartToxHtml('Antecedent');
        $($Consequent[0]).rulePartToxHtml('Consequent');
        var $rating = $(ruleXml).find('Rating');
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
            url: config.getRuleUrl(ruleId, rulesetId),
            dataType: "xml",
            success: function(xml){
                $(xml).storageRule(ruleId);
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
}).on("click", ".linkRuleDelete", function(){
    hideAllMessages();
    var ruleId=$(this).attr('rel');
    var ruleLink = $('#rule-'+ruleId+' a.linkRuleEdit');
    Apprise($.i18n._('bre-apprise-delrule-question', ruleLink.text()), {
        animation: 10,
        buttons: {
            confirm: {
                text: $.i18n._('bre-apprise-newrule-confirm'),
                id: 'delrule-confirm',
                action: function(e){
                    $.ajax({
                        url: config.getRemoveRuleUrl(ruleId, rulesetId),
                        dataType: "json",
                        success: function(response){
                            if(response.state == 'ok'){
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
    hideAllMessages();
    //region sestavení XML zápisu pravidla
    var ruleXml = '<Rule xmlns="'+config["rule-ns"]+'"';
    if(typeof actRule != 'undefined'){
        ruleXml += ' id="'+actRule+'"';
    }
    ruleXml += '>';
    var antecedentContent=$('#Antecedent').validateRule();
    if (antecedentContent){
      ruleXml +='<Antecedent>'+antecedentContent+'</Antecedent>';
    }
    ruleXml +='<Consequent>'+
            $('#Consequent').validateRule()+'</Consequent><Rating confidence="'+
            $("#confidence").val()+'" support="'+$("#support").val()+'"/></Rule>';
    //endregion sestavení XML zápisu pravidla
    //odeslání požadavku na uložení pravidla
    $.ajax({
        type: 'POST',
        url: config.getSaveRuleUrl(actRule, rulesetId),
        data: ruleXml,
        dataType: "xml",
        success: function(response){
            if(changedFormats.length > 0){
                /*TODO aktuálně nepoužívané
                $(changedFormats).each(function(){
                    forJson[this] = undefined;
                    binJson[this] = undefined;
                    $.ajax({
                        url: config.getAttributeUrl(this, rulesetId),
                        dataType: "xml",
                        async: false,
                        success: function(xml){
                            $(xml).find('Attribute').xmlToJsonFormat();
                        }
                    });
                });
                changedFormats = [];
                */
            }
            if(typeof actRule != 'undefined'){
                //smažeme dané pravidlo z localstorage (mohlo dojít ke změně jeho IDčka)
                $.removeStoredRule(actRule);
                actRule=null;
            }
            emptyConExe();
            showAlert($.i18n._('bre-rule-saved'), 'success');
            getRules();
            $newRule = $(response).find('Rule');
            $newRule.storageRule($($newRule).attr('id'));
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.error(thrownError);
            showAlert($.i18n._('bre-rule-unsaved'), 'error');
       }
    });
}).button({
    icons: {
        primary: 'ui-icon-disk'
    }
});

if (scorerUrl){
  $('#evaluateModel').click(function(){
    window.open(scorerUrl,'evaluateModel');
  });
  $('#evaluateModel').removeClass('hidden');
}


/*
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
*/

/**
 * Prints rule list to UI.
 */
var printRuleList = function(rulesetJson) {
    var rulesUl=$('#rules-list');
    rulesUl.empty();
    $.each(rulesetJson.rules,function(ruleId,rule){

        var ruleA = $('<a href="#" class="linkRuleEdit"></a>');
        ruleA.attr('rel',rule.id);
        ruleA.attr('title',$.i18n._('bre-editRule')+' '+rule.text);
        ruleA.text(rule.text);

        var ruleLi=$('<li class="rule"></li>');
        ruleLi.attr('id','rule-'+rule.id);
        ruleLi.html(ruleA);

        ruleLi.append('<span class="ruleActions">' +
                        '<a href="#" title="'+$.i18n._('bre-editRule')+'" rel="'+rule.id+'" class="edit linkRuleEdit"></a>' +
                        '<a href="#" title="'+$.i18n._('bre-link-ruleDelete')+'" rel="'+rule.id+'" class="delete linkRuleDelete"></a>' +
                      '</span>');
        ruleLi.append('<span class="ims"><span>Confidence: <span class="value">'+(Math.round(rule.confidence*1000)/1000)+'</span></span><span>Support: <span class="value">'+(Math.round(rule.support*1000)/1000)+'</span></span>');

        rulesUl.append(ruleLi);
    });
};


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
     * Removes rule from localStorage
     * @param {String} ruleId rules unique ID
     */
    $.removeStoredRule = function(ruleId){
        $.jStorage.deleteKey("rule-"+ruleId);
    };

    /** TODO nepoužíváno
     * Converts XML of format to String in form of JSON.
     * Save all rules as jStorage.
     *
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
    };*/

    init();
})(jQuery);
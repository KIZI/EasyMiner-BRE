/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
(function($){
    
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
    */
    $.fn.xmlToJsonRules = function() {  
        $(this).find('AssociationRule').each(function(){
            var actMetaId = $(this).attr('id');
            if (window.ActiveXObject){ 
                var xmlString = this; 
            }
            else {
                var oSerializer = new XMLSerializer(); 
                var xmlString = oSerializer.serializeToString(this);
            } 
            $.jStorage.set("rule-"+actMetaId, xmlString);
            //$('#logDiv').append("rule-"+actMetaId+":"+actMeta+"<br />")
            $('#rules ul').append('<li><a href="#" title="Upravit pravidlo '+$(this).children('Text').text()+'" rel="'+actMetaId+'" class="linkRuleEdit">'+$(this).children('Text').text()+'</a></li>')
        });
        //$('#logDiv').append("<br />")
    };
    
    /** 
    * Converts XML datas to String in form of JSON.
    * Save all rules as jStorage.
    */
    $.fn.xmlToJsonDatas = function() {  
        $(this).find('MetaAttribute').each(function(){
            var Format;
            var attName = $(this).children('Name').text();
            var attId = $(this).attr('id');
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
                            binJson[forId][$(this).attr('id')] = $.parseJSON('{"name": "'+
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
//            var actMeta = '{"name": "'+attName+'", "formats": ['+Formats.join(', ')+']}';
            
            //$.cookie(actMetaId, actMeta, { expires: 1, path: '/' });
            
            attJson[attId] = attName;
            
//            att.push({label: attJson[attId], category: "Att"});
            
            $('#logDiv').append(attId+": "+Format+"<br /><br />");
        });
        $('#logDiv').append("<br />");
    };

})(jQuery);

var connections = $.parseJSON('{"Conjunction": "and", "Disjunction": "or", "Negation": "not"}');
var attJson = {};
var forJson = {};
var catJson = {};
var binJson = {};
var relJson = [];

$.when(
    $.ajax({
        url: "js/operators.json",
        dataType: "json",
        error: function (xhr, ajaxOptions, thrownError) {
            alert(xhr.status);
            alert(thrownError);
          },
        success: function(data) {
            $(data.operators).each(function() {
                relJson.push({label: this.label, category: "Log"});
        $('.draggableBoxRel').append($("<li>").html(this.label).attr('rel',this.label).addClass('button dragDropElmRel'))
            })
        }
    }),

    $.ajax({
        url: "js/data-demo.xml",
        dataType: "xml",
        success: function(xml){
            $(xml).xmlToJsonDatas();
        }
    }),

    $.ajax({
        url: "js/rules-demo.xml",
        dataType: "xml",
        success: function(xml){
            $(xml).xmlToJsonRules();
        }
    })
).then(function(){
    processData();
});

/** 
* Converts rule in JSON form to editable HTML in editor.
*/
ruleToHtml = function(id) {
    emptyConExe();
    var ruleJson = $.parseXML($.jStorage.get("rule-"+id));
    var $Antecedent = $(ruleJson).find('Antecedent');
    var $Consequent = $(ruleJson).find('Consequent');
    $($Antecedent[0]).rulePartToxHtml('Antecedent');
    $($Consequent[0]).rulePartToxHtml('Consequent');
    triggerAfterInsert();
};

/*
 * Adds click listener for list of rules.
 */
$( document ).on("click", ".linkRuleEdit", function(){
    ruleToHtml($(this).attr('rel'));
});
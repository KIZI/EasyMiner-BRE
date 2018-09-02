/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
(function($){
    
    /** 
    * Converts XML of Cedents to HTML.
    */
    $.fn.cedentToxHtml = function(){
        var elmAttrs = [];
        var bracketLeft = '<li class="button dragDropBracket">(</li>';
        var bracketRight = '<li class="button dragDropBracket">)</li>';
        var connective = $(this).attr('connective');
        var attrsCount = parseInt($(this).children().length);
        $(this).children().each(function(i, e){
            if($(this)[0].nodeName == 'Cedent'){
                var attributes = $(this).cedentToxHtml(),
                    cedentConnective = $(this).attr('connective');
                if(attrsCount>1 && attributes.length>1){
                    elmAttrs.push(bracketLeft+attributes.join('')+bracketRight);
                }
                else if(cedentConnective == 'Negation'){
                    elmAttrs.push('<li class="button dragDropElmLog" rel="'+
                            cedentConnective+'">'+config.connections[cedentConnective]+
                            '</li>'+bracketLeft+attributes.join('')+bracketRight);
                }
                else{
                    elmAttrs.push(attributes.join(''));
                }
            }else if($(this)[0].nodeName == 'RuleAttribute'){//TODO vykreslování rule attributes
                var attributeId = $(this).attr('attribute');
                var elmBins = [];
                var binsCount = parseInt($(this).children('ValuesBin,Value').length);
                if(typeof dataJson['attribute:'+attributeId] == 'undefined'){
                    showError($.i18n._('bre-error-dataInconsistance'), null);
                }
                elmBins.push('<li class="button dragDropElmAtt" rel="attribute:'+attributeId+'">'+dataJson['attribute:'+attributeId].name+'</li>');
                elmBins.push('<li class="button dragDropElmRel" rel="is">is</li>');
                $(this).children('ValuesBin,Value').each(function(){
                    var value=$(this).text();
                    elmBins.push('<li class="button dragDropElmBin" rel="bin:'+value+'">'+value+'</li>');
                    if(i<(binsCount-1)){
                        elmCats.push('<li class="button dragDropElmLog" rel="Disjunction">or</li>');
                    }
                });
                //TODO...
                /*TODO chybí vykreslení hodnot
                $(this).children('ValuesBin').each(function(i, e){
                    if(typeof binJson[format][$(this).attr('id')] == 'undefined'){
                        showError($.i18n._('bre-error-dataInconsistance'), null);
                    }
                    var bin = binJson[format][$(this).attr('id')];
                    elmCats.push('<li class="button dragDropElmBin" title="'+bin.title+'" rel="'+
                            $(this).attr('id')+'">'+bin.name+'</li>');
                    if(i<(catsCount-1)){
                        elmCats.push('<li class="button dragDropElmLog" rel="Disjunction">or</li>');
                    }
                });
                */


                if(elmBins.length>3){
                    if(attrsCount>1){
                        elmAttrs.push(bracketLeft+elmBins.join('')+bracketRight);
                    }else{
                        elmAttrs.push(elmBins.join(''));
                        elmAttrs.push('');
                    }
                }else{
                    elmAttrs.push(elmBins.join(''));
                }
            }
            if(i<(attrsCount-1)){
                if(typeof connective == 'undefined'){
                    connective = 'Conjunction';
                }
                elmAttrs.push('<li class="button dragDropElmLog" rel="'+connective+'">'+config.connections[connective]+'</li>');
            }
        });
        return(elmAttrs);
    };
    
    /** 
    * Converts XML of rule part to HTML.
    * @param {String} id of elm, where we write HTML to
    */
    $.fn.rulePartToxHtml = function(id){
        var $actNode = $(this[0]);
        $('#'+id+' .dragDropBox').append($actNode.cedentToxHtml().join(''));
    };
    
    /** 
    * Gets attribute with one or more categories inside brakets.
    * @param {number} i index of elm in array of jQuery objects
    */
    $.fn.getAttribute = function(i){
        //TODO
//        alert('called getAttribute');
        var forRel = $(this[i]).attr('rel'),
            att = forJson[forRel],
            attType = Object.getOwnPropertyNames(att.range),
            binRel = $(this[i+2]).attr('rel'),
            operatorIsThan = false,
            categoryFull = '',
            categoryFullId = 0;
        if(!$(this[i+1]).hasClass('dragDropElmRel')){
            showError($.i18n._('bre-validation-shouldOpe'), this[i+1]);
        } else{
            if($(this[i+1]).attr('rel').indexOf('than')>0){
                operatorIsThan = true;
                if(attType == "Interval"){
                    if(isValueInInterval(att.range.Interval, $(this[i+2]).text())){
                        var closure = [];
                        var margins = [];
                        closure = $(this[i+1]).getClosure(closure);
                        margins = $(this[i+1]).getMargins(margins,$(this[i+2]).text());
                        if($(this[i+3]).attr('rel') === 'Conjunction'){
                            if($(this[i+4]).attr('rel') === forRel &&
                            $(this[i+5]).attr('rel').indexOf('than')>0){
                                // found second part of Interval on 5th position
                                closure = $(this[i+5]).getClosure(closure);
                                margins = $(this[i+5]).getMargins(margins,$(this[i+6]).text());
                                categoryFullId += 4;
                                
                            } else if($(this[i+4]).attr('rel').indexOf('than')>0){
                                // found second part of Interval on 4th position
                                closure = $(this[i+4]).getClosure(closure);
                                margins = $(this[i+4]).getMargins(margins,$(this[i+5]).text());
                                categoryFullId += 3;
                            }
                        }else{
                            if(typeof closure[0] == 'undefined'){
                                closure[0] = 'open';
                            } else if(typeof closure[1] == 'undefined'){
                                closure[1] = 'Open';
                            }
                            if(typeof margins[0] == 'undefined'){
                                margins[0] = '-INF';
                            } else if(typeof margins[1] == 'undefined'){
                                margins[1] = '+INF';
                            }
                        }
                        var categoryName = $([closure.join(''),margins[0],margins[1]]).printInterval();
                        var isBin = existBin(forRel, categoryName);
                        if(typeof isBin == 'undefined'){
                            categoryFull = '<ValuesBin><Name>'+categoryName+
                                '</Name><Interval closure="'+
                                closure.join('')+'" leftMargin="'+margins[0]+
                                '" rightMargin="'+margins[1]+'"/></ValuesBin>';
                            changedFormats.push(forRel);
                        }
                        else{
                            binRel = isBin;
                        }
                    } else{
                        showError($.i18n._('bre-validation-notInRange'), this[i+2]);
                    }
                } else{
                    showError($.i18n._('bre-validation-attrWithoutInterval', $(this[i]).text(), $(this[i+1]).attr('rel')), null);
                }
            }
        }
        if($(this[i+2]).hasClass('dragDropElmBin')){
            var binFormat = binToFormat(binRel);
            if(binFormat !== forRel){
                showError($.i18n._('bre-validation-cannotValToAttr', $(this[i]).text()), this[i+2]);
            }
        } else if($(this[i+2]).hasClass('dragDropElmVal')){
            if(attType == "Interval" && !operatorIsThan){
                showError($.i18n._('bre-validation-useBinOrChange'), this[i+2]);
            } else if(attType == "Value"){
                if($.inArray($(this[i+2]).text(), att.range.Value) < 0){
                    showError($.i18n._('bre-validation-notInRange'), this[i+2]);
                } else{
                    var isBin = existBin(forRel, $(this[i+2]).text());
                    if(typeof isBin == 'undefined'){
                        categoryFull = '<ValuesBin><Name>'+$(this[i+2]).text()+
                                '</Name><Value>'+$(this[i+2]).text()+
                                '</Value></ValuesBin>';
                        changedFormats.push(forRel);
                    }
                    else{
                        binRel = isBin;
                    }
                }
            }
        } else{
            showError($.i18n._('bre-validation-shouldBin'), this[i+2]);
        }
        if(categoryFull != ''){
            var categories = categoryFull;
        } else{
            var categories = '<ValuesBin id="'+binRel+'" />';
        }
        if($(this[i+3]).attr('rel') === 'Disjunction'){
            if($(this[i+4]).attr('rel') === forRel){
                categories += $(this).getAttribute(i+4);
                lastId += 4;
            } else if($(this[i+4]).hasClass('dragDropElmBin')){
                var binFormat = binToFormat($(this[i+4]).attr('rel'));
                if(binFormat !== forRel){
                    showError($.i18n._('bre-validation-cannotValToAttr', $(this[i]).text()), this[i+4]);
                }
                else{
                    categories += '<ValuesBin id="'+$(this[i+4]).attr('rel')+'" />';
                    lastId = 4;
                }
            } else{
                lastId = 2;
            }
        } else if($(this[i+3]).attr('rel') === forRel){
            lastId = 2;
            showError($.i18n._('bre-validation-shouldOr'), this[i+3]);
        } else{
            lastId = 2+categoryFullId;
        }
        return categories;
    };
    
    /**
     * Gets closure part from operator.
     * @param {Array} closure array of closure parts
     */
    $.fn.getClosure = function(closure){
        var rel = $(this).attr('rel');
        if(rel.indexOf('greater than')>=0){
            closure[0] = (rel.indexOf('or equals')>0) ? 'closed' : 'open';
        } else{
            closure[1] = (rel.indexOf('or equals')>0) ? 'Closed' : 'Open';
        }
        return closure;
    };
    
    /**
     * Gets margins of interval.
     * @param {Array} margins - closure array of closure parts
     * @param {number} val of margin
     */
    $.fn.getMargins = function(margins, val){
        var rel = $(this).attr('rel');
        if(rel.indexOf('greater than')>=0){
            margins[0] = val;
        } else{
            margins[1] = val;
        }
        return margins;
    };

    /**
     * Gets interval to be printable.
     * @return {String} Interval in text form
     */
    $.fn.printInterval = function(){
        if($.isArray(this[0])){
            var intervals = [];
            $.each(this, function(k, d){
                intervals.push($(d).printInterval());
            });
            return intervals.join(' and ');
        } else{
            switch (this[0]){
                case 'closedClosed':
                    return('['+this[1]+' ; '+this[2]+']');
                case 'closedOpen':
                    return('['+this[1]+' ; '+this[2]+')');
                case 'openClosed':
                    return('('+this[1]+' ; '+this[2]+']');
                case 'openOpen':
                    return('('+this[1]+' ; '+this[2]+')');
                default:
                    break;
            }
        }
    };

    /** 
    * Validates cedent rule part to XML. Array of objects are inside brackets.
    * @param {number} fromI index of array which should loop counts from
    * @return {Array} attributes, connective between attributes
    */
    $.fn.validateCedent = function(fromI){
        var attrs = [],
            connective,
            negation = false;
        for(var i=fromI;i<this.length;i++){
            var thisRel = $(this[i]).attr('rel');
            if($(this[i]).text() === '('){
                var bracketsInside = 0;
                var cedent = [];
                for(var j=i+1;j<this.length;j++){
                    if($(this[j]).text() === '('){
                        bracketsInside++;
                    } else if($(this[j]).text() === ')'){
                        if(bracketsInside === 0){
//                            i=j;
                            break;
                        } else{
                            bracketsInside--;
                        }
                    }
                    cedent.push($(this[j]));
                }
                i += parseInt(cedent.length)+1;
                var subAttrs = $(cedent).validateCedent(0),
                    subAtt = subAttrs[0];
                if(subAttrs[0].match(/Attribute/g).length>2){
                    subAtt = '<Cedent connective="'+subAttrs[1]+'">'+
                        subAtt+'</Cedent>';
                }
                if(negation){
                    subAtt = '<Cedent connective="Negation">'+
                        subAtt+'</Cedent>';
                    negation = false;
                }
                attrs.push(subAtt);
            } else if(thisRel === 'Negation'){
                negation = true;
            } else if($(this[i]).hasClass('dragDropElmLog')){
                if(typeof connective != 'undefined' && connective != thisRel){
                    showError($.i18n._('bre-validation-lostBracketsDifferentRelations'), this[i]);
                } else{
                    connective = thisRel;
                }
            } else{
                if($(this[i]).hasClass('dragDropElmAtt')){
                    lastId = 0;
                    var attribute = '<RuleAttribute attribute="'+thisRel+'">'+
                            $(this).getAttribute(i)+'</RuleAttribute>';
                    i += lastId;
                } else if($(this[i-1]).hasClass('dragDropElmBin') || $(this[i-1]).hasClass('dragDropElmVal')){
                    showError($.i18n._('bre-validation-shouldLog'), this[i]);
                } else{
                    showError($.i18n._('bre-validation-shouldAtt'), this[i]);
                }
                attrs.push(attribute);
            }
        }
        return [attrs.join(''), connective];
    };

    /** 
    * Validates rule part to XML.
    */
    $.fn.validateRule = function(){
        if($(".dragDropBox .button:not(.noSortable)", this).length < 3){
            var part = ($(this).attr('id') == 'Antecedent') ? $.i18n._('bre-condition') : $.i18n._('bre-execute');
            showError($.i18n._('bre-validation-empty', part), null);
        }
        $('.red', this).removeClass('red');
        var $bracketLeft = $(".dragDropBox .dragDropBracket:contains('('):not(.noSortable)", this);
        var $bracketRight = $(".dragDropBox .dragDropBracket:contains(')'):not(.noSortable)", this);
        $($bracketRight).each(function(){
            if($(this).next().text() === '('){
                showError($.i18n._('bre-validation-shouldLog'), $(this).next());
            }
        });
        if($bracketLeft.length !== $bracketRight.length){
            if($bracketLeft.length > $bracketRight.length){
                showError($.i18n._('bre-validation-lostBracketRight'), null);
            }
            else{
                showError($.i18n._('bre-validation-lostBracketLeft'), null);
            }
        }
        else{
            $('.dragDropElmRel', this).each(function(){
                var $this = $(this),
                    $next = $this.next(),
                    relid = $this.attr('rel'),
                    relok = false;
                while($next.hasClass('dragDropElmRel')){
                    $this.append(' '+$next.text()).attr('rel', relid+' '+$next.attr('rel'));
                    $next.remove();
                    $next = $this.next();
                }
                $.each(rels, function(key, data){
                    if(data.label === $this.text()){
                        relok = true;
                        return false;
                    }
                });
                if(!relok){
                    showError($.i18n._('bre-validation-badOperator'),$this);
                }
            });
            $(".dragDropElmRel[rel='not']", this).each(function(){
                var $this = $(this),
                    $next = $this.next();
                if($next.text() === '('){
                    $this.removeClass('dragDropElmRel').addClass('dragDropElmLog').attr('rel', 'Negation');
                }
                else{
                    showError($.i18n._('bre-validation-badNegation'),$this);
                }
            });
            var validatedRule = $('.dragDropBox .button:not(.noSortable)', this).validateCedent(0);
            if(typeof validatedRule[1] !== "undefined"){
                return('<Cedent connective="'+validatedRule[1]+'">'+
                        validatedRule[0]+'</Cedent>');
            }
            else{
                return(validatedRule[0]);
            }
        }
    };

})(jQuery);

/** 
* Applies config.
*/
applyConfig = function(){
    var newRow = false;
    $(config.operators).each(function() {
        if(this.label === 'break'){
            newRow = true;
        }
        else{
            rels.push({label: this.label, category: "Log"});
            if(this.visible){
                var $operator = $("<li>").html(this.label).attr('rel',this.label).addClass('button dragDropElmRel');
                if(newRow){
                    $operator.css('clear', 'left');
                    newRow = false;
                }
                //$('.draggableBoxRel').css({visibility:'visible'});//XXX standa původně přidáno
                $('.draggableBoxRel').append($operator)
            }
        }
    });
    //$('.draggableBoxRel').show();//XXX Standa: tato řádka byla přidána
    if(config['init-brackets']){
        $('.dragDropBox').append('<li class="button noSortable dragDropBoxEnd">)</li>\n\
            <li class="button noSortable">(</li>');
    }
    if(config['init-helper']){
        $('.dragDropBox').append('<li class="draggablePlace initHelper">'+$.i18n._('bre-initHelper')+'</li>');
    }
};

/** 
* Find format which bin from param belong to.
* @param {String} id of bin
* @return {String} id of format
*/
binToFormat = function(id){
    var found = false; // used due to interrupting the cycle => performance
    var result;
    $.each(binJson, function(keyFor, bins){
        $.each(bins, function(keyBin, data){
            if(keyBin === id){
                result = keyFor;
                found = true;
                return false;
            }
        });
        if(found){
            return false;
        }
    });
    return result;
};

/** 
* Defines rule name from filled boxes.
* @return {String} rule name
*/
defRuleName = function(){
    var antecedentLi = $('#Antecedent li:not(.noSortable)').map(function(i,n) {
        return $(n).text();
    }).get().join(' ');
    var consequentLi = $('#Consequent li:not(.noSortable)').map(function(i,n) {
        return $(n).text();
    }).get().join(' ');
    return antecedentLi+' &gt;:&lt; '+consequentLi;
};

/** 
* Removes all elements from Antecedent and Consequent parts to show new rule instead.
* Set actual rule variable to undefined.
*/
emptyConExe = function(){
    $('.initHelper').remove();
    $('#Antecedent .button:not(.noSortable), #Consequent .button:not(.noSortable)').remove();
    actRule = undefined;
};

/** 
* Checks if already exist bin for format.
* @param {String} format id of format
* @param {String} title of bin
* @return {Boolean} if exists
*/
existBin = function(format, title){
    var result;
    $.each(binJson[format], function(keyBin, data){
        if(data.title == title){
            result = keyBin;
            return false;
        }
    });
    return result;
};

/**
 * Shows dialog to type value, which has to be inside
 * possible range of last metaattribute before relation.
 * @param {jQuery object} $item, which could be relation "... than"
 */
insertOperatorThan = function($item){
    if($item.hasClass('dragDropElmRel') && $item.attr('rel').indexOf('than')>0){
        var $prev = $item.prev();
        while(typeof $prev.attr('rel') != "undefined" && !$prev.hasClass('dragDropElmAtt')){
            $prev = $prev.prev();
        }
        if($prev.hasClass('dragDropElmAtt')){
            var att = forJson[$prev.attr('rel')];
            if(Object.getOwnPropertyNames(att.range) == "Interval"){
                Apprise($.i18n._('bre-apprise-operatorThan-question', $prev.text(), $item.attr('rel'), $(att.range.Interval).printInterval()), {
                    animation: 10,
                    buttons: {
                        confirm: {
                            text: $.i18n._('bre-apprise-operatorThan-confirm'),
                            className: '',
                            action: function(e){
//                                    alert(JSON.stringify(att.range.Interval)+' a bylo zadáno '+e.input)
                                if(isValueInInterval(att.range.Interval, e.input)){
                                    $item.after('<li class="button dragDropElmVal" rel="'+
                        e.input+'">'+e.input+'</li>');
                                    $item.next().click();
                                }
                                else{
                                    $item.remove();
                                    showSmallError($.i18n._('bre-validation-notInRange'), null);
                                }
                                Apprise('close');
                            }
                        }
                    },
                    input: true,
                    opacity: '0.80'
                });
            }
            else{
                $item.remove();
                showSmallError($.i18n._('bre-validation-attrWithoutInterval', $prev.text(), $item.attr('rel')), null);
            }
        }
        else{
            $item.remove();
            showSmallError($.i18n._('bre-validation-noAttrForThan', $item.attr('rel')), null);
        }
    }
};

/**
 * Checks if value is in interval. Recursive.
 * @param {Array} interval to be checked
 * @param {Number} val which should be inside interval
 * @returns {String} Boolean or interval as a string
 */
isValueInInterval = function(interval, val){
    if($.isArray(interval[0])){
        var result = false;
        $.each(interval, function(k, d){
            if(isValueInInterval(d, val)){
                result = true;
                return false;
            }
        });
        return result;
    } else{
        var int1 = parseInt(interval[1]),
            int2 = parseInt(interval[2]);
        switch (interval[0]){
            case 'closedClosed':
                return (int1 <= val && val <= int2);
            case 'closedOpen':
                return (int1 <= val && val < int2);
            case 'openClosed':
                return (int1 = val && val <= int2);
            case 'openOpen':
                return (int1 = val && val < int2);
            default:
                return false;
        }
    }
};

/** 
* Processes attributes to insert into the box of attributes.
*/
var printAttributes = function(attributesJson){
    $.each(attributesJson, function(id, attribute){
        $('#attributes .draggableBox').append($("<li>").html(attribute.name).attr('rel','attribute:'+attribute.id).addClass('button dragDropElmAtt'));
    });
};
    
/** 
* Insert button elements into the box of values.
* @param {String} rel id of attribute
*/
processValues = function(rel){
    // function process() could be called in different cases
    var process = function(rel){
        var attribute=dataJson[rel];
        $('#values .draggableBox li').remove();
        $('#values .draggableBinsHeading').text(attribute.name);
        $.each(attribute.bins, function(key,bin){
            var $li = $("<li>").html(bin).attr('rel','bin:'+bin).addClass('button dragDropElmBin');
            $('#values .draggableBins').append($li);
        });

        /* TODO co dělá tohle?
        var $prev = $('#values .draggableVals').prev();
        $prev.show();
        if(type == 'Value'){
            $('#values .draggableVals li:not(.ui-sortable-helper)').remove();
            $(form.range.Value).each(function(){
                $('#values .draggableVals').append($("<li>").html(this).attr('rel','').addClass('button dragDropElmVal'))
            });
        }
        else{
            $prev.hide();
        }*/
        $('#values .draggableSearchReset').click();
    };

    if(typeof dataJson[rel] == 'undefined'){
        if (rel.substr(0,10)=='attribute:'){
            var attributeId=rel.substr(10);
            $.ajax({
                url: config.getAttributeUrl(attributeId),
                dataType: "json",
                success: function(json){
                    processAttributeDetailsJson(json);
                    process(rel);
                }
            });
        }
    }else{
        process(rel);
    }
};

/**
 * Process attribute details JSON loaded from server
 * @param data
 */
var processAttributeDetailsJson = function(data){
    dataJson['attribute:'+data.id]=data;
    //TODO seřazení hodnot?
};

/**
 * Shows error message using showSmallError function and throws SyntaxError,
 * which interrupts other JS executes.
 * @param text {String} Text of error
 * @param elm {jQuery object} which element error belongs to 
 * @throws {SyntaxError} Error with original text to interrupt other JS operations
 */
showError = function(text, elm){
    showSmallError(text, elm);
    $.xhrPool.abortAll();
    throw { name: 'SyntaxError', message: text };
};

/**
 * Shows error message and notices on bad elm, if is got.
 * @param text {String} Text of error
 * @param elm {jQuery object} which element error belongs to 
 */
showSmallError = function(text, elm){
    if(elm !== null && typeof elm != 'undefined'){
        var $elm = $(elm);
        $elm.addClass('red');
        $elm.tooltip({
            items: '.red',
            content: text,
      position: {
        my: "center bottom-5",
        at: "center top",
        collision: "fit",
        using: function( position, feedback ) {
          $( this ).css( position );
          $( "<div>" )
            .addClass( "arrow" )
            .appendTo( this );
        }
      }
        });
        $elm.tooltip('open');
        setTimeout(function() {
            $elm.removeClass('red').tooltip('destroy');
        }, 7000);
    }
    else{
        showAlert(text, 'error');
    }
    window.scrollTo(0, 0);
};

/**
 * Shows alert message.
 * @param {String} text of message
 * @param {String} type of message
 */
showAlert = function(text, type){
    var otherType = (type == 'success') ? 'error' : 'success';
    $('#alertBox').removeClass(otherType).addClass(type).css('opacity', '1').find('strong').text(text);
    setTimeout(function() {
        $('#alertBox').animate({opacity:0});
    }, 7000);
    window.scrollTo(0, 0);
};

/** 
* Function, which is triggered after elements insert.
*/
triggerAfterInsert = function(){
};


/*
 * Checks all (also added during the time) elements if they have draggable
 * and if not, they become draggable.
 */
$(document).on("mouseover", ".draggableBox li", function(){
    if (!$(this).data("init")) {
//        alert('init');
        $(this).data("init", true).draggable({
            addClasses: false,
            connectToSortable: ".dragDropBox",
            containment: "#content",
//            cursorAt: {left: 0, top: 0},
            helper: "clone",
            opacity: 0.7,
            drag: function(e, ui){
                //XXX Standa: původně tento řádek: ui.position.top = parseInt(ui.offset.top);
            }
        });
    }
});

/*
 * Filter list of elements in metaattribute or bins box.
 */
$('.draggableSearch').keyup(function(){
    var value = $(this).val();
    var $list = $(this).siblings('.scrollable');
    
    if(value === ''){
        $('li', $list).show();
    }
    else{
        $('li:not(:contains('+value+'))', $list).hide(); 
        $('li:contains('+value+')', $list).show();
    }
});

/*
 * Resets search input in metaattribute or bins box.
 */
$('.draggableSearchReset').click(function(){
    $(this).siblings('.draggableSearch').val('').keyup();
});

/*
 * Shows logical values in values box.
 */
$(document).on('click', '.dragDropBox .button:not(.noSortable)', function (e) {
    $('.dragDropBox').find('.ui-selected').removeClass('ui-selected');
    $(this).addClass('ui-selected');
    if($(this).hasClass('dragDropElmAtt')){
        var attributeId = $(this).attr('rel');
        processValues(attributeId);
        
    }else if($(this).hasClass('dragDropElmBin')){
        var valId = $(this).attr('rel');
        if($('#values .draggableBox').find("li[rel='"+valId+"']").length == 0){
            //TODO
            var attributeId = binToFormat(valId);
            processValues(attributeId);
        }
    }
    $('input:focus').blur();
});

/*
 * Controls key pressing. If is some button selected and user pressed key
 * backspace or delete, removes this button and selects previous or next one.
 */
$(document).keydown(function(e){
    if($('.ui-selected').length > 0 && !$(document.activeElement).is('input')){
        if(e.which == 46){
            e.preventDefault();
            var $next = $('.ui-selected').next();
            $('.ui-selected').remove();
            $($next).addClass('ui-selected');
            edited = true;
        }
        else if(e.which == 8){
            e.preventDefault();
            var $prev = $('.ui-selected').prev();
            $('.ui-selected').remove();
            $($prev).not('.noSortable').addClass('ui-selected');
            edited = true;
        }
        else if(e.which == 27){
            $(document).trigger("mouseup");
        }
    }
});

/*
 * Context menu for buttons in condition and execute.
 * Source: https://plugins.jquery.com/ui-contextmenu/
 */
/*TODO kontextové menu
$(document).contextmenu({
    delegate: ".dragDropBox .button:not(.noSortable)",
    preventContextMenuForPopup: true,
    preventSelect: true,
    position: function(event, ui){
        return {my: "left top", at: "left bottom", of: ui.target};
    },
    menu: [{title: $.i18n._('bre-link-erase'), cmd: "erase"}],
    beforeOpen: function(event, ui){
        var $menu = ui.menu,
            $target = ui.target,
            newVals = {},
            finMenu = [],
            actId = $target.attr('rel'),
            extraData = ui.extraData; // passed when menu was opened by call to open()
        if($target.hasClass('dragDropElmBin')){
            var att = binToFormat(actId);
            newVals = $.map(binJson[att], function(data, key){
                return {
                    title: data.name,
                    cmd: key
                };
            });
            finMenu.push({title: $.i18n._('bre-link-switchTo'), children: newVals});
        }
        else if($target.hasClass('dragDropElmAtt')){
            newVals = $.map($('#attributes .draggableBox li'), function(data, key){
                if($(data).attr('rel') != actId){
                    return {
                        title: $(data).text(),
                        cmd: $(data).attr('rel')
                    };
                }
            });
            finMenu.push({title: $.i18n._('bre-link-switchTo'), children: newVals});
        }
        finMenu.push({title: $.i18n._('bre-link-erase'), cmd: "erase"});
        $(document).contextmenu("replaceMenu", finMenu);
        $(this).data("startingScrollTop",$target);
		},
		select: function(event, ui){
        $target = $(this).data("startingScrollTop");
        edited = true;
        if(ui.cmd == 'erase'){
            $target.remove();
        }
        else{
            $target.attr('rel', ui.cmd).text(ui.text);
            $target.click();
        }
		}
}).on('dblclick', '.dragDropBox .button:not(.noSortable)', function(e){
    $(document).contextmenu("open", $(this))
}).on('dblclick', '.draggableBox .button', function(e){
    var $newElm = $(this).clone();
    if($('.ui-selected').length > 0){
        var $selected = $('.ui-selected');
        $selected.after($newElm);
        var $nextElm = $selected.next();
        $nextElm.click();
        insertOperatorThan($nextElm);
    }
    else{
        $('.initHelper').remove();
        $('.draggableBox.visible').siblings('.ui-widget-content')
                .find('.dragDropBox').append($newElm).children().last().click();
    }
});*/

$(".dragDropBox").sortable({
    cancel: ".noSortable",
//    helper: "clone",
    forcePlaceholderSize: true,
    placeholder: {
        element: function(currentItem) {
            return $("<li>").html('...').addClass('draggablePlace').width(currentItem.width());
        },
        update: function(container, p) {
            return;
        }
    },
//    revert: true,
    scroll: false,
    tolerance: "pointer",
    beforeStop: function(e, ui){
        if(removeIntent){ ui.item.remove(); }
    },
    out: function(e, ui){
        $(ui.item).siblings('.draggablePlace').hide();
        removeIntent = true;
        ui.item.addClass('toRemove');
    },
    over: function(e, ui){
        $(ui.item).siblings('.draggablePlace').show();
        removeIntent = false;
        ui.item.removeClass('toRemove');
    },
    start: function(e, ui){
        ui.item.addClass('moving');
        ui.item.click();
        $(ui.item).siblings('.initHelper').remove();
        newRel = $('li.ui-draggable-dragging').hasClass('dragDropElmRel');
        $('li.ui-draggable-dragging').addClass('visible');
    },
    stop: function(e, ui){
        ui.item.removeClass('toRemove').removeClass('moving');
        edited = true;
        var $item = $(ui.item);
        insertOperatorThan($item);
    }
});

$(".dragDropLeft form").each(function(){
    $(this).mouseover(function(){
        $('.draggableBoxRel.visible').removeClass('visible');
        $(this).find('.draggableBoxRel').addClass('visible');
    });
    $(this).mouseout(function(){
        $(this).find('.draggableBoxRel').removeClass('visible');
    })
});

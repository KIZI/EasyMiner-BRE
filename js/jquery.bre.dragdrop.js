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
                            cedentConnective+'">'+connections[cedentConnective]+
                            '</li>'+bracketLeft+attributes.join('')+bracketRight);
                }
                else{
                    elmAttrs.push(attributes.join(''));
                }
            }
            else if($(this)[0].nodeName == 'Attribute'){
                var format = $(this).attr('format');
                var elmCats = [];
                var catsCount = parseInt($(this).children('Category').length);
                elmCats.push('<li class="button dragDropElmAtt" rel="'+
                        format+'">'+attJson[forJson[format].metid]+'</li>');
                elmCats.push('<li class="button dragDropElmRel" rel="is">is</li>');
                $(this).children('Category').each(function(i, e){
                    var bin = binJson[format][$(this).attr('id')];
                    var binType = Object.getOwnPropertyNames(forJson[format].range);
                    var binTitle = '';
                    if(binType == 'Value'){
                        binTitle = ' title="'+bin.vals+'"';
                    } else if(binType == 'Interval'){
                        binTitle = ' title="'+$(bin.vals).printInterval()+'"';
                    }
                    elmCats.push('<li class="button dragDropElmBin"'+binTitle+' rel="'+
                            $(this).attr('id')+'">'+bin.name+'</li>');
                    if(i<(catsCount-1)){
                        elmCats.push('<li class="button dragDropElmLog" rel="Disjunction">or</li>');
                    }
                });
                if(elmCats.length>3){
                    if(attrsCount>1){
                        elmAttrs.push(bracketLeft+elmCats.join('')+bracketRight);
                    }
                    else{
                        elmAttrs.push(elmCats.join(''));
                        elmAttrs.push('');
                    }
                }
                else{
                    elmAttrs.push(elmCats.join(''));
                }
            }
            if(i<(attrsCount-1)){
                if(typeof connective == 'undefined'){
                    connective = 'Conjunction';
                }
                elmAttrs.push('<li class="button dragDropElmLog" rel="'+connective+'">'+connections[connective]+'</li>');
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
    * @param {Int} i index of elm in array of jQuery objects
    */
    $.fn.getAttribute = function(i){
        var att = forJson[$(this[i]).attr('rel')],
            attType = Object.getOwnPropertyNames(att.range),
            operatorIsThan = false;
        if(!$(this[i+1]).hasClass('dragDropElmRel')){
            showError('očekáván operátor', this[i+1]);
        } else{
            if($(this[i+1]).attr('rel').indexOf('than')>0){
                operatorIsThan = true;
                if(attType == "Interval"){
                    if(isValueInInterval(att.range.Interval, $(this[i+2]).text())){
//                        TO-DO ajax request to save value => new bin
                    } else{
                        showError($.i18n._('bre-validation-notInRange'), this[i+2]);
                    }
                } else{
                    showError($.i18n._('bre-validation-attrWithoutInterval', $(this[i]).text(), $(this[i+1]).attr('rel')), null);
                }
            }
        }
        if($(this[i+2]).hasClass('dragDropElmBin')){
            var binFormat = binToFormat($(this[i+2]).attr('rel'));
            if(binFormat !== $(this[i]).attr('rel')){
                showError($.i18n._('bre-validation-cannotValToAttr', $(this[i]).text()), this[i+2]);
            }
        } else if($(this[i+2]).hasClass('dragDropElmVal')){
            if(attType == "Interval" && !operatorIsThan){
                showError($.i18n._('bre-validation-useBinOrChange'), this[i+2]);
            } else if(attType == "Value"){
                if($.inArray($(this[i+2]).text(), att.range.Value) < 0){
                    showError($.i18n._('bre-validation-notInRange'), this[i+2]);
                } else{
//                    TO-DO ajax request to save value => new bin
                }
            }
        } else{
            showError($.i18n._('bre-validation-shouldBin'), this[i+2]);
        }
        var categories = '<Category id="'+$(this[i+2]).attr('rel')+'" />';
        if($(this[i+3]).attr('rel') === 'Disjunction'){
            if($(this[i+4]).attr('rel') === $(this[i]).attr('rel')){
                categories += $(this).getAttribute(i+4);
                lastId += 4;
            } else if($(this[i+4]).hasClass('dragDropElmBin')){
                var binFormat = binToFormat($(this[i+4]).attr('rel'));
                if(binFormat !== $(this[i]).attr('rel')){
                    showError($.i18n._('bre-validation-cannotValToAttr', $(this[i]).text()), this[i+4]);
                }
                else{
                    categories += '<Category id="'+$(this[i+4]).attr('rel')+'" />';
                    lastId = 4;
                }
            }
        } else if($(this[i+3]).attr('rel') === $(this[i]).attr('rel')){
            lastId = 2;
            showError($.i18n._('bre-validation-shouldOr'), this[i+3]);
        } else{
            lastId = 2;
        }
        return categories;
    };

    /**
     * Gets interval to be printable.
     * @returns {String} Interval in text form
     */
    $.fn.printInterval = function(){
        var intervals = [];
        $(this).each(function(){
            if(this[0] === 'closedClosed'){
                intervals.push('['+this[1]+' ; '+this[2]+']');
            } else if(this[0] === 'closedOpen'){
                intervals.push('['+this[1]+' ; '+this[2]+')');
            } else if(this[0] === 'openClosed'){
                intervals.push('('+this[1]+' ; '+this[2]+']');
            } else if(this[0] === 'openOpen'){
                intervals.push('('+this[1]+' ; '+this[2]+')');
            }
        });
        return intervals.join(' and ');
    };

    /** 
    * Validates cedent rule part to XML. Array of objects are inside brackets.
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
                    var attribute = '<Attribute format="'+thisRel+'">'+
                            $(this).getAttribute(i)+'</Attribute>';
                    i += lastId;
                } else if($(this[i-1]).hasClass('dragDropElmBin') || $(this[i-1]).hasClass('dragDropElmVal')){
                    showError($.i18n._('bre-validation-shouldLog'), this[i]);
                } else{
                    showError($.i18n._('bre-title'), this[i]);
                }
                attrs.push(attribute);
            }
        };
        return [attrs.join(''), connective];
    };

    /** 
    * Validates rule part to XML.
    */
    $.fn.validateRule = function(){
        $('.red', this).removeClass('red');
        var $bracketLeft = $(".dragDropBox .dragDropBracket:contains('(')", this).not('.noSortable');
        var $bracketRight = $(".dragDropBox .dragDropBracket:contains(')')", this).not('.noSortable');
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
* Removes all elements from Antecedent and Consequent parts to show new rule instead.
*/
emptyConExe = function(){
    $('#Antecedent .button, #Consequent .button').not('.noSortable').remove();
};

/**
 * Checks if value is in interval.
 * @param {json} interval
 * @param {integer} val
 * @returns {boolean}
 */
isValueInInterval = function(interval, val){
    if(interval[0][0] === 'closedClosed'){
        return (interval[0][1] <= val && val <= interval[0][2]);
    } else if(interval[0][0] === 'closedOpen'){
        return (interval[0][1] <= val && val < interval[0][2]);
    } else if(interval[0][0] === 'openClosed'){
        return (interval[0][1] < val && val <= interval[0][2]);
    } else if(interval[0][0] === 'openOpen'){
        return (interval[0][1] < val && val < interval[0][2]);
    } else{ return false; }
};

/** 
* Initializates application.
* Processes attributes to insert into the box of attributes.
* Applies config.
*/
initApp = function(){
    $.each(forJson, function(key, data){
        $('#attributes .draggableBox').append($("<li>").html(attJson[data.metid]).attr('rel',key).addClass('button dragDropElmAtt'))
    });
    if(config['init-brackets']){
        $('.dragDropBox').append('<li class="button noSortable dragDropBoxEnd">)</li>\n\
            <li class="button noSortable">(</li>');
    }
};
    
/** 
* Insert button elements into the box of values.
* @param {String} format id of format
*/
processValues = function(format){
    var form = forJson[format],
        bins = binJson[format],
        type = Object.getOwnPropertyNames(form.range);
    $('#values .draggableBox li').remove();
    $.each(bins, function(key, data){
        var $li = $("<li>").html(data.name).attr('rel',key).addClass('button dragDropElmBin');
        if(type == 'Value'){
            $li.attr('title',data.vals);
        } else if(type == 'Interval'){
            $li.attr('title',$(data.vals).printInterval());
        }
        $('#values .draggableBins').append($li);
    });

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
    }
    $('#values .draggableSearchReset').click();
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
    throw { name: 'SyntaxError', message: text };
};

/**
 * Shows error message and notices on bad elm, if is got.
 * @param text {String} Text of error
 * @param elm {jQuery object} which element error belongs to 
 */
showSmallError = function(text, elm){
    if(elm !== null){
        $(elm).addClass('red');
    }
    $('#errorBox').text(text);
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
//    alert("ahoj");
    if (!$(this).data("init")) {
        $(this).data("init", true).draggable({
            addClasses: false,
            connectToSortable: ".dragDropBox",
            containment: "#content",
//            cursorAt: {left: 0, top: 0},
            helper: "clone",
            opacity: 0.7,
            drag: function(e, ui){
                ui.position.top = parseInt(ui.offset.top);
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
        var format = $(this).attr('rel');
        processValues(format);
        
    }
    else if($(this).hasClass('dragDropElmBin')){
        var valId = $(this).attr('rel');
        if($('#values .draggableBox').find("li[rel='"+valId+"']").length == 0){
            var format = binToFormat(valId);
            processValues(format);
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
        }
        else if(e.which == 8){
            e.preventDefault();
            var $prev = $('.ui-selected').prev();
            $('.ui-selected').remove();
            $($prev).not('.noSortable').addClass('ui-selected');
        }
        else if(e.which == 27){
            $(document).trigger("mouseup");
        }
    }
}) 

/*
 * Context menu for buttons in condition and execute.
 * Source: https://plugins.jquery.com/ui-contextmenu/
 */
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
            newVals = $.map(forJson, function(data, key){
                if(key != actId){
                    return {
                        title: attJson[data.metid],
                        cmd: key
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
        if(ui.cmd == 'erase'){
            $target.remove();
        }
        else{
            $target.attr('rel', ui.cmd).text(ui.text);
        }
		}
}).on('dblclick', '.dragDropBox .button:not(.noSortable)', function (e) {
    $(document).contextmenu("open", $(this))
});

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
        removeIntent = true;
        ui.item.addClass('toRemove');
    },
    over: function(e, ui){
        removeIntent = false;
        ui.item.removeClass('toRemove');
    },
    receive: function(e, ui){
    },
    start: function(e, ui){
        ui.item.addClass('moving');
        ui.item.click();
        newRel = $('li.ui-draggable-dragging').hasClass('dragDropElmRel');
        $('li.ui-draggable-dragging').addClass('visible');
    },
    stop: function(e, ui){
        ui.item.removeClass('toRemove').removeClass('moving');
        var $item = ui.item;
        if($item.attr('rel').indexOf('than')>0){
            var $prev = ui.item.prev();
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
                                    if(isValueInInterval(att.range.Interval, e.input)){
                                        $item.after('<li class="button dragDropElmVal" rel="'+
                            e.input+'">'+e.input+'</li>')
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
                    $(ui.item).remove();
                    showSmallError($.i18n._('bre-validation-attrWithoutInterval', $prev.text(), $item.attr('rel')), null);
                }
            }
            else{
                $(ui.item).remove();
                showSmallError($.i18n._('bre-validation-noAttrForThan', $item.attr('rel')), null);
            }
        }
    }
});

$(".dragDropLeft form").mouseover(function(){
    $('.draggableBoxRel.visible').removeClass('visible');
    $(this).find('.draggableBoxRel').addClass('visible');
});

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
                $(this).children('Category').each(function(i, e){
                    var binType = Object.getOwnPropertyNames(forJson[format].range);
                    var binTitle = '';
                    elmCats.push('<li class="button dragDropElmAtt" rel="'+
                            format+'">'+attJson[forJson[format].metid]+'</li>');
                    elmCats.push('<li class="button dragDropElmRel" rel="is">is</li>');
                    if(binType == 'Value'){
                        binTitle = ' title="'+binJson[format][$(this).attr('id')].vals+'"';
                    }
                    elmCats.push('<li class="button dragDropElmBin"'+binTitle+' rel="'+
                            $(this).attr('id')+'">'+binJson[format][$(this).attr('id')].name+'</li>');
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
        if(!$(this[i+1]).hasClass('dragDropElmRel')){
            showError('očekáván operátor', this[i+1]);
        }
        if(!$(this[i+2]).hasClass('dragDropElmVal')){
            showError('očekávána hodnota', this[i+2]);
        }
        var categories = '<Category id="'+$(this[i+2]).attr('rel')+'" />';
        if($(this[i+3]).attr('rel') === 'Disjunction' &&
                $(this[i+4]).attr('rel') === $(this[i]).attr('rel')){
            categories += $(this).getAttribute(i+4);
            lastId += 3;
        }
        else if($(this[i+3]).attr('rel') === $(this[i]).attr('rel')){
            lastId = 3;
            showError('očekávána logická spojka or', this[i+3]);
        }
        else{
            lastId = 3;
        }
        return categories;
    };

    /** 
    * Validates cedent rule part to XML. Array of objects are inside brackets.
    */
    $.fn.validateCedent = function(fromI){
        var attrs = [];
        var connective;
        for(var i=0;i<this.length;i++){
            if($(this[i]).text() === '('){
                var bracketsInside = 0;
                var cedent = [];
                for(j=i+1;j<this.length;j++){
                    if($(this[j]).text() === '('){
                        bracketsInside++;
                    }
                    else if($(this[j]).text() === ')'){
                        if(bracketsInside === 0){
                            i=j;
                            break;
                        }
                        else{
                            bracketsInside--;
                        }
                    }
                    cedent.push($(this[j]));
                }
                var subAttrs = $(cedent).validateCedent(i);
                if(subAttrs[0].match(/Attribute/g).length>2){
                attrs.push('<Cedent connective="'+subAttrs[1]+'">'+
                        subAttrs[0]+'</Cedent>');
                }
                else{
                    attrs.push(subAttrs[0]);
                }
            }
            else if($(this[i]).hasClass('dragDropElmLog')){
                connective = $(this[i]).attr('rel');
            }
            else{
                if($(this[i]).hasClass('dragDropElmAtt')){
                    lastId = 0;
                    var attribute = '<Attribute format="'+$(this[i]).attr('rel')+'">'+
                            $(this).getAttribute(i)+
                            '</Attribute>';
                    i += lastId;
                }
                else{
                    showError('očekáván atribut', this[i]);
                    break;
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
                showError('očekávána logická spojka', $(this).next());
            }
        });
        if($bracketLeft.length !== $bracketRight.length){
            if($bracketLeft.length > $bracketRight.length){
                showError('Nejsou uzavřeny všechny závorky.', null);
            }
            else{
                showError('Uzavřeli jste více závorek, než bylo nutné.', null);
            }
        }
        else{
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
* Processes attributes to insert into the box of attributes.
*/
processData = function(){
    $.each(forJson, function(key, data){
        $('#attributes .draggableBox').append($("<li>").html(attJson[data.metid]).attr('rel',key).addClass('button dragDropElmAtt'))
    });
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
        if(type == 'Value'){ $li.attr('title',data.vals); }
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
    $('#values .dragDropSearchReset').click();
};

/**
 * 
 * @param text {String} Text of error
 * @param elm {jQuery object} which element error belongs to 
 * @throws {SyntaxError} Error with original text to interrupt other JS operations
 */
showError = function(text, elm){
    if(elm !== null){
        $(elm).addClass('red');
    }
    $('#errorBox').text(text);
    throw { name: 'SyntaxError', message: text };
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
* Removes all elements from Antecedent and Consequent parts to show new rule instead.
*/
emptyConExe = function(){
    $('#Antecedent .button, #Consequent .button').not('.noSortable').remove();
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
            drag: function(event,ui){
                ui.position.top = parseInt(ui.offset.top);
            }
        });
    }
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
    $('.dragDropSearch').blur();
});

/*
 * Controls key pressing. If is some button selected and user pressed key
 * backspace or delete, removes this button and selects previous or next one.
 */
$(document).keydown(function(e){
    if($('.ui-selected').length > 0 && !$(document.activeElement).hasClass('dragDropSearch')){
        if(e.keyCode == 46){
            e.preventDefault();
            var $next = $('.ui-selected').next();
            $('.ui-selected').remove();
            $($next).addClass('ui-selected');
        }
        else if(e.keyCode == 8){
            e.preventDefault();
            var $prev = $('.ui-selected').prev();
            $('.ui-selected').remove();
            $($prev).not('.noSortable').addClass('ui-selected');
        }
    }
}) 

/*
 * Context menu for buttons in condition and execute.
 * Source: https://plugins.jquery.com/ui-contextmenu/
 */
$(document).contextmenu({
    delegate: ".dragDropBox .button",
    preventContextMenuForPopup: true,
    preventSelect: true,
    position: function(event, ui){
        return {my: "left top", at: "left bottom", of: ui.target};
    },
    menu: [{title: "smazat", cmd: "erase"}],
    beforeOpen: function(event, ui){
        var $menu = ui.menu,
            $target = ui.target,
            newVals = {},
            finMenu = [],
            actId = $target.attr('rel'),
            extraData = ui.extraData; // passed when menu was opened by call to open()
        if($target.hasClass('dragDropElmVal')){
            var vals = binToFormat(actId);
            newVals = $.map(vals, function(data, key){
                return {
                    title: data.name,
                    cmd: key
                };
            });
            finMenu.push({title: "zaměnit za", children: newVals});
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
            finMenu.push({title: "zaměnit za", children: newVals});
        }
        finMenu.push({title: "smazat", cmd: "erase"});
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
    start: function(e, ui){
        ui.item.addClass('moving');
        ui.item.click();
        $('li.ui-draggable-dragging').addClass('visible');
    },
    stop: function(e, ui){
        ui.item.removeClass('toRemove').removeClass('moving');
    }
});

$(".dragDropLeft form").mouseover(function(){
    $('.draggableBoxRel.visible').removeClass('visible');
//    $('.draggableBoxRel.visible li.ui-draggable-dragging)').addClass('visible');
    $(this).find('.draggableBoxRel').addClass('visible');
});

/*
 * Filter list of elements in metaattribute or bins box.
 */
$('.dragDropSearch').keyup(function(){
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
$('.dragDropSearchReset').click(function(){
    $(this).siblings('.dragDropSearch').val('').keyup();
});

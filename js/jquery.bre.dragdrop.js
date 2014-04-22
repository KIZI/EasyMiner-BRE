/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
(function($){
    
    /** 
    * Converts XML of Cedents to HTML.
    */
    $.fn.cedentToxHtml = function() {  
        var Cedents = [];
        var bracketLeft = '<li class="button">(</li>';
        var bracketRight = '<li class="button">)</li>';
        var connective = $(this).attr('connective');
        var attrsCount = parseInt($(this).children().length);
        $(this).children().each(function(i, e){
            var elmAttrs = [];
            if($(this)[0].nodeName == 'Cedent'){
                elmAttrs.push($(this).cedentToxHtml());
            }
            else if($(this)[0].nodeName == 'Attribute'){
                var format = $(this).attr('format');
                var elmCats = [];
                var catsCount = parseInt($(this).children('Category').length);
                $(this).children('Category').each(function(i, e){
                    elmCats.push('<li class="button dragDropElmAtt" rel="'+
                            format+'">'+attJson[forJson[format].metid]+'</li>');
                    elmCats.push('<li class="button dragDropElmRel" rel="is">is</li>');
                    elmCats.push('<li class="button dragDropElmVal" rel="'+
                            $(this).attr('id')+'">'+binJson[format][$(this).attr('id')].name+'</li>');
                    if(i<(catsCount-1)){
                        elmCats.push('<li class="button dragDropElmLog" rel="Disjunction">or</li>');
                    }
                });
                elmAttrs.push(elmCats.join(''));
            }
            if(connective == 'Negation'){
                elmAttrs.unshift(bracketLeft);
                elmAttrs.unshift('<li class="button dragDropElmLog" rel="'+connective+'">'+connections[connective]+'</li>');
                elmAttrs.push(bracketRight);
            }
            if(attrsCount > '1'){
                elmAttrs.unshift(bracketLeft);
                elmAttrs.push(bracketRight);
            }
            if(i<(attrsCount-1)){
                if(typeof connective == 'undefined'){
                    connective = 'Conjunction';
                }
                elmAttrs.push('<li class="button dragDropElmLog" rel="'+connective+'">'+connections[connective]+'</li>');
            }
            Cedents.push(elmAttrs.join(''));
        });
        return(Cedents.join(''));
    };
    
    /** 
    * Insert button elements into the box of values.
    */
    $.fn.processValues = function(){
        $('#values .draggableBox li:not(.ui-sortable-helper)').remove();
        $.each(this[0], function(key, data){
            $('#values .draggableBox').append($("<li>").html(data.name).attr('rel',key).addClass('button dragDropElmVal'))
        });
    };
    
    /** 
    * Converts XML of rule part to HTML.
    * @param {String} id of elm, where we write HTML to
    */
    $.fn.rulePartToxHtml = function(id){
        var $actNode = $(this[0]);
        $('#'+id+' .dragDropBox').append($actNode.cedentToxHtml());
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
* Find format which bin from param belong to.
* @param {String} id of bin
*/
binToFormat = function(id){
    var finded = false; // used due to interrupting the cycle => performance
    var result;
    $.each(binJson, function(key, bins){
        $.each(bins, function(key, data){
            if(key == id){
                result = bins;
                finded = true;
                return false;
            }
        });
        if(finded){
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
            cursorAt: {left: 0, top: 0},
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
        $(binJson[$(this).attr('rel')]).processValues();
    }
    else if($(this).hasClass('dragDropElmVal')){
        var valId = $(this).attr('rel');
        if($('#values .draggableBox').find("li[rel='"+valId+"']").length == 0){
            var vals = binToFormat(valId);
            $(vals).processValues();
        }
    }
});

/*
 * Controls key pressing. If is some button selected and user pressed key
 * backspace or delete, removes this button and selects previous or next one.
 */
$(document).keydown(function(e){
    if($('.ui-selected').length > 0){
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
        }
			$(document).contextmenu("replaceMenu", [{title: "zaměnit za", children: newVals}, {title: "smazat", cmd: "erase"}]);
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
    revert: true,
    scroll: false,
    start: function(event, ui){
        $(ui.item).click();
    },
    tolerance: "pointer"
});

$(".dragDropLeft form").mouseover(function(){
    $('.draggableBoxLog.visible, .draggableBoxRel.visible').removeClass('visible');
    $(this).find('.draggableBoxLog, .draggableBoxRel').addClass('visible');
});

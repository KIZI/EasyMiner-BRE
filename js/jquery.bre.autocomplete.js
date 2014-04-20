/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
(function($){
    /*
     * jQuery function to check all inputs width.
     * Used typically when content of inputs is changed by programm not by user
     */
    $.fn.checkAll = function(){
        this.each(function(){
            check(this);
        });
    };
    
    /*
     * A categorized search result using autocomplete jQuery plugin.
     * Source: http://jqueryui.com/autocomplete/#categories
     */
    $.widget("custom.catcomplete",$.ui.autocomplete,{
        _renderMenu: function(ul,items){
          var that = this,
              currentCategory = "",
              hasCat = false;
          if(actInput == "autocompleteBoxElmAtt" || actInput == "autocompleteBoxElmLog" || actInput == "autocompleteBoxElmVal"){
            hasCat = true;
          }
          $.each(items, function(index,item){
            if(item.category != currentCategory) {
                itemLi = $("<li>").append(item.category).addClass('ui-autocomplete-category');
                if(hasCat && !showAll){
                    $(itemLi).addClass('hidden')
                }
                ul.append(itemLi);
                currentCategory = item.category;
            }
            that._renderItemData(ul,item);
          });
          if(hasCat && !showAll){
            ul.append("<li class='ui-autocomplete-category catcompleteShowAll'>Všechny možnosti</li>");
          }
        },
        _renderItem: function(ul,item){
          var hasCat = false;
          if(actInput == "autocompleteBoxElmAtt" || actInput == "autocompleteBoxElmLog" || actInput == "autocompleteBoxElmVal"){
            hasCat = true;
          }
            itemLi = $("<li>").append( "<a>" + item.label + "</a>" );
            if(("autocompleteBoxElm"+item.category)!=actInput && hasCat && !showAll){
                $(itemLi).addClass('hidden')
            }
            return $(itemLi).appendTo( ul );
        }
    });
    
    /*
     * jQuery autoGrowInput plugin by James Padolsey
     * See related thread: http://stackoverflow.com/questions/931207/is-there-a-jquery-autogrow-plugin-for-text-fields
     * Modified by PVD 3/2014 - function check() is usable outside of function
     */
    
    $.fn.autoGrowInput = function(o) {

        o = $.extend({
            maxWidth: 240,
            minWidth: 10,
            comfortZone: 10
        }, o);
        
        check = function(inputid){

            var input = $(inputid);
            var minWidth = o.minWidth || input.width(),
                val = input.val(),
                testSubject = input.next();
            
            // Enter new content into testSubject
            var escaped = val.replace(/&/g, '&amp;').replace(/\s/g,'&nbsp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            testSubject.html(escaped);

            // Calculate new width + whether to change
            var testerWidth = testSubject.width(),
                newWidth = (testerWidth + o.comfortZone) >= minWidth ? testerWidth + o.comfortZone : minWidth,
                currentWidth = input.width(),
                isValidWidthChange = (newWidth < currentWidth && newWidth >= minWidth)
                                     || (newWidth > minWidth && newWidth < o.maxWidth);

            // Animate width
            if (isValidWidthChange) {
                input.width(newWidth);
            }

        };

        inputs = this.filter('input:text').each(function(){
            var input = $(this),
                testSubject = $('<tester/>').css({
                    position: 'absolute',
                    top: -9999,
                    left: -9999,
                    width: 'auto',
                    fontSize: input.css('fontSize'),
                    fontFamily: input.css('fontFamily'),
                    fontWeight: input.css('fontWeight'),
                    letterSpacing: input.css('letterSpacing'),
                    whiteSpace: 'nowrap'
                });

            testSubject.insertAfter(input);

            $(this).bind('keyup keydown blur update', function(){
                check(input);
            });
        });
        //$(window).load(function(){inputs.checkAll()});
        
        return this;

    };
    
    /*
     * Converts all Cedents from rule part to HTML.
     * @param {String} id of element, where should HTML rules put to.
     */
    $.fn.rulePartToHtml = function(id){
        var elm = []; // array of elements with content
        var elements = []; // empty input between every elm in array elm (for append)
        var cedentsCount = parseInt(this.length);
        //$(this).each(function(){
        for(n=0;n<cedentsCount;n++){
            elmCedents = [];
            var attrsCount = parseInt(this[n].attrs.length);
            for(i=0;i<attrsCount;i++){
                elmAttrs = [];
                var catsCount = parseInt(this[n].attrs[i].cats.length);
                for(j=0;j<catsCount;j++){
                    elmCats = [];
                    elmCats.push(autocompleteInput('autocompleteBoxElmAtt',this[n].attrs[i].format));
                    elmCats.push(autocompleteInput('autocompleteBoxElmLog','is'));
                    elmCats.push(autocompleteInput('autocompleteBoxElmVal',this[n].attrs[i].cats[j]));
                    if(catsCount > '1'){
                        elmCats.unshift(autocompleteInput('','('));
                        elmCats.push(autocompleteInput('',')'));
                    }
                    if(j<(catsCount-1)){
                        elmCats.push(autocompleteInput('autocompleteBoxElmLog','or'));
                    }
                    $.merge(elmAttrs,elmCats);
                };
                if(attrsCount > '1'){
                    elmAttrs.unshift(autocompleteInput('','('));
                    elmAttrs.push(autocompleteInput('',')'));
                }
                if(i<(attrsCount-1)){
                    elmAttrs.push(autocompleteInput('autocompleteBoxElmLog',this[n].connective));
                }
                $.merge(elmCedents,elmAttrs);
            };
            if(cedentsCount > '1'){
                elmCedents.unshift(autocompleteInput('','('));
                elmCedents.push(autocompleteInput('',')'));
            }
            if(i<(cedentsCount-1)){
                elmCedents.push(autocompleteInput('autocompleteBoxElmLog',this[n].connective));
            }
            $.merge(elm,elmCedents);
        };
        $(elm).each(function(){
            elements.push(autocompleteInput('',''));
            elements.push(this);
        });
        elements.push(autocompleteInput('',''));
        $('#'+id+' .autocompleteBox').append(elements);
        $('#'+id+' input').autoGrowInput().checkAll();
    };

})(jQuery);

var att = [];
var actInput = "";
var showAll = false;

/** 
* 
*/
processData = function() {
    return true;
};

/** 
* Creates new DOM input with class and value.
* @param {String} htmlClass of <li>
* @param {String} value value of <li>
*/
autocompleteInput = function(htmlClass, value) {
    var htmlInput = $('<input/>').attr('type','text').attr('class',htmlClass).val(value)
        .autoGrowInput()
        .on("focus", function(event) {
            var actClass = $(this).attr('class').split(" ");
            actInput = actClass[0];
            showAll = false;
            var lastVal = $(this).val();
            //alert(JSON.stringify(logJson));
            $(this).catcomplete({
              minLength: 0,
              source: function(req, res){
                  /*if(actInput == "autocompleteBoxElmLog"){
                      return res(logJson);
                  }
                  else if(actInput == "autocompleteBoxElmAtt"){
                      return res(att);
                  }
                  else if(actInput == "autocompleteBoxElmVal"){
                      return res();
                  }
                  else{*/
                      return res($.ui.autocomplete.filter(logJson.concat(att), req.term));
                  //}
              },
              select: function(e,ui){
                  if(lastVal == ''){
                      $(this).parent('li').after(autocompleteInput('',''));
                  }
                  $(this).val(ui.item.value);
                  $(this).attr('class', 'autocompleteBoxElm'+ui.item.category);
                  $(this).parent('li').next('li').find('input').focus();
                  check($(this));
              }
            })
        })
        .click(function(){
          inputClass = $(this).attr("class");
          if($(this).hasClass("autocompleteBoxElmAtt") || $(this).hasClass("autocompleteBoxElmLog") || $(this).hasClass("autocompleteBoxElmVal")){
            $(this).catcomplete("search",'');
          }
          else{
            $(this).catcomplete("search",$(this).val());
          }
        }).focusout(function(){
          if($(this).val() == ''){
            $(this).attr('class','')
          }
        }).keydown(function (e) {
          var key = {space: 32, back: 8 };
          switch (e.which) {
            case key.space:
              /*if($(this).val() != ''){
                  $(this).parent('li').next('li').find('input').focus();
              }*/
            break;
            case key.back:
              if($(this).val() == ''){
                  var prevInput = $(this).parent('li').prev('li').find('input');
                  if(prevInput.length > 0){
                      var prevLen = prevInput.val().length;
                      prevInput.focus().catcomplete("search",'');
                      prevInput[0].setSelectionRange(prevLen, prevLen);
                      e.preventDefault();
                  }
              }
            break;
          }
            return true;
        });
    return $('<li/>').attr('class','autocompleteBoxElm').append(htmlInput);
};

/*$('.autocompleteBoxElm').click(function(){
    var act = $('.autocompleteBoxElmAct');
    if(act.not(this)){
        $(this).addClass('autocompleteBoxElmAct');
    }
    act.removeClass('autocompleteBoxElmAct');
});*/
var data = [
  { label: "dobrý", category: "Val" },
  { label: "nevypadá to dobře", category: "Val" },
  { label: "špatný", category: "Val" },
  { label: "A", category: "Val" },
  { label: "B", category: "Val" },
  { label: "C", category: "Val" },
  { label: "D", category: "Val" },
  { label: "E", category: "Val" },
  { label: "x", category: "Val" },
  { label: "povolit", category: "Val" },
  { label: "zamítnout", category: "Val" },
  { label: "KO", category: "Val" },
  { label: "<", category: "Log" },
  { label: ">", category: "Log" },
  { label: "∧", category: "Log" },
  { label: "∨", category: "Log" },
  { label: "¬", category: "Log" },
  { label: "=", category: "Log" },
  { label: "≠", category: "Log" },
  { label: "rating", category: "Att" },
  { label: "duration", category: "Att" },
  { label: "salary", category: "Att" }
];

/*
 * "Showall" links in autocomplete menu react on click event and show hidden options.
 */
$( document ).on( "click", ".catcompleteShowAll", function() {
  $(this).hide().siblings('.hidden').each(function(){
      $(this).removeClass('hidden');
  });
  showAll = true;
});
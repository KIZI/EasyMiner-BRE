  <div id="wrapper" class="bre">
      <section id="workplace">
      <section id="content">
          <div id="infoBox" class="ui-widget">
              <div class="ui-state-highlight ui-corner-all">
                  <p>
                      <span class="ui-icon ui-icon-info" style="float: left; margin-right: .3em;"></span>
                      <strong data-i18n="bre-info-loading">Loading</strong> <span data-i18n="bre-info-defaultText">content</span>
                  </p>
              </div>
          </div>
          <div id="alertBox" class="ui-widget">
              <div class="ui-corner-all">
                  <p>
                      <span class="ui-icon" style="float: left; margin-right: .3em;"></span>
                      <strong></strong>
                  </p>
              </div>
          </div>
          <div class="ui-widget dragDropLeft">
              <h3 class="ui-widget-header ui-state-focus ui-corner-top" data-i18n="bre-condition">Condition</h3>
              <form>
                  <div class="ui-widget-content ui-corner-bottom">
                      <fieldset id="Antecedent">
                          <legend data-i18n="bre-condition">Condition</legend>
                          <ul class="dragDropBox">
                          </ul>
                      </fieldset>
                  </div>
                  <ul class="draggableBox draggableBoxRel">
                  </ul>
              </form>
          </div>
          <div class="newRow"></div>
          <div class="ui-widget dragDropLeft">
              <h3 class="ui-widget-header ui-state-focus ui-corner-top" data-i18n="bre-execute">Execute</h3>
              <form>
                  <div class="ui-widget-content ui-corner-bottom">
                      <fieldset id="Consequent">
                          <legend data-i18n="bre-execute">Execute</legend>
                          <ul class="dragDropBox">
                          </ul>
                      </fieldset>
                  </div>
                  <ul class="draggableBox draggableBoxRel">
                  </ul>
              </form>
          </div>
          <div class="newRow"></div>
          <div class="fl">
              <label for="confidence" data-i18n="bre-confidence">Confidence:</label>
              <input id="confidence" name="confidence" value="0.01">
              <label for="support" data-i18n="bre-support">Confidence:</label>
              <input id="support" name="support" value="0.01">
          </div>
          <div class="fr">
              <button id="newRule"><span data-i18n="bre-button-newRule">New rule</span></button>
              <button id="saveRule"><span data-i18n="bre-button-saveRule">Save rule</span></button>
          </div>
          <div class="newRow"></div>
          <div id="rules" class="ui-widget">
              <h3 class="ui-widget-header ui-state-default ui-corner-top" data-i18n="bre-head-rulesEdit">Rules to edit</h3>
              <div class="ui-widget-content ui-corner-bottom">
                  <ul id="rules-list"></ul>
              </div>
              <div class="fr">
                <button id="evaluateModel" class="hidden"><span data-i18n="bre-button-evaluateModel">Evaluate model</span></button>
              </div>
          </div>

      </section>
      </section>
      <nav id="navigation">
          <section class="attributesPalette" id="values">
              <h2 class="minimize" data-i18n="bre-binsAndValues">Attribute values <a class="filter" href="#" title="Filter"></a></h2>
              <!--<div class="datas-filter">
                  <input type="text" id="attributes-filter" title="Input part of requested attribute name - special characters * and ? are supported.">
                  <a href="#" class="reset-filter" title="Reset filter"></a>
              </div>-->
              <div class="clearfix">
                  <div class="scrollable">
                      <h3 data-i18n="bre-head-bins" class="draggableBinsHeading">Bins</h3>
                      <ul class="draggableBox draggableBins">
                          <li class="draggableBoxInfo" data-i18n="bre-binsAndValues-defaultText"></li>
                      </ul>
                      <!--<h3 data-i18n="bre-head-values">Values</h3>
                      <ul class="draggableBox draggableVals">
                      </ul>-->
                  </div>
                <!--
              <form>
                  <div class="ui-widget-content ui-corner-bottom">
                      <fieldset id="values">
                          <legend data-i18n="bre-binsAndValues">Bins & values</legend>
                          <input type="text" placeholder="search..." class="draggableSearch" data-i18n="(placeholder)bre-placeholder-search" />
                          <a href="#" title="Reset" class="ui-state-error ui-corner-all draggableSearchReset" data-i18n="(title)bre-link-searchReset"><span class="ui-icon ui-icon-cancel"/></a>
                      </fieldset>
                  </div>
              </form>-->
              </div>
          </section>
          <section class="attributesPalette" id="attributes">
              <h2 class="minimize" data-i18n="bre-metaattributes">Attributes <a class="filter" href="#" title="Filter"></a></h2>
              <div class="datas-filter">
                  <input type="text" id="attributes-filter" title="Input part of requested attribute name - special characters * and ? are supported.">
                  <a href="#" class="reset-filter" title="Reset filter"></a>
              </div>
              <div class="clearfix">
                  <div class="scrollable">
                      <ul class="draggableBox">
                      </ul>
                  </div>
                <!--
              <form>
                  <div class="ui-widget-content ui-corner-bottom ui-widget-content-active">
                      <fieldset id="attributes2">
                          <legend data-i18n="bre-metaattributes">Metaattributes</legend>
                          <input type="text" placeholder="search..." class="draggableSearch" data-i18n="(placeholder)bre-placeholder-search" />
                          <a href="#" title="Reset" class="ui-state-error ui-corner-all draggableSearchReset" data-i18n="(title)bre-link-searchReset"><span class="ui-icon ui-icon-cancel"></span></a>
                      </fieldset>
                  </div>
              </form>-->
              </div>
          </section>
      </nav>
      <div id="logDiv" class="newRow"></div>
  </div>
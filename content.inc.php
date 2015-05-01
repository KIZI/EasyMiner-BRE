  <div id="content">
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
      <div class="dragDropLeft fl">
          <div class="ui-widget">
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
                      <li class="button dragDropBracket">(</li>
                      <li class="button dragDropBracket">)</li>
                      <li class="button dragDropElmLog" rel="Conjunction">and</li>
                      <li class="button dragDropElmLog" rel="Disjunction">or</li>
                  </ul>
              </form>
          </div>
          <div class="newRow"></div>
          <div class="ui-widget">
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
                      <li class="button dragDropBracket">(</li>
                      <li class="button dragDropBracket">)</li>
                      <li class="button dragDropElmLog" rel="Conjunction">and</li>
                      <li class="button dragDropElmLog" rel="Disjunction">or</li>
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
      </div>
      <div class="fr">
          <div class="ui-widget">
              <h4 class="ui-widget-header ui-state-default ui-corner-top" data-i18n="bre-binsAndValues">Bins & values</h4>
              <form>
                  <div class="ui-widget-content ui-corner-bottom">
                      <fieldset id="values">
                          <legend data-i18n="bre-binsAndValues">Bins & values</legend>
                          <input type="text" placeholder="search..." class="draggableSearch" data-i18n="(placeholder)bre-placeholder-search" />
                          <a href="#" title="Reset" class="ui-state-error ui-corner-all draggableSearchReset" data-i18n="(title)bre-link-searchReset"><span class="ui-icon ui-icon-cancel"/></a>
                          <div class="scrollable">
                              <h4 data-i18n="bre-head-bins">Bins</h4>
                              <ul class="draggableBox draggableBins">
                                  <li class="draggableBoxInfo" data-i18n="bre-binsAndValues-defaultText"></li>
                              </ul>
                              <h4 data-i18n="bre-head-values">Values</h4>
                              <ul class="draggableBox draggableVals">
                              </ul>
                          </div>
                      </fieldset>
                  </div>
              </form>
          </div>
          <div class="ui-widget">
              <h4 class="ui-widget-header ui-state-active ui-corner-top" data-i18n="bre-metaattributes">Metaattributes</h4>
              <form>
                  <div class="ui-widget-content ui-corner-bottom ui-widget-content-active">
                      <fieldset id="attributes">
                          <legend data-i18n="bre-metaattributes">Metaattributes</legend>
                          <input type="text" placeholder="search..." class="draggableSearch" data-i18n="(placeholder)bre-placeholder-search" />
                          <a href="#" title="Reset" class="ui-state-error ui-corner-all draggableSearchReset" data-i18n="(title)bre-link-searchReset"><span class="ui-icon ui-icon-cancel"/></a>
                          <div class="scrollable">
                              <ul class="draggableBox">
                              </ul>
                          </div>
                      </fieldset>
                  </div>
              </form>
          </div>
      </div>
      <div id="logDiv" class="newRow"></div>
      <div id="rules" class="ui-widget">
          <h3 class="ui-widget-header ui-state-default ui-corner-top" data-i18n="bre-head-rulesEdit">Rules to edit</h3>
          <div class="ui-widget-content ui-corner-bottom">
              <ul></ul>
          </div>
      </div>
      <button id="cssTouch"><span data-i18n="bre-button-touchCssEnable">Switch to styles for touch screens</span></button>
  </div>
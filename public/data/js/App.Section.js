(function(win, doc, $) {

  "use strict";

  class Section {
    constructor() {
      this.index  = 0;
      this.$elm   = $("[data-section-index]");
      this.length = $("[data-section]").length;

      $("[data-section]").each(function(i, elm) {
        $(elm).attr("data-section", i);
      });
    }

    show(index) {
      this.$elm.attr("data-section-index", index);
    }

    prev() {
      if (this.index - 1 >= 0) {
        this.show(--this.index);
      }
    }

    next() {
      if (this.index + 1 < this.length) {
        this.show(++this.index);
      }
    }
  }

  win.App.Section = Section;

})(window, document, jQuery);
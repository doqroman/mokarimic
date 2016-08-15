(function(win, doc, ns) {

  "use strict";

  var section  = new ns.Section(),
      $body    = $(doc.body),
      $txt     = $("#txt");

  section.next();

  $("#btnStart").on("click", function() {
    section.next();
    main();
  });

  function main() {
    var socket = io.connect();

    socket.on("display", function(list) {
      var $box = $("#box"),
          $elm;

      $box.fadeOut(function() {
        // $box.html("");

        for (var i = 0, length = list.length; i < length; ++i) (function(i) {
          try {
            $txt.text($txt.text().replace(new RegExp(list[i].txt), "<span class=' " + selectColor(i) + " '>" + list[i].txt + "</span>"));
          } catch(e) {
            console.log(e);
          }

          if (list[i].ttl) {
            $elm = $([
              "<div class='amazon'>",
                "<div class='inner'>",
                  "<p class='txt " + selectColor(i) + "'>" + list[i].txt + "</p>",
                  "<div class='img-box'>",
                    "<p class='img' style='background-image: url(" + list[i].src + ");'></p>",
                  "</div>",
                  "<p class='ttl'>" + list[i].ttl + "</p>",
                  "<p class='price'>" + list[i].price + "</p>",
                  "<a class='btnCart'></a>",
                "</div>",
              "</div>"
              ].join(""));

            $box.append($elm);
            // $("doc, body").animate({
            //   scrollTop : 0
            // });
          }
        })(i);

        $txt.html($txt.text());
        $box.fadeIn();
      });
    });

    socket.on("omu", function(msg) {
      $txt.text(msg);
    });

    $(document).on("touchend", ".btnCart", function() {
      socket.emit("cart");
      // alert("ありがとうございます！");
    });
  }

  function selectColor(index) {
    var list = ["white"];

    return list[index % list.length];
  }

})(window, document, App);
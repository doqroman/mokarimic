(function(win, doc, ns, $) {

  "use strict";

  var recognition = new webkitSpeechRecognition(),
      section     = new ns.Section(),
      socket      = io.connect(),
      $body       = $(doc.body),
      $txt        = $("#txt");

  // recognition.continuous = true;
  recognition.lang = "ja";

  section.next();

  recognition.addEventListener("result", function(evt) {
    var msg = evt.results[0][0].transcript;

    socket.emit("speak", msg);
    $txt.text(msg);
  });

  recognition.addEventListener("end", function() {
    console.log("END");
    recognition.start();
  });

  socket.on("display", function(list) {
    var $box = $("#box"),
        $elm;

    console.log(list);

    $box.fadeOut(function() {
      $box.html("");

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
              "</div>",
            "</div>"
            ].join(""));

          $box.append($elm);
        }
      })(i);

      $txt.html($txt.text());
      $box.fadeIn();
    });
  });

  socket.on("omu", function(msg) {
    $txt.text(msg);
  });

  $("#btnStart").on("click", function() {
    recognition.start();
    section.next();
  });

  // $(doc.body).on("click", function() {
  //   var msg = "さすがに買えないかー。じゃあ「ルンバ」のような桃が。";

  //   socket.emit("speak", msg);
  //   $txt.text(msg);
  // });

  function selectColor(index) {
    var list = ["white"];

    return list[index % list.length];
  }

})(window, document, App, jQuery);
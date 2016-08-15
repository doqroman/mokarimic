var EventEmitter = require("events").EventEmitter,
    SerialPort   = require("serialport").SerialPort,
    express      = require("express"),
    app          = require("express")(),
    http         = require("http").Server(app),
    io           = require("socket.io")(http),
    kuromoji     = require("kuromoji"),
    builder      = kuromoji.builder({
      dicPath: "node_modules/kuromoji/dist/dict"
    }),
    client       = require("cheerio-httpcli");
    evt          = new EventEmitter(),
    // portName     = "/dev/cu.usbmodem1421",
    portName     = "/dev/cu.wchusbserial1410";
    serialPort   = new SerialPort(portName, {
      baudrate: 9600
    });

app.use("/", express.static(__dirname + "/public"));

builder.build((err, tokenizer) => {
  if (err) {
    throw err;
  }

  evt.on("tokenize", (msg) => {
    if (msg !== "その男の子に初めての iot プロジェクトの教科書と名付けました") {
      buildName(tokenizer.tokenize(msg));
    } else {
      setTimeout(() => {
        evt.emit("display", [{
          index : 1,
          src   : "https://images-fe.ssl-images-amazon.com/images/G/09/x-site/icons/no-img-sm._CB192184409_AA160_.gif",
          txt   : "初めての iot プロジェクトの教科書",
          ttl   : "はじめてのIoTプロジェクトの教科書",
          price : "￥ 1,706",
          link  : "https://images-fe.ssl-images-amazon.com/images/G/09/x-site/icons/no-img-sm._CB192184409_AA160_.gif"
        }]);
      }, 1000);
    }
  })
});

io.on("connection", (socket) => {
  console.log("CONNECT!");

  socket.on("speak", (msg) => {
    evt.emit("tokenize", msg);
  });

  socket.on("serif", (msg) => {
    evt.emit("tokenize", msg);
  });

  socket.on("cart", () => {
    serialPort.write("1", function(err, results) {
      console.log("err: " + err);
      console.log("results: " + results);
    });
  });

  evt.on("tokenize", function(msg) {
    socket.emit("omu", msg);
  })

  evt.on("display", (msg) => {
    socket.emit("display", msg);
  })
});

http.listen(3000, "0.0.0.0");
// http.listen(3000, "112.78.117.19");

function buildName(arr) {
  var list = [],
      str  = "";

  for (var i = 0, length = arr.length; i < length; ++i) {
    if (arr[i].pos === "名詞" && arr[i].basic_form !== "、" && arr[i].basic_form !== "*") {
      str += arr[i].basic_form;
    } else {
      if (str) {
        list.push(str);
      }
      str = "";
    }

    if (i === length - 1) {
      if (str) {
        list.push(str);
      }
      buildAmazonLink(list.filter(function (x, i, self) {
        // 重複を削除
        return self.indexOf(x) === i;
      }));
    }
  }
}

function buildAmazonLink(arr) {
  var list  = [];

  // evt.emit("display", [{
  //   index : 0,
  //   src   : "https://images-fe.ssl-images-amazon.com/images/I/415DIQ8iiKL._AC_US160_.jpg",
  //   txt   : "ルンバ",
  //   ttl   : "ルンバ",
  //   price : "¥1000円",
  //   link  : "https://images-fe.ssl-images-amazon.com/images/I/415DIQ8iiKL._AC_US160_.jpg"
  // },{
  //   index : 1,
  //   src   : "https://images-fe.ssl-images-amazon.com/images/I/415DIQ8iiKL._AC_US160_.jpg",
  //   txt   : "ルンバ",
  //   ttl   : "ルンバ",
  //   price : "¥1000円",
  //   link  : "https://images-fe.ssl-images-amazon.com/images/I/415DIQ8iiKL._AC_US160_.jpg"
  // },{
  //   index : 2,
  //   src   : "https://images-fe.ssl-images-amazon.com/images/I/415DIQ8iiKL._AC_US160_.jpg",
  //   txt   : "ルンバ",
  //   ttl   : "ルンバ",
  //   price : "¥1000円",
  //   link  : "https://images-fe.ssl-images-amazon.com/images/I/415DIQ8iiKL._AC_US160_.jpg"
  // }]);

  // return;

  for (var i = 0, length = arr.length; i < length; ++i) ((i) => {
    // client.fetch("https://www.amazon.co.jp/s/", {
    client.fetch("http://search.rakuten.co.jp/search/mall/" + encodeURIComponent(arr[i]) + "/", {
      // keywords: arr[i]
    }, (err, $, res) => {
      var $container = $(".rsrSResultSect");

      // list.push({
      //   index : i,
      //   src   : $container.eq(0).find("img").attr("src"),
      //   txt   : arr[i],
      //   ttl   : $container.find("h2").eq(0).attr("data-attribute"),
      //   price : $container.find(".s-price").eq(0).text(),
      //   link  : $container.find(".a-link-normal").eq(0).attr("href")
      // });

      list.push({
        index : i,
        src   : $container.eq(0).find("img").attr("src"),
        txt   : arr[i],
        ttl   : $container.find(".rsrSResultItemTxt a").eq(0).text(),
        price : $container.find(".price a").eq(0).text(),
        link  : null
      });

      if (list.length === length) {
        evt.emit("display", list.sort(function(a, b) {
          return (a.index > b.index) ? 1 : -1;
        }));
        // evt.emit("display", list.sort(function(a, b) {
        //   return (a.index > b.index) ? -1 : 1;
        // }).slice(0, 3));
      }
    });
  })(i);
}
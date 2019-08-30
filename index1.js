String.prototype.format = function () {
    var args = arguments;
    var reg = /\{(\d+)\}/g;
    return this.replace(reg, function (g0, g1){
        return args[+g1];
    });
};

(function ($) {
    $.fn.will = function (callBack, type) {
        type = type || "fx";
        return $.each(this, function (index, ele) {
            $(ele).queue(type, function (next) {
                callBack.call(this);
                next();
            })
        })
    }
})(jQuery);

(function ($) {
    function Slider(option) {
        this.option = $.extend(true, {}, option);
        this.ele = $("#" + this.opt.id);
        this.init();
        this.begin();
    }

    Slider.prototype = {
        cubeSize: { x: 0, y: 0},
        nowIndex: 0,
        canChose: true,
        nextIndex: function () {
            var newIndex = this.nowIndex + 1;
            if (newIndex >= this.opt.imgs.length) {
                newIndex = 0;
            }
            return newIndex;
        },
        init: function () {
            this.preLoad();
            this.fill();
            this.resize();
            var self = this;
            $(window).resize(function () {
                self.resize();
            });
        },
        preLoad: function () {
            var arr = this.opt.imgs;
            $.each(arr, function (index, url) {
                var img = document.createElement("img");
                img.src = url;
            });
        },
        begin: function () {
            var self = this;
            this.timer = setInterval(function () {
                var newIndex = self.nowIndex + 1;
                if(newIndex >= self.opt.imgs.length) {
                    newIndex = 0;
                }
                self.choseImg(newIndex);
            }, self.opt.interval);
        },
        stop: function () {
            clearInterval(this.timer);
        },
        fill: function () {
            var result = '<div class="slider-box">';
            for (var x = 0; x < this.opt.x; x++) {
                for (var y = 0; y < this.opt.y; y++) {
                    result += '<div id="{0}" class="{1}"><div class="slider_inner_a"></div><div class="slider_inner_b"></div></div>'
                        .format(this.opt.id + "_" + x + "_" + y, "slider_cube");
                }
            }

            if (this.opt.showBar) {
                result +='<div class="slider_bar">';
                result += new Array(this.opt.imgs.length + 1).join("<span></span>");
                result += '</div>';
            }

            result += '</div>';

            this.ele.html(result);
            this.ele.find(".slider_bar span").eq(this.nowIndex).addClass("active");
            this.eleBox = this.ele.children(".slider-box");


            this.bindEvents();
        },
        bindEvents: function () {
            var self = this;

            if(this.opt.showBar) {
                this.eleBox.children(".slider_bar").off().on("click", "span", function () {
                    var eleSpan = $(this);
                    self.choseImg(eleSpan.index());
                });
            }

            if (this.opt.urls.length <= 0) return;
            self.eleBox.find(".slider_cube").off().click(function () {
                window.location.href = self.opt.urls[self.nowIndex] || "javascript:void(0);";
            }).css("cursor", "pointer");

            self.eleBox.off().mouseenter(function () {
                self.stop();
            }).mouseleave(function () {
                self.begin();
            });
        },
        resize: function () {
            this.eleBox.height(this.eleBox.width() / this.opt.scale);

            var eleWid = this.eleBox.width(),
                eleHei = this.eleBox.height();

            var xSize, ySize;

            if (this.opt.border) {
                xSize = (eleWid - this.opt.x + 1) / this.opt.x;
                ySize = (eleHei - this.opt.y + 1) / this.opt.y;
            } else {
                xSize = eleWid / this.opt.x;
                ySize = eleHei / this.opt.y;
            }
            this.cubeSize = { x: xSize, y: ySize};

            if (this.opt.x == 1) xSize = eleWid;
            if (this.opt.y == 1) ySize = eleHei;

            var borLen = this.opt.border ? 1 : 0;
            for (var x = 0; x < this.opt.x; x++) {
                for (var y = 0; y < this.opt.y; y++) {
                    $("#" + this.opt.id + "_" + x + "_" + y).css(
                        {
                            "left": x * xSize + x * borLen + "px",
                            "top": y * ySize + y * borLen + "px",
                            "width": xSize + "px",
                            "height": ySize + "px"
                        }
                    ).find(".slider_inner_a,.slider_inner_b").css(
                        {
                            "background-image": "url({0})".format(this.opt.imgs[this.nowIndex]),
                            "background-position": "{0}px {1}px".format(-x * xSize, -y * ySize),
                            "background-size": "{0}px {1}px".format(eleWid, eleHei)
                        }
                    );
                }
            }
        },
        choseImg: function (index) {
            var self = this;

            if (index == self.nowIndex) return;

            if (!self.canChose) return;
            self.canChose = false;
            setTimeout(function () {
                self.canChose = true;
            }, self.opt.delay + 200);
            this.nowIndex = index;
            var url = this.opt.imgs[index];
            this.effectIndex = this.effectIndex || 0;
            if (this.effectIndex >= this.effects.length) {
                this.effectIndex = 0;
            }
            this.effects[this.effectIndex](this, url);
            this.effectIndex++;

            if (self.opt.showBar) {
                self.eleBox.children(".slider_bar").find("span").removeClass("active").eq(self.nowIndex).addClass("active");
            }
        },
        effects: [
            function (self, url) { //模块下落
                var delayItem = self.opt.delay / (self.opt.x * self.opt.y);
                effectTemplate(self.opt, function (eleA, eleB, x, y) {
                    eleA.css({
                        "top": -self.cubeSize.y + "px",
                        "background-image": "url({0})".format(url)
                    });
                    var delayTime = (x + (self.opt.x * y)) * delayItem * 4 / 5;
                    eleA.delay(delayTime).animate({
                        "top": "0"
                    }, {
                            duration: delayItem * 10,
                            easing: "easeOutBounce"
                    });
                    eleB.delay(delayTime).animate({
                        "top": self.cubeSize.y + "px"
                    }, {
                            duration: delayItem * 10,
                            easing: "easeOutBounce"
                    }).will(function () {
                        $(this).css({
                            "top": "0",
                            "background-image": "url({0})".format(url)
                        });
                    });
                });
            }
            //百叶窗
        ]
    };

    function effectTemplate(opt, callBack) {
        for (var y = 0; y < opt.y; y++) {
            for (var x = 0; x < opt.x; x++) {
                var eleBox = $("#{0}_{1}_{2}".format(opt.id, x, y));
                var eleA = eleBox.children(".slider_inner_a");
                var eleB = eleBox.children(".slider_inner_b");
                callBack(eleA, eleB, x, y);
            }
        }
    }

    function getRandomId() {
        return Math.random().toString(36).substr(2).replace(/\d/g, "")
    }

    $.fn.slider = function (option, obj) {
        if (typeof option == "object") {
            var defaults = {
                imgs: [],
                urls: [],
                x: 2,
                y: 2,
                scale: 4 / 3,
                delay: 800,
                interval: 5000,
                border: false
            };
            return $.each(this, function (index, ele) {
                var opt = $.extend({}, defaults, option);

                if (!ele.id) {
                    ele.id = getRandomId();
                }
                opt.id = ele.id;

                var slider = new Slider(opt);
                $(ele).data("slider", slider);
            })
        }
    }

})(jQuery)
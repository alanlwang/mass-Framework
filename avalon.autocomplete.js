(function(avalon) {
    var defaults = {
        items: 8
    };
    var preventOne = avalon.oneObject("9,13,27,40,38");

    avalon.ui.autocomplete = function(element, id, opts) {
        var $element = avalon(element),
                flagKeyup = false,
                tempValue = "",
                model;
        //处理配置
        var options = avalon.mix({}, defaults);
        avalon.mix(options, $element.data());
        var source = Array.isArray(opts) ? opts.sort() : [];
        var sourceList = document.createElement("div");
        sourceList.innerHTML = '<ul ms-important="' + id + '" class="ui-autocomplete ui-front ui-menu ui-widget ui-widget-content ui-corner-all" ms-each-presentation="matcher" ms-visible="show" >' +
                '<li class="ui-menu-item" ><a  class="ui-corner-all" tabindex="-1" ms-hover="ui-state-focus" ms-class-ui-state-focus="matcher[selectedIndex] === presentation "  >{{presentation}}</a></li>' +
                '</ul>';
        sourceList = sourceList.firstChild;
        $element.bind("blur", function() {
            model.value = tempValue; //还原
            flagKeyup = model.show = false; //隐藏datalist
        });
        $element.bind("keyup", function(e) {
            if (/\w/.test(String.fromCharCode(e.which))) { //如果是字母数字键
                flagKeyup = false; //这是方便在datalist显示时,动态刷新datalist
                model.value = element.value; //触发$watch value回调
            }
        });

        avalon.bind(document, "keyup", function(e) {
            if (model.show) { //这是方便在datalist显示时,不刷新列表,但刷新input值
                flagKeyup = true;
                if (preventOne[e.which]) {
                    e.preventDefault();
                }
                switch (e.which) {
                    case 8:
                        if (model.value === "") {
                            flagKeyup = model.show = false;
                        }
                        break;
                    case 13:
                        // enter
                        tempValue = model.value;
                        flagKeyup = model.show = false;
                        break;
                    case 38:
                        // up arrow
                        --model.selectedIndex;
                        if (model.selectedIndex === -2) {
                            model.selectedIndex = model.matcher.length - 1;
                        }
                        var value = model.matcher[model.selectedIndex];
                        model.value = value === void 0 ? tempValue : value;
                        break
                    case 40:
                        // down arrow
                        ++model.selectedIndex;
                        if (model.selectedIndex === model.matcher.length) {
                            model.selectedIndex = -1;
                        }
                        var value = model.matcher[model.selectedIndex];
                        model.value = value === void 0 ? tempValue : value;
                        break;
                }

            }
        });
        model = avalon.define(id, function(vm) {
            vm.show = false;
            vm.selectedIndex = -1;
            vm.value = element.value;
            vm.matcher = [];
            vm.$watch("value", function(value) {
                if (!flagKeyup) { //flagKeyup是控制datalist的刷新
                    model.show = true;
                    tempValue = value;
                    var lower = [];
                    var matcher = source.filter(function(el) {
                        if (el.indexOf(value) === 0) {
                            return el; //最精确
                        }
                        if (el.toLowerCase().indexOf(value.toLowerCase()) === 0) {
                            lower.push(el); //不区分大小写
                        }
                    });
                    lower = matcher.concat(lower);
                    var query = value.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
                    var strongRegExp = new RegExp('(' + query + ')', 'ig');
                    if (lower.length) {
                        vm.matcher = lower.slice(0, options.items);
                    } else { //模糊匹配,只要它中间有这些字母就行
                        vm.matcher = source.filter(function(el) {
                            return strongRegExp.test(el);
                        });
                    }
                }
            });
        });
        avalon.nextTick(function() {
            element.setAttribute("ms-model", "value");
            document.body.appendChild(sourceList);
            adjustPosition();
            avalon.scan(element, model);
            avalon.scan(sourceList, model);
        });
        function adjustPosition() {
            var offset = $element.offset();
            sourceList.style.width = element.clientWidth + "px";
            sourceList.style.left = offset.left + "px";
            sourceList.style.top = offset.top + element.offsetHeight + "px";
            sourceList.style.zIndex = 9999;
            var pageY = sourceList.offsetHeight + parseFloat(sourceList.style.top);
            if (pageY > avalon(document).offset().top) {
                window.scrollTo(pageY + 50, 0)
            }
        }
        $element.bind("focus", adjustPosition);

    }
})(window.avalon)
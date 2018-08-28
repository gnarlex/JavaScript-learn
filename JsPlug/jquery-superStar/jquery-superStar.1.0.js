;
(function(method) {
	method(window, jQuery, document)
})(
	function(win, $, doc) {
		$.fn.superStar = function(options) {
			var
				setting = {
					//默认星星的个数
					size: 5,
					//打完分的回调方法
					callback: null,
					//样式
					cssClass: "superStar"
				}
			//覆盖参数
			$.extend(
				setting, options);
			//给容器添加样式
			this.toggleClass(setting.cssClass);
			//输出星星 
			for(var i = 0; i < setting.size; i++) {
				var star = $("<a/>").addClass("starItem").addClass("empty").appendTo(this);
				star.mouseover(function() {
					var parent = star.closest("." + setting.cssClass);
					parent.find(".starItem").removeClass("full");
					var index = parent.find(".starItem").index($(this));
					parent.find(".starItem:lt(" + (index + 1) + ")").addClass("full");
				});
				star.mouseleave(function() {
					var parent = star.closest("." + setting.cssClass);
					parent.find(".starItem").removeClass("full"); 
				});
			}
			return this;
		}
	}
);
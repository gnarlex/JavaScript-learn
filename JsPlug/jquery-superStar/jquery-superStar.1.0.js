;
(function(method) {
	method(window, jQuery, document)
})(
	function(win, $, doc) {
		$.fn.superStar = function(options) {
			var
			default = {
				//默认星星的个数
				//打完分的回调方法
				//样式
				cssClass:"superStar"
			}
			//覆盖参数
			$.extend(
				default, options);
				//输出星星
		}
	}
);
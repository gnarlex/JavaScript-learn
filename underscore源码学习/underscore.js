(function() {
	var root = this;
	var perviousUnderscore = root._;

	var ArrayProto = Array.prototype,
		ObjProto = Object.prototype,
		FuncProto = Function.prototype;

	var
		push = ArrayProto.push,
		slice = ArrayProto.slice,
		toString = ObjProto.toString,
		hasOwnProperty = ObjProto.hasOwnProperty;

	var
		nativeIsArray = Array.isArray,
		nativeKeys = Object.keys,
		nativeBind = FuncProto.bind,
		nativeCreate = Object.create;

	var Ctor = function() {};

	var _ = function(obj) {
		if(obj instanceof _) return obj;
		if(!(this instanceof _)) return new _(obj);
		this._wrapped = obj;
	};

	if(typeof exports !== 'undefined') {
		if(typeof module !== 'undefined' && module.exports) {
			exports = module.exports = _;
		}
		exports._ = _;
	} else {
		root._ = _;
	}

	_.VERSION = '1.8.2';

	// Internal function that returns an efficient (for current engines) version
	// of the passed-in callback, to be repeatedly applied in other Underscore
	// functions.
	// underscore 内部方法
	// 根据 this 指向（context 参数）
	// 以及 argCount 参数
	// 二次操作返回一些回调、迭代方法
	var optimizeCb = function(func, context, argCount) {
		// 如果没有指定 this 指向，则返回原函数
		if(context === void 0)
			return func;
		switch(argCount == null ? 3 : argCount) {
			case 1:
				return function(value) {
					return func.call(context, value);
				};
			case 2:
				return function(value, other) {
					return func.call(context, value, other);
				};

				// 如果有指定 this，但没有传入 argCount 参数
				// 则执行以下 case
				// _.each、_.map
			case 3:
				return function(value, index, collection) {
					return func.call(context, value, index, collection);
				};
				// _.reduce、_.reduceRight
			case 4:
				return function(accumulator, value, index, collection) {
					return func.call(context, accumulator, value, index, collection);
				};
		}

		// 其实不用上面的 switch-case 语句
		// 直接执行下面的 return 函数就行了
		// 不这样做的原因是 call 比 apply 快很多    
		// .apply 在运行前要对作为参数的数组进行一系列检验和深拷贝，.call 则没有这些步骤
		// 具体可以参考：
		// https://segmentfault.com/q/1010000007894513
		// http://www.ecma-international.org/ecma-262/5.1/#sec-15.3.4.3
		// http://www.ecma-international.org/ecma-262/5.1/#sec-15.3.4.4
		return function() {
			return func.apply(context, arguments);
		};
	};
	/*
	 * 数组函数
	 */
	_.first = _.head = _.take = function(array, n, guard) {
		if(array == null) return void 0;
		if(n == null || guard) return array[0];
		return _.initial(array, array.length - n);
	};

	_.last = function(array, n, guard) {
		if(array == null) return void 0;
		if(n == null || guard) return array[array.length - 1];
		return _.rest(array, array.length - 1);
	};

	_.initial = function(array, n, guard) {
		return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
	};

	_.rest = _.tail = _.drop = function(array, n, guard) {
		return slice.call(array, n == null || guard ? 1 : n);
	};

	//	_.compact = function(array) {
	//		if(array == null) return void 0;
	//		var temp;
	//		for(var i = 0; i < array.length - 1; i++) {
	//			if(array[i] == false) {
	//				temp.push(array[i]);
	//			}
	//		}
	//		return temp;
	//	}

	var flatten = function(input, shallow, strict, startIndex) {
		var output = [],
			idx = 0;
		for(var i = startIndex || 0, length = input && input.length; i < length; i++) {
			var value = input[i];
			if(isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {

				if(!shallow) value = flatten(value, shallow, strict);
				var j = 0,
					len = value.length;
				output.length += len;
				while(j < len) {
					output[idx++] = value[j++];
				}
			} else if(!strict) {
				output[idx++] = value;
			}
		}
		return output;
	};

	_.flatten = function(input, shallow, strict) {
		return flatten(input, shallow, strict);
	};

	_.without = function(array) {

	};
	_.difference = function(array) {
		var rest = flatten(arguments, true, true, 1);
		//去除重复项
		//return _.

	};

	_.filter = _.select = function(obj, predicate, context) {
		var results = [];
		// 符合predicate的条件
		if(predicate(list)) results.push(value);
		return results;
	};

	var cb = function(value, context, argCount) {
		if(value == null) return _.identity;
		if(_.isFunction(value)) return optimizeCb(value, context, argCount);
		if(_.isObject(value)) return _.matcher(value);
		return _.property(value);
	};

	//默认迭代器
	_.identity = function(value) {
		return value;
	};

	//isFunction 的兼容性处理
	if(typeof /./ != 'function' && typeof Int8Array != 'object') {
		_.isFunction = function(obj) {
			return typeof obj == 'function' || false;
		};
	}

	//	_.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
	//		_['is' + name] = function(obj) {
	//			return toString.call(obj) === '[object ' + name + ']';
	//		};
	//	});

	//	_.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
	//		_['is' + name] = function(obj) {
	//			return toString.call(obj) === '[object ' + name + ']';
	//		};
	//	});

	_.iteratee = function() {

	};

	_.unzip = function(arrays) {

	};

	_.object = function(list, values) {
		var result = {};
		/*
		 * 注意這裡 length = list && list.length; 的用法, 由JavaScript的特殊語法所決定
		 * a || b：如果a是true，那么b不管是true还是false，都返回true。因此不用判断b了，这个时候刚好判断到a，因此返回a。如果a是false，那么就要判断b，如果b是true，那么返回true，如果b是false，返回false，其实不就是返回b了吗。
		 * a && b：如果a是false，那么b不管是true还是false，都返回false，因此不用判断b了，这个时候刚好判断到a，因此返回a。如果a是true，那么就要在判断b，和刚刚一样，不管b是true是false，都返回b。
		 */
		for(var i = 0, length = list && list.length; i < length; i++) {
			if(values) {
				result[list[i]] = values[i];
			} else {
				result[list[i][0]] = list[i][1];
			}
		}
		return result;
	};

	_.range = function(start, stop, step) {
		//console.log(arguments);
		if(arguments.length <= 1) {
			stop = start || 0;
			start = 0;
		}
		step = step || 1;

		var length = Math.max(Math.ceil((stop - start) / step), 0);
		var range = Array(length);
		for(var i = 0; i < length; i++, start += step) {
			range[i] = start;
		}
		return range;
	};

	/*
	 * 对象
	 */

	_.isMatch = function(object, attrs) {
		//把attrs的key拆出来, object的拆出来
		//然后比较 return object[key]==attrs[key]

	}

	//用来判断是否IE<9 的环境
	var hasEnumBug = !{
		toString: null
	}.propertyIsEnumerable('toString');

	var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
		'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'
	];

	function collectNonEnumProps(obj, keys) {
		var nonEnumIdx = nonEnumerableProps.length;
		var constructor = obj.constructor;
		var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;

		var prop = 'constructor';
		if(_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

		while(nonEnumIdx--) {
			prop = nonEnumerableProps[nonEnumIdx];
			if(prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
				keys.push(prop);
			}
		}
	}

	_.keys = function(object) {
		//遍历object, 拆出来属性的名称
		if(!_.isObject(object)) return [];
		if(nativeKeys) return nativeKeys(object);
		var keys = [];
		for(var key in object)
			if(_.has(object, key)) keys.push(key);
		if(hasEnumBug) collectNonEnumProps(obj, keys);
		return keys;
	}

	_.allKeys = function(object) {
		//遍历object, 拆出来属性的名称
		if(!_.isObject(object)) return [];

		var keys = [];
		for(var key in object) keys.push(key);
		if(hasEnumBug) collectNonEnumProps(obj, keys);
		return keys;
	}

	_.has = function(obj, key) {
		return obj != null && hasOwnProperty.call(obj, key);
	};

	_.isObject = function(obj) {
		/*
		 // 强制转换为Boolean 用 !!
			var bool = !!"c";
			console.log(typeof bool); // boolean

		 // 强制转换为Number 用 +
			var num = +"1234";
			console.log(typeof num); // number

		 // 强制转换为String 用 ""+
			var str = ""+ 1234;
			console.log(typeof str); // string
		 */
		var type = typeof obj;
		return type === 'function' || type === 'object' && !!obj;
	};
	_.isArray = nativeIsArray || function(object) {
		return toString.call(object) === '[object Array]';
	};
	_.isNull = function(obj) {
		return obj === null;
	};

	/*
	 * 集合
	 */

	// 闭包
	var property = function(key) {
		return function(obj) {
			return obj == null ? void 0 : obj[key];
		};
	};

	var getLength = property('length'); // 用闭包的方式来进行函数创建, 这个方法不错

	var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;

	//判断是否为类数组对象
	var isArrayLike = function(collection) {
		// 返回参数 collection 的 length 属性值
		var length = getLength(collection); // collection && collection.length;
		return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
	};

}.call(this));
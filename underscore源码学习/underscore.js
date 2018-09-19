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

	var cb = function(value, context, argCount) {
		if(value == null) return _.identity; //如果value为空, 则返回对象本身
		if(_.isFunction(value)) return optimizeCb(value, context, argCount); //如果是函数,则返回回调函数
		if(_.isObject(value)) return _.matcher(value); //如果value是一个对象,则返回k-v比较值
		return _.property(value); //如果value是一个常量类型, 就返回属性
	};

	/*
	 * 集合
	 */

	//var getLength = _.property('length'); // 用闭包的方式来进行函数创建, 这个方法不错

	var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;

	//判断是否为类数组对象
	var isArrayLike = function(collection) {
		// 返回参数 collection 的 length 属性值
		var length = collection && collection.length; //_.property('length')(collection); 
		return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
	};

	_.each = _.forEach = function(object, iteratee, context) {
		iteratee = optimizeCb(iteratee, context);
		if(isArrayLike(object)) {
			for(i = 0, length = object.length; i < length; i++) {
				iteratee(object[i], i, object);
			}
		} else {
			var keys = _.keys(object);
			for(i = 0, length = keys.length; i < length; i++) {
				iteratee(object[keys[i]], keys[i], object);
			}
		}
		return object;
	}

	_.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
		_['is' + name] = function(obj) {
			return toString.call(obj) === '[object ' + name + ']';
		};
	});

	_.map = _.collect = function(object, iteratee, context) {
		iteratee = cb(iteratee, context);
		var keys = !isArrayLike(object) && _.keys(object),
			length = (keys || object).length,
			results = Array(length);

		for(var index = 0; index < length; index++) {
			var currentKey = keys ? keys[index] : index;
			results[index] = iteratee(object[currentKey], currentKey, object);
		}
		return results;
	}

	_.find = function(obj, iteratee, context) {
		iteratee = cb(iteratee, context); //转换为函数
		var results=[];
		for(i = 0; i < obj.length; i++) {
			if(iteratee(obj[i],i,obj))
			results.push(obj[i]);
		}
	}

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

	//isFunction 的兼容性处理
	if(typeof /./ != 'function' && typeof Int8Array != 'object') {
		_.isFunction = function(obj) {
			return typeof obj == 'function' || false;
		};
	}

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

	_.isElement = function(obj) {
		return !!(obj && obj.nodeType === 1);
	};

	_.isEqual = function(a, b) {
		return eq(a, b); //eq这逼很恶心
	};

	// _.isArguments 方法在 IE < 9 下的兼容
	// IE < 9 下对 arguments 调用 Object.prototype.toString.call 方法
	// 结果是 => [object Object]
	// 而并非我们期望的 [object Arguments]。
	// so 用是否含有 callee 属性来做兼容
	if(!_.isArguments(arguments)) {
		_.isArguments = function(obj) {
			return _.has(obj, 'callee');
		};
	}
	// Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
	// IE 11 (#1621), and in Safari 8 (#1929).
	// _.isFunction 在 old v8, IE 11 和 Safari 8 下的兼容
	// 觉得这里有点问题
	// 我用的 chrome 49 (显然不是 old v8)
	// 却也进入了这个 if 判断内部
	if(typeof /./ != 'function' && typeof Int8Array != 'object') {
		_.isFunction = function(obj) {
			return typeof obj == 'function' || false;
		};
	}

	_.isBoolean = function(obj) {
		return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
	};

	_.isNull = function(obj) {
		return obj === null;
	};

	_.isUndefined = function(obj) {
		return obj === void 0; // void 0 恒等于 undefined
	};

	_.isFinite = function(obj) {
		return isFinite(obj) && !isNaN(parseFloat(obj));
	};

	// NaN是唯一一个自己不等于自己的
	_.isNaN = function(obj) {
		return _.isNumber(obj) && obj !== +obj;
	}

	_.isMatch = function(object, attrs) {
		var keys = _.keys(attrs),
			length = keys.length;
		if(object == null) return !length;
		var obj = Object(object);
		for(var i = 0; i < length; i++) {
			var key = keys[i];
			// 如果 obj 对象没有 attrs 对象的某个 key
			// 或者对于某个 key，它们的 value 值不同
			// 则证明 object 并不拥有 attrs 的所有键值对
			// 则返回 false
			if(attrs[key] !== obj[key] || !(key in obj)) return false;
		}
		return true;
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
	_.values = function(obj) {
		var keys = _.keys(obj);
		var length = keys.length;
		var values = Array(length);
		for(var i = 0; i < length; i++) {
			values[i] = obj[keys[i]];
		}
		return values;
	}

	_.pairs = function(obj) {
		var keys = _.keys(obj);
		var length = keys.length;
		var pairs = Array(length);
		for(var i = 0; i < length; i++) {
			pairs[i] = [keys[i], obj[keys[i]]];
		}
		return pairs;
	}

	_.invert = function(obj) {
		//		var invert = {};
		//		var keys = _.keys(obj);
		//		var values = _.values(obj);
		//		invert = _.object(values, keys)
		//		return invert;
		var result = {};
		var keys = _.keys(obj);
		for(var i = 0, length = keys.length; i < length; i++) {
			result[obj[keys[i]]] = keys[i];
		}
		return result;
	}

	_.functions = _.methods = function(obj) {
		var names = [];
		for(var key in obj) {
			if(_.isFunction(obj[key])) names.push(key);
		}
		return names.sort();
	}

	_.extend = function(des, sour) {
		var keys = _.keys(sour);
		for(var key in keys) {
			des[key] = sour[key];
		}

		return des;
	}

	// 分配或复制(经典闭包)
	var createAssigner = function(keysFunc, undefinedOnly) {
		return function(obj) {
			var length = arguments.length;
			if(length < 2 || obj == null) return obj;
			for(var index = 1; index < length; index++) {
				//遍历要复制的键值对
				var source = arguments[index],
					keys = keysFunc(source),
					l = keys.length;
				for(var i = 0; i < l; i++) {
					var key = keys[i];
					/*
					 * undefined为false或者空时, 会执行语句
					 * undefined为true时, 当且仅当 obj[key] 为 undefined 时才覆盖
					 * 如果有相同key值, 则取key首次出现的值
					 * void 0 === undefined , 防止undefined被重写, 同时是优化的写法 
					 */
					if(!undefinedOnly || obj[key] === void 0)
						obj[key] = source[key];
				}
			}
			return obj;
		};
	};

	_.extend = createAssigner(_.allKeys);
	_.extendOwn = _.assign = createAssigner(_.keys);
	_.defaults = createAssigner(_.allKeys, true);

	// 这应该不是浅拷贝吧
	_.clone = function(obj) {
		if(!_.isObject(obj)) return obj;
		return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
	}

	_.property = function(key) {
		return function(obj) {
			return obj == null ? void 0 : obj[key];
		};
	};

	_.propertyOf = function(obj) {
		return obj == null ? function() {} : function(name) {
			return obj[name];
		};
	};

	_.isEmpty = function(obj) {
		if(obj == null) return true;
		if(isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
		return _.keys(obj).length === 0;
	};

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
	 * 实用
	 */
	_.noConflict = function() {
		root._ = previousUnderscore;
		return this;
	}

	_.identity = function(value) {
		return value;
	};

	//默认可选的回调参数
	_.noop = function() {};

	var f1 = function(obj) {
		console.log(obj);
	}

}.call(this));
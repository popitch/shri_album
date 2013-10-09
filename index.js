!function() {
	// data receiver
	window.JSONP_Receiver = function(data) {
		page.data(data);
		console.log(data);
	}

	// page model
	var page = {
		addr: ko.observable(),
		ctrl: ko.observable(),
		args: ko.observableArray(),

		// router here
		Router: new Router({
			'index': /^\/?$/,
			'studentList': /^student\/list$/,
			'lectureList': /^lecture\/list$/
		}, function(ctrl, args, fragment) {
			page.args(args);
			page.ctrl(ctrl);
			page.addr(fragment);
		}),

		data: ko.observable(),

		helpers: helpers
	};

	// page applier
	ko.applyBindings(page);

	function helpers() {
		return {
			is_page: function() {}
		};
	}

	// router abstract
	function Router(routes, lift) {
		var router = this;

		_.defer(function() {
			window.addEventListener('popstate', function(e){
				pop();
			}, false);
			pop();
		});

		function pop(fragment) {
			if (!arguments.length) {
				fragment = fragmentOf(location);
			}
			var found = _.any(routes, function(route, routeName) {
				var matches = route.exec(fragment);
				if (matches) {
					lift(routeName, matches.slice(1), fragment);
					return true;
				}
			});
			if (!found) {
				throw 'Unknown page: ' + fragment;
			}
			return true;
		}

		function push(fragment) {
			if (pop(fragment)) {
				history.pushState(null, null, '#' + fragment);
			}
		}

		// catch simple link click
		document.addEventListener('click', function(e) {
			if (e.target.tagName.toLowerCase() == 'a' && /^#/.test(e.target.href)) {
				e.preventDefault();
				push(fragmentOf(e.target));
			}
		});

		function fragmentOf(target) {
			return target.href.split('#').slice(1).join('#');
		}
	}

	// debug helper
	if (location.protocol ==':file') {
		var s = document.createElement('script');
		s.src = 'http://code.jquery.com/jquery-latest.js';
		document.body.appendChild(s);
	}
}();
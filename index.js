!function() {
	// router here
	var router = new Router(
		{
			'index': /^\/?$/,
			'students': /^students$/,
			'student': /^student\/(\d+)$/,
			'lectures': /^lectures$/,
			'lecture': /^lecture\/(\d+)$/
		},
		function(ctrl, args, fragment) {
			pageModel.page.args(args);
			pageModel.page.ctrl(ctrl);
			pageModel.page.addr(fragment);
		}
	);

	// page model
	this.pageModel = {
		page: {
			ctrl: ko.observable(),
			args: ko.observableArray(),
			addr: ko.observable(),
			is: function(template) {
				if (template instanceof RegExp)
					return template.test(pageModel.page.ctrl());
				return template == pageModel.page.ctrl();
			},
			pusher: function(fragment) {
				return function() {
					router.push(fragment);
				}
			}
		},

		// functional helper
		prop: function(key) {
			return function(data) {
				return data[key];
			}
		},

		// lazy data loading
		data: (function() {
			var data = ko.observable();

			return ko.computed({
				read: function() {
					if (!data()) {
						getScript('./data/data.js?9');
					}
					return data();
				},
				write: function(received) {
					data(received);
					if (window.console)
						console.log('lazy data loaded', received);
				},
				deferEvaluation: true
			});
		}())
	};

	// apply page model
	ko.applyBindings(pageModel);


	// router abstract
	function Router(routes, lift) {
		var router = this;

		_.defer(function() {
			window.addEventListener('popstate', function(e){
				showPage();
			}, false);
			showPage();
		});

		router.push = function(fragment, replace) {
			if (replace) {
				history.replaceState(null, null, '#' + fragment);
			} else {
				history.pushState(null, null, '#' + fragment);
			}
			showPage(fragment);
		};

		// catch simple link click
		document.addEventListener('click', function(e) {
			var target = e.srcElement || e.target;
			if (target.tagName.toLowerCase() == 'a' && /#/.test(target.href)) {
				var fragment = fragmentOf(e.target);
				router.push(fragment);

				if (e.preventDefault) {
					e.preventDefault();
				} else {
					window.event.returnValue = false;
				}
			}
		});

		function showPage(fragment) {
			fragment = fragment || fragmentOf(location);

			var found = _.any(routes, function(route, routeName) {
				var matches = route.exec(fragment);
				if (matches) {
					lift(routeName, matches.slice(1), fragment);
					return true;
				}
			});
			if (!found) {
				// silence redirect
				router.push('/', true);
				//throw 'Unknown page: ' + fragment;
			}
		}

		function fragmentOf(target) {
			return target.href.split('#').slice(1).join('#');
		}
	}


	// script loading helper
	function getScript(url) {
		var script = document.createElement('script');
		script.src = url;
		document.body.appendChild(script);
	}

	// debug helper
	if (location.protocol =='file:') {
		var s = document.createElement('script');
		s.src = 'http://code.jquery.com/jquery-latest.js';
		document.body.appendChild(s);
	}
}();
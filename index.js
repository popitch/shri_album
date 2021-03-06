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
		// route helper
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
		}()),

		// functional helpers
		prop: function(key) {
			return function(data) {
				return data[key];
			};
		},
		equals: function(etalon, getter) {
			return function(data) {
				return etalon == getter(data);
			};
		},

		// other helpers
		withLinks: function(text) {
			return text.replace(/(^|\W)(http:\/\/[^\s]*?)($|\)?[\s,])/g, function(s, b, u, e) {
				return b + '<a href="' + entities(u) + '">' + u + '</a>' + e;
			});

			function entities(html) {
				return _.reduce({
					'"': '&quote;',
					'\\': '\\\\'
				}, function(html, search, replace) {
					return html.split(search).join(replace);
				}, html)
			}
		}
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
	
	// page loaded
	document.body.className = '';
}();
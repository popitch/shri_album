!function(){
	// page model
	var Page = {
		uriFragment: ko.observable(),
		ctrl: ko.observable(),
		args: ko.observableArray()
	};

	// routes applier
	ko.applyBindings(Page);

	// define routes
	var router = new Router({
		'index': /^\/?$/,
		'studentList': /^student\/list$/,
		'lectureList': /^lecture\/list$/
	}, function(ctrl, args, fragment) {
		Page.args(args);
		Page.ctrl(ctrl);
		Page.uriFragment(fragment);
	});

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
			if (e.target.tagName.toLowerCase() == 'a') {
				e.preventDefault();
				push(fragmentOf(e.target));
			}
		});

		function fragmentOf(target) {
			return target.href.split('#').slice(1).join('#');
		}
	}
}();
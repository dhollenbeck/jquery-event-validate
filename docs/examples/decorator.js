!function($) {
	'use strict';

	$.fn.bootstrap = function(options) {

		options = options || {};
		var input = $(this);
		var parent1, parent2, parent3, el1, el2, group, texty, classy;
		var prefixes = options.prefixes || {};
		var message = options.message;

		if (options.status === 'progress') return;

		// manage feedback
		if (options.status === 'validating') {
			input.feedback({state: true});
		} else if (options.status === 'validated') {
			input.feedback({state: false});
		}

		if (options.status === 'validating') return;

		parent1 = input.parent();
		parent2 = parent1.parent();
		parent3 = parent2.parent();
		texty = input.closest('.texty');
		classy = input.closest('.classy');

		//placement
		if (texty.length && classy.length) {
			el1 = texty;
			el2 = classy;
		} else if (parent1.hasClass('form-group')) {
			el1 = parent1;
			el2 = parent1;
		} else if (parent1.is('[class^="col-"]')) {
			el1 = parent1;
			el2 = parent2;
		} else if (parent1.is('td')) {
			el1 = parent1;
			el2 = parent1;
		} else if (parent1.hasClass('checkbox') || parent1.hasClass('radio')) {
			el1 = parent2;
			el2 = parent2;
		} else if (parent1.hasClass('input-group')) {
			el1 = parent2;
			if (parent2.is('[class^="col-"]')) {
				el2 = parent3;
			} else {
				el2 = parent2;
			}
		} else if (parent3.is('[class^="col-"]')) {
			el1 = parent3;
			el2 = input.closest('.form-group');
		} else {
			group = input.closest('.form-group');
			if (group.length) {
				el1 = input.closest('.form-group');
				el2 = input.closest('.form-group');
			} else {
				el1 = parent3;
				el2 = parent3;
			}
		}

		//prefix message
		if (options.message) {
			if (prefixes.success && options.validation === 'success') message = prefixes.success + message;
			if (prefixes.danger && options.validation === 'danger') message = prefixes.danger + message;
			if (prefixes.warning && options.validation === 'warning') message = prefixes.warning + message;
			if (prefixes.reset && options.validation === 'reset') message = prefixes.reset + message;
		}

		// display message.
		el1.texty({
			wrapper: '<span class="help-block"></span>',
			message: message
		});

		// add success class on options.validation = 'success'.
		// add failure class on options.validation = 'danger'.
		// remove success and failure classes on options.validation = 'reset'
		el2.classy({
			validation: options.validation,
			classSuccess: 'has-success',
			classFailure: 'has-error',
			classWarning: 'has-warning'
		});
	};
}(window.jQuery);

!function($) {
	'use strict';

	$.fn.classy = function(options) {

		options = options || {};
		var input = $(this);

		if (options.debug) {
			console.groupCollapsed('Decorators.classy()', options.validation); /* eslint-disable indent */
				console.log('input', input);
				console.log('validation', options.validation);
				console.log('classSuccess', options.classSuccess);
				console.log('classFailure', options.classFailure);
				console.log('classWarning', options.classWarning);
			console.groupEnd(); /* eslint-enable indent */
		}

		function decorate(container, validation) {

			container.removeClass(options.classSuccess);
			container.removeClass(options.classFailure);
			container.removeClass(options.classWarning);

			if (validation === 'success') {
				container.addClass(options.classSuccess);
			} else if (validation === 'danger') {
				container.addClass(options.classFailure);
			} else if (validation === 'warning') {
				container.addClass(options.classWarning);
			}
		}

		decorate(input, options.validation);
	};
}(window.jQuery);

!function($) {
	'use strict';

	$.fn.decorate = function(plugin, options) {

		plugin = plugin || 'bootstrap';
		options = options || {};

		var form = $(this);
		var exists = ($.isFunction($.fn[plugin]));

		if (!exists) return console.warn('Decorator plugin ($.fn.' + plugin + ') was not found.');

		// decorate the form
		form.on('status.input.prove', function(event, data) {
			var input = $(event.target);
			data = $.extend(data, options);
			if (exists) input[plugin](data);
		});
	};

}(window.jQuery);

!function($) {
	'use strict';

	$.fn.decorateErrors = function(errors) {

		errors = errors || {};
		var form = $(this);

		$.each(errors, function(name, message) {
			var selector = '[name="' + name + '"]';
			if ($.isArray(message)) message = message[0];
			var data = {
				field: name,
				validator: 'server',
				status: 'validated', //validated on server
				validation: 'danger',
				message: message
			};
			var input = form.find(selector);
			input.trigger('status.input.prove', data);
		});
	};

}(window.jQuery);

(function($) {
	'use strict';

	$.fn.feedback = function(options) {

		options = options || {};

		var input = $(this);
		var klass = options.classFeedback || 'has-default';
		var group, feedback;

		if (!input.is('input')) return;
		if (input.is(':radio')) return;
		if (input.is(':checkbox')) return;

		group = input.closest('.form-group');
		feedback = input.parent().find('.form-control-feedback');

		//toggle
		if (options.state === false) {
			feedback.remove();
			group.removeClass(klass);
			group.removeClass('has-feedback');
		} else if (options.state === true) {
			if (!group.hasClass('has-feedback')) {
				group.addClass(klass);
				group.addClass('has-feedback');
				input.parent().append('<span class="form-control-feedback fa fa-spinner fa-spin"></span>');
			}
		}
	};
})(window.jQuery);

!function($) {
	'use strict';

	$.fn.texty = function(options) {

		options = options || {};
		var group = $(this);
		var input = group.find(':prove-input');

		if (options.debug) {
			console.groupCollapsed('Decorators.texty()'); /* eslint-disable indent */
				console.log('group', group);
				console.log('validation', options.validation);
				console.log('wrapper', options.wrapper);
				console.log('placement', options.placement);
				console.log('message', options.message);
			console.groupEnd(); /* eslint-enable indent */
		}

		function setup() {
			var texty = $(options.wrapper);
			texty.addClass('texty-wrapper');
			texty.html(options.message);
			group.children().not('.form-control-static').last().after(texty);

			// aria
			var invalid = (options.validation === 'danger')? 'true' : 'false';
			var uuid = $.fn.uuid();
			input.attr('aria-invalid', invalid);
			input.attr('aria-describedby', uuid);
			texty.attr('id', uuid);
		}

		function teardown() {
			group.find('.texty-wrapper').remove();
			input.removeAttr('aria-invalid');
			input.remove('aria-describedby');
		}

		teardown();
		if (options.message) setup();
	};
}(window.jQuery);

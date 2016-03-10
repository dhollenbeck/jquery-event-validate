/**
 * jQuery Prove (https://github.com/dhollenbeck/jquery-prove)
 */
!function ($) {
	"use strict";

	// Prove constructor
	function Prove(form, options) {

		this.$form = $(form);

		//todo: clean this up
		this.options = $.extend(this.defaults, options);

		console.groupCollapsed('Prove()');
		console.log('options', options);
		console.groupEnd();

		this.setupFields();
	}

	//$.Prove.prototype.defaults = {
	Prove.prototype = {

		defaults: {},
		constructor: Prove,

		destroy: function() {
			console.log('destroy()');
			//this.$container.remove();
			//this.$form.show();
			//this.$form.data('prove', null);

			var el = this.$form;
			el.data('prove', false);

			this.teardownFields();

			el.trigger('destroyed.prove');
		},
		//return jquery selector that represents the element in the DOM
		domSelector: function(name, field){
			return (field.selector)
				? field.selector
				: '[name="' + name + '"]';
		},
		//return string of space seperated events used to detect change to the DOM element
		domEvents: function(name, field){
			var events = field.trigger || 'change keyup click blur';
			return events;
		},
		setupFields: function(options){

			var opts = options || this.options;
			var fields = opts.fields || {};
			var that = this;

			//console.log('setupFields()');

			$.each(fields, function(name, field){
				that.bindDomEvent(name, field);
				that.html5NoValidate(true);
			});
		},
		teardownFields: function(options){

			var opts = options || this.options;
			var fields = opts.fields || {};
			var that = this;

			//console.log('teardownFields()');

			$.each(fields, function(name, field){
				that.unbindDomEvent(name, field);
				this.html5NoValidate(false);
			});
		},
		html5NoValidate: function(state){
			this.$form.attr("novalidate", state);
		},
		//delegate DOM events to form
		bindDomEvent: function(name, field){

			var el = this.$form;
			var domEvents = this.domEvents(name, field);
			var selector = this.domSelector(name, field);
			var handler = $.proxy(this.domInputEventHandler, this);
			var data = $.extend({}, field); //clone

			// Put field name in field config, so downstream
			// event handlers know what field triggered the event.
			data.name = name;

			// http://api.jquery.com/on/
			el.on(domEvents, selector, data, handler);
		},
		unbindDomEvent: function(name, field){
			var el = this.$form;
			var domEvents = this.domEvents(name, field);
			var selector = this.domSelector(name, field);

			//console.log('unbindDomEvents()', events, selector);

			// http://api.jquery.com/off/
			el.off(domEvents, selector);
		},
		domInputEventHandler: function(event){

			var input = $(event.target);
			var field = event.data;
			var name = field.name;
			var values = this.serializeObject(); //get all values

			this.checkField(name, field, input, values);
		},
		checkField: function(fieldName, fieldConfig, input, values){

			var data, isValid = true, state;
			var validators = fieldConfig.validators || {};

			$.each(validators, function(validatorName, validatorConfig){

				// Only check next validator if there was
				// not a problem with the previous one.
				if (isValid !== false) {

					//todo: show warning if validator plugin is not defined
					//invoke validator plugin
					state = input[validatorName](validatorConfig);

					// Compose data the decorator will be interested in
					data = {
						field: fieldName,
						state: state,
						message: validatorConfig.message,
						// todo: do we return an array of validators and their data?
						// We would need to do this on the `validated.form.prove` event.
						validator: {
							name: validatorName,
							config: $.extend({}, validatorConfig) //clone
						}
					}

					// setup for next loop
					if (state === false) isValid = false;
				}
			});

			//trigger event indicating validation state
			//this.$form.trigger('field.prove', data);
			input.trigger('field.prove', data);

			return isValid;
		},

		serializeObject: function(){
			//https://raw.githubusercontent.com/cowboy/jquery-misc/master/jquery.ba-serializeobject.js
			var obj = {};

			$.each( this.$form.serializeArray(), function(i,o){
				var n = o.name;
				var v = o.value;

				obj[n] = obj[n] === undefined ? v
					: $.isArray( obj[n] ) ? obj[n].concat( v )
					: [ obj[n], v ];
			});

			return obj;
		},

		//validate entire form
		validate: function(){
			console.log('Prove.valid()');

			var fields = this.options.fields;
			var checkField = $.proxy(this.checkField, this);
			var values = this.serializeObject();
			var isValid = true;
			var that = this;

			$.each(fields, function(fieldName, fieldConfig){

				//todo: encapsulate
				var selector = '[name="' + fieldName + '"]';
				var input = that.$form.find(selector);


				var isValidField = checkField(fieldName, fieldConfig, input, values);

				console.log('isValidField', isValidField);
				if (!isValidField) isValid = false;
			});

			return isValid;
		}
	};

	$.fn.prove = function(option, parameter, extraOptions) {
		//console.log('prove()', option);

		return this.each(function() {

			var el = $(this);
			var data = el.data('prove');
			var options = typeof option === 'object' && option;
			var isInitialized = (data);

			// either initialize or call public method
			if (!isInitialized) {
				// initialize new instance
				data = new Prove(this, options);
				el.data('prove', data);
				el.trigger('initialized.prove');
			} else if (typeof option === 'string') {
				// call public method
				// todo: warn if public method does not exist
				data[option](parameter, extraOptions);
			} else {
				throw new Error('invalid invocation.');
			}
		});
	};

	$.fn.prove.Constructor = Prove;

}(window.jQuery);
(function ($) {
	
	/* Countdown Clock
	 * Files: m.jquery.countdown.js
	 * Available Methods:
	 * 		init(): initial buildout and load of plugin
	 * Available Options
	 * 		prefix: default('mrvl-clck') what to prefix classes associated with plugin
	 * 		font: default('Helvetica, Arial, sans-serif') default font set
	 * 		width: default(300px) default width of container
	 * 		height: default(200px) default height of container
	 * 		fontSize: default(18px) default font size of clock
	 * 		fontColor: default(#000) default font color
	 * 		background: default(transparent) default container bgColor
	 * 		clockBackground: default(transparent) default clock strip bgColor
	 * 		clockOpacity: default(1) default opacity for clock strip
	 * 		dayPrefix: default(null) html allowed, prefix text for days
	 * 		hourPrefix: default(null) html allowed, prefix for hours
	 * 		minPrefix: default(null) html allowed, prefix for minutes
	 * 		secondPrefix: default(null) html allowed, prefix for seconds
	 * 		daySuffix: default('D') html allowed, suffix for days
	 * 		hourSuffix: default('H') html allowed, suffix for hours
	 * 		minSuffix: default('M') html allowed, suffix for minutes
	 * 		secondSuffix: default('S') html allowed, suffix for seconds
	 * 		finished: default(null) html allowed, replaces clock when time runs out
	 * 		countUntil: default('12/21/2012 00:00:00 EST') readable time to count down until
	 * 		overwriteStyle: default(false) if true, strips all built in styling.
	 * 		onComplete: function to run after clock finishes counting, 
	 * 					$(this) refers to obj you called it on
	 * Description:
	 * 		This is a jquery plugin that you pass a time too and it will create a basic
	 * 		countdown clock which allows for styling and reactions after the clock completes.
	 * 		You can set eastern or pacific by passing a well formatted date string in the options
	 * 		and the clock will run. It allows for chaining and fires an onComplete function. Multiple
	 * 		clocks can run on the page by calling it multiple times or passing a multiple item selector.
	 */
	
	// Private methods for plugin
	var methods = {
		
		// Takes main object (MClock) and builds html
		// Fires the setupEvents function after build
		// Returns container when finished.
		buildHtml: function () {
			//Container
			MClock.container = $('<div />');
			MClock.container.addClass(MClock.opts.prefix + '-container');
			if (!MClock.opts.overwriteStyle) {
				MClock.container.css({
					width: MClock.opts.width,
					height: MClock.opts.height,
					background: MClock.opts.background,
					position: 'relative'
				});
			}
			//Clock bar
			MClock.clockbar = $('<div />');
			MClock.clockbar.addClass(MClock.opts.prefix + '-clockbar');
			if (!MClock.opts.overwriteStyle) {
				MClock.clockbar.css({
					position: 'absolute',
					bottom: '10px',
					left: '0px',
					width: '100%',
					height: 'auto',
					fontSize: MClock.opts.fontSize,
					color: MClock.opts.fontColor,
					fontFamily: MClock.opts.font,
					background: MClock.opts.clockBackground,
					opacity: MClock.opts.clockOpacity
				});
			}
			//Setup Time
			MClock.days = $('<span />');
			MClock.hours = $('<span />');
			MClock.mins = $('<span />');
			MClock.seconds = $('<span />');

			MClock.days
				.addClass(MClock.opts.prefix + '-days');
			MClock.hours
				.addClass(MClock.opts.prefix + '-hours');
			MClock.mins
				.addClass(MClock.opts.prefix + '-mins');
			MClock.seconds
				.addClass(MClock.opts.prefix + '-seconds');

			MClock.clockbar.prepend(MClock.days, MClock.hours, MClock.mins, MClock.seconds);

			MClock.clockbar.appendTo(MClock.container);
			
			// Start events
			methods.setupEvents();

			// Return built html
			return MClock.container;

		},

		// Currently only sets up the clckStrt event which creates countdown
		setupEvents: function () {
			var dateObj = new Date(),
				time = MClock.opts.countUntil - dateObj.valueOf();

			MClock.container.bind('clckStrt', {time: time}, methods.clckStrt);
		},

		// Event to countdown clock, takes time in as data
		clckStrt: function (e) {
			var timeLeft, days, hours, mins, seconds, counter, updateMins = false,
				updateHours = false, updateDays = false, $this = MClock, item = $(this);
			
			// LET'S DO MATH!
			timeLeft = e.data.time / 1000;
			days = (timeLeft / 86400 > 0) ? methods.addZero(Math.floor(timeLeft / 86400)) : '00';
			hours = (timeLeft % 86400 / 3600 > 0) ? methods.addZero(Math.floor(timeLeft % 86400 / 3600)) : '00';
			mins = (timeLeft % 86400 % 3600 / 60 > 0) ? methods.addZero(Math.floor(timeLeft % 86400 % 3600 / 60)) : '00';
			seconds = (timeLeft % 86400 % 3600 % 60 > 0) ? methods.addZero(Math.floor(timeLeft % 86400 % 3600 % 60)) : '00';

			// Setup initial time
			if (days === '00' && hours === '00' && mins === '00' && seconds === '00' && MClock.opts.finished) {
				item.find('.' + $this.opts.prefix + '-clockbar').html($this.opts.finished);
				item.trigger('onComplete');
				return;
			} else {
				methods.resetClock(item, days, hours, mins, seconds);
				if (days === '00' && hours === '00' && mins === '00' && seconds === '00') {
					item.trigger('onComplete');
					return;
				}
			}
			// Start counter
			counter = setInterval(function () {
				//Iterate through time and react appropriately
				seconds--;
				if (seconds < 0) {
					seconds = 59;
					mins--;
					updateMins = true;
				} else {
					updateMins = false;
				}
				item.find('.' + $this.opts.prefix + '-seconds').html($this.opts.secondPrefix + methods.addZero(seconds) + $this.opts.secondSuffix);

				if (updateMins) {
					if (mins < 0) {
						mins = 59;
						hours--;
						updateHours = true;
					} else {
						updateHours = false;
					}
					item.find('.' + $this.opts.prefix + '-mins').html($this.opts.minPrefix + methods.addZero(mins) + $this.opts.minSuffix);
				}

				if (updateHours) {
					if (hours < 0) {
						hours = 23;
						days--;
						updateDays = true;
					} else {
						updateDays = false;
					}
					item.find('.' + $this.opts.prefix + '-hours').html($this.opts.hourPrefix + methods.addZero(hours) + $this.opts.hourSuffix);
				}

				if (updateDays) {
					if (days < 0) {
						// We're all done here, clean up counter and fire complete methods
						clearInterval(counter);
						if (!$this.opts.finished) {
							methods.resetClock(0, 0, 0, 0);
						} else {
							item.find('.' + $this.opts.prefix + '-clockbar').html($this.opts.finished);
						}
						item.trigger('onComplete');
					} else {
						item.find('.' + $this.opts.prefix + '-days').html($this.opts.dayPrefix + methods.addZero(days) + $this.opts.daySuffix);
					}
				}

			}, 1000);

		},
		
		// Method to create a date out of countUntil or die
		parseCountUntil: function () {

			var date = new Date(MClock.opts.countUntil);
			if (date.getFullYear() === 'Nan') {
				return false;
			} else {
				return date.valueOf();
			}

		},

		// Method to reset clock appropriately
		resetClock: function (item, days, hours, mins, seconds) {
			item.find('.' + MClock.opts.prefix + '-days').html(MClock.opts.dayPrefix + methods.addZero(days) + MClock.opts.daySuffix);
			item.find('.' + MClock.opts.prefix + '-hours').html(MClock.opts.hourPrefix + methods.addZero(hours) + MClock.opts.hourSuffix);
			item.find('.' + MClock.opts.prefix + '-mins').html(MClock.opts.minPrefix + methods.addZero(mins) + MClock.opts.minSuffix);
			item.find('.' + MClock.opts.prefix + '-seconds').html(MClock.opts.secondPrefix + methods.addZero(seconds) + MClock.opts.secondSuffix);
		},

		// Format numbers with 2 digits
		addZero: function (num) {
			if (!isNaN(num)) {
				num = (String(num).length < 2) ? String("0" + num) : String(num);
			}
			return num;
		}

	},

	// Main object contains init and default options
	MClock = {
		init: function (options) {
			// Setup default options
			var defaultOptions = {
				prefix: 'mrvl-clck',
				font: 'Helvetica, Arial, sans-serif',
				width: '300px',
				height: '200px',
				fontSize: '18px',
				fontColor: '#000',
				background: 'transparent',
				clockBackground: 'transparent',
				clockOpacity: '1',
				dayPrefix: '',
				daySuffix: 'D ',
				hourPrefix: '',
				hourSuffix: 'H ',
				minPrefix: '',
				minSuffix: 'M ',
				secondPrefix: '',
				secondSuffix: 'S ',
				finished: false,
				countUntil: '12/21/2012 00:00:00 EST',
				overwriteStyle: false,
				onComplete: function () {}
			};

			// Overwrite options with ones passed in
			MClock.opts = $.extend(defaultOptions, options);

			// Set string time and die if time is not proper
			MClock.opts.countUntil = methods.parseCountUntil();
			if (!MClock.opts.countUntil && typeof console !== 'undefined') {
				console.log('Incorrect countUntil format, please enter as following "01/31/2011 22:59:59 EST"');
				return;
			}

			// Load clock into DOM and bind onComplete, trigger clock start
			$(this) 
				.append(methods.buildHtml())
				.bind('onComplete',MClock.opts.onComplete)
				.find('.' + MClock.opts.prefix + '-container')
					.trigger('clckStrt');

			return;
		}
	};
	
	// Initiate methods for clock (did it this way for later expansion if needed)
	$.fn.countdown = function (method) {

	    // Method calling logic
	    if (MClock[method]) {
	    	return MClock[method].apply( this, Array.prototype.slice.call(arguments, 1));
	    } else if (typeof method === 'object' || !method) {
	    	return MClock.init.apply(this, arguments);
	    } else {
	    	$.error('Method ' +  method + ' does not exist on jQuery.tooltip');
	    }
	};
}(jQuery));
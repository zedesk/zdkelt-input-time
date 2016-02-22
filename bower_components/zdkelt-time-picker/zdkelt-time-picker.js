Polymer({
	is        : 'zdkelt-time-picker',
	properties: {
		/**
		 * The value formated as 'HH:MM'
		 *
		 * The time is given in 24-hours time
		 */
		value  : {
			type              : String,
			value             : '00:00',
			reflectToAttribute: true,
			notify            : true,
			observer          : '_valueChanged'
		},
		/**
		 * Define the view
		 *
		 * available value are `hours` (default) or `minutes`
		 */
		view   : {
			type    : String,
			value   : 'hours',
			observer: '_setView'
		},
		/**
		 * not yet implemented
		 * Boolean flag indicates to draw our clock with 12 hours
		 */
		hour12 : {
			type  : Boolean,
			value : false,
			notify: true
		},
		/**
		 * The hours value
		 */
		hours  : {
			type : String,
			value: '00'
		},
		/**
		 * The minutes value
		 */
		minutes: {
			type : String,
			value: '00'
		}
	},

	attached: function () {
		this.refresh();
	},

	/**
	 * Force the redraw of the clock
	 */
	refresh: function () {
		this.view = 'minutes';
		setTimeout((function () {
			this.view = 'hours';
		}).bind(this), 0);
	},

	/**
	 * set the view, depending of the `view`property
	 */
	_setView: function () {
		this.$.hours.classList.remove('selected');
		this.$.minutes.classList.remove('selected');
		switch (this.view) {
			case 'hours':
				this.$.hours.classList.toggle('selected');
				this.$.clock.minutes = false;
				this.$.clock.value = parseInt(this.hours, 10);
				break;
			case 'minutes':
				this.$.minutes.classList.toggle('selected');
				this.$.clock.minutes = true;
				this.$.clock.value = parseInt(this.minutes, 10);
				break;
		}
	},

	/**
	 * toggle the view
	 */
	_toggleView: function (evt) {
		var select = this.$.header.querySelector('.selected');
		if (evt && evt.target === select) {
			return;
		}
		this.view = select.id === 'hours' ? 'minutes' : 'hours';
	},

	_valueChanged: function (newValue) {
		if (!newValue) {
			this.value = this.hours + ':' + this.minutes;
			return;
		}
		var tmp = newValue.match(/(\d+):(\d+)/);
		if (tmp) {
			this.set('hours', tmp[1]);
			this.set('minutes', tmp[2]);
			if (this.$.clock.minutes) {
				this.$.clock.value = parseInt(tmp[2], 10);
			} else {
				this.$.clock.value = parseInt(tmp[1], 10);
			}
		}
	},

	/**
	 * intercept the `change`event of the zdkelt-clock component.
	 *
	 * if the the view was the `hours` view, it's then automatically changed
	 * to the `minutes` view.
	 */
	_clockChange: function (evt) {
		evt.stopPropagation();
		if (this.view === 'hours') {
			this._toggleView();
		}
	},

	/**
	 * The `update` event is emitted when the mouse is dragged
	 *
	 * @event update
	 */
	_clockUpdate: function (evt) {
		evt.stopPropagation();
		var tmp = parseInt(evt.detail, 10);
		this.set(this.view, (tmp < 10 ? '0' : '') + tmp);
		this.value = this.hours + ':' + this.minutes;
		this.fire('update', this.value);
	}
});

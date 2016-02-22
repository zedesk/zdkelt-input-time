Polymer({
	is        : 'zdkelt-clock',
	properties: {
		/**
		 * The value selected
		 */
		value   : {
			type              : Number,
			value             : 0,
			reflectToAttribute: true,
			notify            : true,
			observer          : '_valueChanged'
		},
		/**
		 * Boolean flag indicates to draw minutes clock
		 */
		minutes : {
			type              : Boolean,
			value             : false,
			reflectToAttribute: true,
			notify            : true,
			observer          : '_viewChanged'
		},
		/**
		 * Boolean flag indicates to draw our clock with 12 hours
		 */
		hour12  : {
			type : Boolean,
			value: false
		},
		/**
		 * the meridiem value : 'AM'|'PM'
		 * 
		 * __Nota :__ not yet implemented
		 */
		meridiem: {
			type              : String,
			reflectToAttribute: true,
			notify            : true
		},
		/**
		 * The radius of the clock
		 */
		_radius : {
			type: Number
		},
		/**
		 * internal flag indicating when the mouse is down
		 */
		_down   : {
			type : Boolean,
			value: false
		}
	},

	ready: function () {
		this._radius = this.$.clock.offsetWidth / 2 - 15;
		// this._viewChanged();
	},

	attached: function () {
		this._radius = this.$.clock.offsetWidth / 2 - 15;
		this._viewChanged();
	},

	/**
	 * change the view function of the `minutes` property
	 */
	_viewChanged: function () {
		this.$.ticks.innerHTML = '';
		if (!this.$.clock.offsetWidth) {
			return;
		}
		this._radius = this.$.clock.offsetWidth / 2 - 15;
		if (this.minutes) {
			this._minutedraw();
		} else {
			this._hour12draw();
			this._hour24draw();
		}
	},

	/**
	 * Draw the the hour clock ( 0 to 11 )
	 */
	_hour12draw: function () {
		var ticks = this.$.ticks;
		var angleOffset = -360 / 12 * (Math.PI / 180);
		var angle = Math.PI / 2;
		var radius = this._radius;
		var radiusTot = this.$.clock.offsetWidth / 2;

		Array.apply(null, {
				length: 12
			})
			.map(Number.call, Number)
			.map(function (tickLabel, indx) {
				var tick = document.createElement('div');
				tick.classList.add('tick');
				tick.innerHTML = tickLabel;
				tick.setAttribute('value', tickLabel);
				if (indx === 0) {
					tick.classList.toggle('select');
				}
				Polymer.dom(ticks).appendChild(tick);

				var x = radius * Math.cos(angle + angleOffset * indx) + radiusTot;
				var y = -radius * Math.sin(angle + angleOffset * indx) + radiusTot;
				var transform = 'translate(' + x + 'px,' + y + 'px)';
				tick.style.transform = transform;
			});
	},

	/**
	 * Draw the the hour clock ( 12 to 23 )
	 */
	_hour24draw: function () {
		var angleOffset = -360 / 12 * (Math.PI / 180);
		var angle = Math.PI / 2;
		var ticks = this.$.ticks;
		var radius = this._radius;
		var radiusTot = this.$.clock.offsetWidth / 2;

		Array.apply(null, {
				length: 12
			})
			.map(Number.call, Number)
			.map(function (tickLabel, indx) {
				var tick = document.createElement('div');
				tick.classList.add('tick');
				tick.innerHTML = tickLabel + 12;
				tick.setAttribute('value', tickLabel + 12);
				Polymer.dom(ticks).appendChild(tick);
				var x = (radius - 30) * Math.cos(angle + angleOffset * indx) + radiusTot;
				var y = -(radius - 30) * Math.sin(angle + angleOffset * indx) + radiusTot;
				var transform = 'translate(' + x + 'px,' + y + 'px)';
				tick.style.transform = transform;
			});
	},

	/**
	 * Draw the minutes clock
	 */
	_minutedraw: function () {
		var angleOffset = -360 / 60 * (Math.PI / 180);
		var angle = Math.PI / 2;
		var ticks = this.$.ticks;
		var radius = this._radius;
		var radiusTot = this.$.clock.offsetWidth / 2;

		Array.apply(null, {
				length: 60
			})
			.map(Number.call, Number)
			.map(function (tickLabel, indx) {
				var tick = document.createElement('div');
				tick.classList.add('tick');
				if (indx % 5 === 0) {
					tick.innerHTML = indx;
				}
				if (indx === 0) {
					tick.classList.toggle('select');
				}
				tick.setAttribute('value', indx);
				Polymer.dom(ticks).appendChild(tick);
				var x = radius * Math.cos(angle + angleOffset * indx) + radiusTot;
				var y = -radius * Math.sin(angle + angleOffset * indx) + radiusTot;
				var transform = 'translate(' + x + 'px,' + y + 'px)';
				tick.style.transform = transform;
			});
		var line = document.querySelector('.line');
		if (line.classList.contains('sline')) {
			line.classList.remove('sline');
		}
	},

	/**
	 * an `update` event is emitted when the value change by dragging the mouse
	 * @event update
	 */
	_valueChanged: function () {
		var ticks = [].slice.call(this.$.ticks.querySelectorAll('.tick'));
		if (!ticks.length) {
			return;
		}
		var selected = this.$.ticks.querySelector('.tick.select');
		if (selected) {
			selected.classList.toggle('select');
		}
		if (this.value < 0 || this.value > ticks.length - 1) {
			this.value = 0;
		}
		this._selectorPos();
		this.fire('update', this.value);
	},

	/**
	 * Draw the selector
	 */
	_selectorPos: function () {
		if (isNaN(this.value)) {
			return;
		}
		var ticks = [].slice.call(this.$.ticks.querySelectorAll('.tick'));
		ticks[this.value].classList.toggle('select');
		var angleOffset = this.minutes ? 6 : 30;
		var theta = (this.value + (this.minutes ? 30 : 6)) * angleOffset;
		var transform = 'rotate(' + theta + 'deg)';
		this.$.selector.style.transform = transform;
		var line = this.$.clock.querySelector('.line');
		var classList = this.$.clock.querySelector('.large-dot').classList;
		if (this.minutes) {
			line.classList.remove('sline');
			if (this.value % 5 === 0) {
				classList.remove('ldot-minutes');
			} else {
				if (!classList.contains('ldot-minutes')) {
					classList.add('ldot-minutes');
				}
			}
		} else {
			classList.remove('ldot-minutes');
			var line = this.$.clock.querySelector('.line');
			if (this.value >= 12) {
				if (!line.classList.contains('sline')) {
					line.classList.add('sline');
				}
			} else {
				if (line.classList.contains('sline')) {
					line.classList.remove('sline');
				}
			}
		}
	},
	
	_startSelect: function (evt) {
		this._down = true;
		this._dragSelect(evt);
	},

	/**
	 * return polar coordinate
	 *
	 * the angle is offset by 90° to obtain 0 at the the "0" position
	 * @return {*} the polar coordiante { a: angle, r: radius }
	 */
	_getEltCoordinate: function (x, y) {
		var rect = this.$.clock.getBoundingClientRect();
		var coord = {
			x: x - rect.left - this.$.clock.offsetWidth / 2,
			y: y - rect.top - this.$.clock.offsetHeight / 2
		};
		var radius = Math.sqrt(coord.x * coord.x + coord.y * coord.y);
		var theta = Math.atan(coord.y / coord.x);
		theta = (Math.PI / 2) + theta + (coord.x < 0 ? Math.PI : 0);

		return {
			a: theta * 180 / Math.PI,
			r: radius
		};
	},

	_dragSelect: function (evt) {
		var clock = this.$.clock;
		if (!this._down) {
			return;
		}
		var angleOffset = this.minutes ? 6 : 30;
		var coord = this._getEltCoordinate(evt.detail.x, evt.detail.y);
		var selector = this.$.selector;
		// get the nearest point
		var indx = Math.round(coord.a / angleOffset);
		if (!this.minutes && indx === 12) {
			indx = 0
		}
		this.value = indx + (this.minutes ? 0 : (coord.r > this._radius - 20) ? 0 : 12);
	},

	/**
	 * an `change` event is emitted when the mouse is released
	 * 
	 * @event change
	 */
	_finishSelect: function () {
		this._down = false;
		this.fire('change', this.value);
	}
});

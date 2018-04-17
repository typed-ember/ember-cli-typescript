'use strict';

const debug = require('debug')('ember-cli-typescript:compiler-state');
const RSVP = require('rsvp');

/*
 * This class captures the state of the Broccoli build and the TypeScript
 * compilation process in terms of our concurrent juggling of the two.
 * It maintains a `buildDeferred` object for the most recently started
 * TS compilation, and it accepts notifications about changes in the state
 * of the world framed as {broccoli,tsc}Did{Start,End} method calls.
 */
module.exports = class CompilerState {
  constructor() {
    this._buildingBroccoliNodes = 0;
    this.tscDidStart();
  }

  broccoliDidStart() {
    this._buildingBroccoliNodes++;
    this._emitTransition('broccoliDidStart');
  }

  broccoliDidEnd() {
    this._buildingBroccoliNodes--;
    this._emitTransition('broccoliDidEnd');
  }

  tscDidStart() {
    if (this.buildDeferred) {
      this.buildDeferred.resolve();
    }

    this.buildDeferred = RSVP.defer();
    this._tscBuilding = true;
    this._pendingErrors = [];
    this._emitTransition('tscDidStart');
  }

  tscDidEnd() {
    if (this._pendingErrors.length) {
      this.buildDeferred.reject(new Error(this._pendingErrors.join('\n')));
    } else {
      this.buildDeferred.resolve();
    }

    this._tscBuilding = false;
    this._emitTransition('tscDidEnd');
  }

  didError(error) {
    this._pendingErrors.push(error);
    this._emitTransition('didError');
  }

  _emitTransition(event) {
    debug(
      `%s | broccoli: %s active nodes | tsc: %s (%s errors)`,
      event,
      this._buildingBroccoliNodes,
      this._tscBuilding ? 'building' : 'idle',
      this._pendingErrors.length
    );
  }
};

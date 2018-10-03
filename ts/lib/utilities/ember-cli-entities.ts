import { ExtendOptions, ExtendThisType } from 'core-object';
import Addon from 'ember-cli/lib/models/addon';

/*
 * This module contains identity functions that accept and return config
 * hashes for various Ember CLI entities, ensuring that they're compatible
 * with the expected config signature and that any methods have the correct
 * `this` type.
 */

/** Configuration for defining an Ember CLI addon */
export function addon<T extends ExtendOptions<Addon>>(options: T & ExtendThisType<Addon, T>): T {
  return options;
}

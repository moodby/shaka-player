/**
 * @license
 * Copyright 2016 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

goog.provide('shaka.util.BufferUtils');

goog.require('shaka.util.Iterables');


/**
 * @summary A set of BufferSource utility functions.
 * @exportInterface
 */
shaka.util.BufferUtils = class {
  /**
   * Compare two buffers for equality.  For buffers of different types, this
   * compares the underlying buffers as binary data.
   *
   * @param {?BufferSource} arr1
   * @param {?BufferSource} arr2
   * @return {boolean}
   * @export
   */
  static equal(arr1, arr2) {
    const BufferUtils = shaka.util.BufferUtils;
    if (!arr1 && !arr2) {
      return true;
    }
    if (!arr1 || !arr2) {
      return false;
    }
    if (arr1.byteLength != arr2.byteLength) {
      return false;
    }

    // Quickly check if these are views of the same buffer.  An ArrayBuffer can
    // be passed but doesn't have a byteOffset field, so default to 0.
    if (BufferUtils.unsafeGetArrayBuffer(arr1) ==
            BufferUtils.unsafeGetArrayBuffer(arr2) &&
        (arr1.byteOffset || 0) == (arr2.byteOffset || 0)) {
      return true;
    }

    const uint8A = new Uint8Array(arr1);
    const uint8B = new Uint8Array(arr2);
    for (const i of shaka.util.Iterables.range(arr1.byteLength)) {
      if (uint8A[i] != uint8B[i]) {
        return false;
      }
    }
    return true;
  }

  /**
   * Gets the underlying ArrayBuffer of the given view.  The caller needs to
   * ensure it uses the "byteOffset" and "byteLength" fields of the view to
   * only use the same "view" of the data.
   *
   * @param {BufferSource} view
   * @return {!ArrayBuffer}
   * @export
   */
  static unsafeGetArrayBuffer(view) {
    if (view instanceof ArrayBuffer) {
      return view;
    } else {
      return view.buffer;
    }
  }

  /**
   * Gets an ArrayBuffer that contains the data from the given TypedArray.  Note
   * this will allocate a new ArrayBuffer if the object is a partial view of
   * the data.
   *
   * @param {!BufferSource} view
   * @return {!ArrayBuffer}
   * @export
   */
  static toArrayBuffer(view) {
    if (view instanceof ArrayBuffer) {
      return view;
    } else {
      if (view.byteOffset == 0 && view.byteLength == view.buffer.byteLength) {
        // This is a TypedArray over the whole buffer.
        return view.buffer;
      }
      // This is a "view" on the buffer.  Create a new buffer that only contains
      // the data.  Note that since this isn't an ArrayBuffer, the "new" call
      // will allocate a new buffer to hold the copy.
      return new Uint8Array(view).buffer;
    }
  }

  /**
   * Creates a DataView over the given buffer.
   * @param {BufferSource} buffer
   * @return {!DataView}
   * @export
   */
  static toDataView(buffer) {
    if (buffer instanceof ArrayBuffer) {
      return new DataView(buffer);
    } else {
      return new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    }
  }
};
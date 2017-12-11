const ImageLoader = {

  /**
   * Using the global ImageLoader namespace, calls ImageLoader.load on the
   * given node with the given config options.
   *
   * @method load
   * @param  {HTMLElement} img    Image node to be loaded
   * @param  {Object} config      Config object
   * @return {Boolean}            True if the image was loaded, false otherwise
   */
  
  load(img, config) {
    return window.ImageLoader.load(img, config);
  }
};

/**
 * @exports {Object} ImageLoader
 */

export default ImageLoader;
goog.provide('os.command.VectorLayerFillColor');

goog.require('os.command.AbstractVectorStyle');
goog.require('os.data.OSDataManager');
goog.require('os.events.PropertyChangeEvent');
goog.require('os.metrics');
goog.require('os.source.PropertyChange');
goog.require('os.ui');



/**
 * Changes the fill color of a layer
 * @extends {os.command.AbstractVectorStyle}
 * @param {string} layerId
 * @param {Array<number>|string} color
 * @param {(Array<number>|string)=} opt_oldColor
 * @constructor
 */
os.command.VectorLayerFillColor = function(layerId, color, opt_oldColor) {
  os.command.VectorLayerFillColor.base(this, 'constructor', layerId, color, opt_oldColor);
  console.log('VectorLayerFillColor', color);
  this.title = 'Change Fill Color';
  this.metricKey = os.metrics.Layer.VECTOR_FILL_COLOR;

  if (!color) {
    var layer = /** @type {os.layer.Vector} */ (os.MapContainer.getInstance().getLayer(this.layerId));
    if (layer) {
      var options = layer.getLayerOptions();
      color = /** @type {string} */ (options && options['baseColor'] || os.command.VectorLayerFillColor.DEFAULT_COLOR);
    }
  }

  // make sure the value is a string
  this.value = os.style.toRgbaString(color);
};
goog.inherits(os.command.VectorLayerFillColor, os.command.AbstractVectorStyle);


/**
 * @type {string}
 * @const
 */
os.command.VectorLayerFillColor.DEFAULT_COLOR = 'rgba(255,255,255,0)';


/**
 * @inheritDoc
 */
os.command.VectorLayerFillColor.prototype.getOldValue = function() {
  var config = os.style.StyleManager.getInstance().getLayerConfig(this.layerId);

  if (config) {
    os.style.getConfigColor(config, false, os.style.StyleField.FILL);
  } else {
    return os.command.VectorLayerFillColor.DEFAULT_COLOR;
  }
};


/**
 * @inheritDoc
 */
os.command.VectorLayerFillColor.prototype.applyValue = function(config, value) {
  var color = os.style.toRgbaString(/** @type {string} */ (value));
  console.log('VectorLayerFillColor.applyValue', value, config);
  console.log('- before color/fill/fillColor/image.fill', config.color, config.fill, config.fillColor, config.image.fill);
  os.style.setConfigColor(config, color, [os.style.StyleField.FILL]);
  console.log('- after color/fill/fillColor/image.fill', config.color, config.fill, config.fillColor, config.image.fill);
  // os.ui.adjustIconSet(this.layerId, color);

  os.command.VectorLayerFillColor.base(this, 'applyValue', config, value);
};


/**
 * @inheritDoc
 */
os.command.VectorLayerFillColor.prototype.finish = function(config) {
  // dispatch the color change event on the source for the histogram
  var source = os.osDataManager.getSource(this.layerId);
  source.dispatchEvent(new os.events.PropertyChangeEvent(os.source.PropertyChange.COLOR, this.value));

  if (source instanceof os.source.Vector) {
    // a color change on the layer should clear any color model on the source
    source.setColorModel(null);
  }

  os.command.VectorLayerFillColor.base(this, 'finish', config);
};

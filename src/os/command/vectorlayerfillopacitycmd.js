goog.provide('os.command.VectorLayerFillOpacity');

goog.require('os.command.AbstractVectorStyle');
goog.require('os.events.PropertyChangeEvent');
goog.require('os.metrics');
goog.require('os.ui');



/**
 * Changes the fill opacity of a feature
 * @extends {os.command.AbstractVectorStyle}
 * @param {string} layerId
 * @param {number} opacity
 * @param {number=} opt_oldOpacity
 * @constructor
 */
os.command.VectorLayerFillOpacity = function(layerId, opacity, opt_oldOpacity) {
  os.command.VectorLayerFillOpacity.base(this, 'constructor', layerId, opacity, opt_oldOpacity);
  this.title = 'Change Fill Opacity';
  this.metricKey = os.metrics.Layer.VECTOR_STROKE_OPACITY;

  this.value = opacity;
};
goog.inherits(os.command.VectorLayerFillOpacity, os.command.AbstractVectorStyle);


/**
 * @type {number}
 * @const
 */
os.command.VectorLayerFillOpacity.DEFAULT_OPACITY = 1;


/**
 * @inheritDoc
 */
os.command.VectorLayerFillOpacity.prototype.getOldValue = function() {
  var config = os.style.StyleManager.getInstance().getLayerConfig(this.layerId);
  return config ? os.style.getConfigOpacityColor(config) : os.command.VectorLayerFillOpacity.DEFAULT_OPACITY;
};


/**
 * @inheritDoc
 */
os.command.VectorLayerFillOpacity.prototype.applyValue = function(config, value) {
  var color = os.style.getConfigColor(config, true, os.style.StyleField.FILL);
  color[3] = value;
  os.style.setConfigColor(config, color, [os.style.StyleField.FILL]);

  os.command.VectorLayerFillOpacity.base(this, 'applyValue', config, value);
};


/**
 * @inheritDoc
 */
os.command.VectorLayerFillOpacity.prototype.finish = function(config) {
  // dispatch the color change event on the source for the histogram
  var source = os.osDataManager.getSource(this.layerId);
  source.dispatchEvent(new os.events.PropertyChangeEvent(os.source.PropertyChange.COLOR, this.value));

  if (source instanceof os.source.Vector) {
    // a color change on the layer should clear any color model on the source
    source.setColorModel(null);
  }

  os.command.VectorLayerFillOpacity.base(this, 'finish', config);
};

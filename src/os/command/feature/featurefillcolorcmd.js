goog.provide('os.command.FeatureFillColor');

goog.require('os.command.AbstractFeatureStyle');
goog.require('os.events.PropertyChangeEvent');
goog.require('os.metrics');



/**
 * Changes the fill color of a feature
 * @extends {os.command.AbstractFeatureStyle}
 * @param {string} layerId
 * @param {string} featureId
 * @param {Array<number>|string} color
 * @param {(Array<number>|string)=} opt_oldColor
 * @constructor
 */
os.command.FeatureFillColor = function(layerId, featureId, color, opt_oldColor) {
  os.command.FeatureFillColor.base(this, 'constructor', layerId, featureId, color, opt_oldColor);
  this.title = 'Change Feature Fill Color';
  this.metricKey = os.metrics.Layer.FEATURE_FILL_COLOR;

  if (!color) {
    var feature = /** @type {ol.Feature} */ (this.getFeature());
    var config = /** @type {Object|undefined} */ (feature.get(os.style.StyleType.FEATURE));

    if (config) {
      if (goog.isArray(config)) {
        config = config[0];
      }
      var configColor = /** @type {Array<number>|string|undefined} */ (os.style.getConfigColor(config));

      if (configColor) {
        color = os.color.toHexString(color);
      }
    }
  }

  // Make sure the value is a string
  this.value = os.style.toRgbaString(color);
};
goog.inherits(os.command.FeatureFillColor, os.command.AbstractFeatureStyle);


/**
 * @type {string}
 * @const
 */
os.command.FeatureFillColor.DEFAULT_COLOR = 'rgba(255,255,255,0)';


/**
 * @inheritDoc
 */
os.command.FeatureFillColor.prototype.getOldValue = function() {
  var feature = /** @type {ol.Feature} */ (this.getFeature());
  var config = /** @type {Array<Object>|Object|undefined} */ (this.getFeatureConfigs(feature));
  if (goog.isArray(config)) {
    config = config[0];
  }

  if (config) {
    return os.style.getConfigColor(config, false, os.style.StyleField.FILL);
  } else {
    return os.command.FeatureFillColor.DEFAULT_COLOR;
  }
};


/**
 * Gets the old label color
 * @return {Array<number>|string|undefined}
 */
os.command.FeatureFillColor.prototype.getLabelValue = function() {
  var feature = /** @type {ol.Feature} */ (this.getFeature());
  var labelColor = /** @type {Array<number>|string|undefined} */ (feature.get(os.style.StyleField.LABEL_COLOR));
  return labelColor ? labelColor : os.style.DEFAULT_LAYER_COLOR;
};


/**
 * @inheritDoc
 */
os.command.FeatureFillColor.prototype.applyValue = function(configs, value) {
  var color = os.style.toRgbaString(/** @type {string} */ (value));
  for (var i = 0; i < configs.length; i++) {
    os.style.setConfigColor(configs[i], color, [os.style.StyleField.FILL]);
  }

  os.command.FeatureFillColor.base(this, 'applyValue', configs, value);
};


/**
 * Set the label color
 * @param {Object} configs The style config
 * @param {string} value The value to apply
 */
os.command.FeatureFillColor.prototype.applyLabelValue = function(configs, value) {
  var feature = /** @type {ol.Feature} */ (this.getFeature());
  feature.set(os.style.StyleField.LABEL_COLOR, value);

  for (var i = 0; i < configs.length; i++) {
    configs[i][os.style.StyleField.LABEL_COLOR] = value;
  }
};


/**
 * @inheritDoc
 */
os.command.FeatureFillColor.prototype.finish = function(configs) {
  // dispatch the color change event on the source for the histogram
  var feature = /** @type {ol.Feature} */ (this.getFeature());
  var source = /** @type {plugin.file.kml.KMLSource} */ (os.feature.getSource(feature));
  var rootNode = source.getRootNode();
  var children = rootNode.getChildren();

  for (var i = 0; i < children.length; i++) { // update icon color
    children[i].dispatchEvent(new os.events.PropertyChangeEvent('icons'));
  }

  os.command.FeatureFillColor.base(this, 'finish', configs);
};

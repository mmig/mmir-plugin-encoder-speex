
/* plugin config definition: used by mmir-plugin-exports to generate module-config.gen.js */

/**
 * TODO add/support speex encoder settings,
 * e.g. compression (DEFAULT: wb)
 *
 * NOTE would need to be implemented via mmir-plugin-encoder-core(?)
 */
export interface PluginConfig {
  speexEncoder?: any;
}

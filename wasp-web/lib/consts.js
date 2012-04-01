/*!
 * Wasp
 * Copyright(c) 2011 Nectify <dev@nectify.com>
 * Apache 2.0 Licensed
 */

require('pkginfo')(module, 'version');

var consts = {};

consts['SERVER_PORT'] = 3001;

consts['WASP_VERSION'] = module.exports['version'];

exports = module.exports = consts;
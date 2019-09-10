import config from '../../config/config.json';

import createJLPTDictIndex from './createJLPTDictIndex';

// Set config to global namespace
global.gConfig = config;

// Run following migration
createJLPTDictIndex();

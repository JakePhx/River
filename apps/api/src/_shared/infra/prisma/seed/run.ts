import 'dotenv/config';

import { main } from './index';

void main().catch((e) => {
  console.error(e);
  process.exit(1);
});

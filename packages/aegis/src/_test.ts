import { Query } from '@jujulego/aegis-core';

import { $store } from './store';
import { $entity } from './entity';

interface ITest {
  id: string;
  try: number;
  success: boolean;
}

const $Test = $entity('Test', $store.memory(), (test: ITest) => test.id)
  .$query('get', (arg: { id: string }) => new Query(), ({ id }) => id);

const r = $Test.get({ id: 'toto' });
const d = r.data;

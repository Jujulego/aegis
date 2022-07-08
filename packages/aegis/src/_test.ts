import { Query } from '@jujulego/aegis-core';

import { $store } from './store';
import { $entity } from './entity';

interface ITest {
  id: string;
  try: number;
  success: boolean;
}

const $Test = $entity('Test', $store.memory(), (test: ITest) => [test.id, test.try] as const)
  .$query('get', (arg: { id: string, try: number }) => new Query(), (arg) => [arg.id, arg.try]);

const r = $Test.get({ id: 'toto', try: 2 });
const d = r.data;

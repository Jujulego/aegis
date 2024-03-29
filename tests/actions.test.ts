import { Draft, Immer } from 'immer';
import { beforeEach, vi } from 'vitest';

import { actions$ } from '@/src/actions.js';
import { SyncMutableRef } from '@/src/defs/mutable-ref.js';
import { var$ } from '@/src/refs/var.js';

// Types
interface TestData {
  readonly id: string;
  readonly life: number;
}

// Setup
let ref: SyncMutableRef<TestData>;

beforeEach(() => {
  ref = var$({ id: 'test', life: 42 });
});

// Tests
describe('actions$', () => {
  it('should mutate ref using given reducer', () => {
    vi.spyOn(ref, 'mutate');

    const act = actions$(ref, {
      reset: () => (old) => {
        old.life = 0;
      }
    });

    expect(act.reset()).toStrictEqual({ id: 'test', life: 0 });
    expect(ref.mutate).toHaveBeenCalledWith({ id: 'test', life: 0 });
  });

  it('should pass arguments to reducer', () => {
    const reducer = vi.fn((to: number) => (old: Draft<TestData>) => {
      old.life = to;
    });

    const act = actions$(ref, {
      reset: reducer
    });

    expect(act.reset(1)).toStrictEqual({ id: 'test', life: 1 });
    expect(reducer).toHaveBeenCalledWith(1);
  });

  it('should use given Immer instance', () => {
    const immer = new Immer();
    vi.spyOn(immer, 'produce');

    const act = actions$(ref, {
      reset: () => (old) => {
        old.life = 0;
      }
    }, { immer });

    expect(act.reset()).toStrictEqual({ id: 'test', life: 0 });
    expect(immer.produce).toHaveBeenCalled();
  });
});

import { AegisApi, ApiRequest } from '../src';

// Types
interface Test {
  id: string;
  success: boolean;
}

interface TestOptions {
  opt1?: string;
  opt2?: number;
}

// Setup
const sender = jest.fn<Promise<Test>, [req: ApiRequest<unknown>, signal: AbortSignal, opts?: TestOptions]>();
let $testApi: AegisApi<TestOptions>;

beforeEach(() => {
  sender.mockReset();
  $testApi = new AegisApi(sender);
});

// Tests
describe('AegisApi.request', () => {
  it('should send a GET request using the fetcher', () => {
    sender.mockResolvedValue({ id: 'test', success: true });

    // Create and call fetcher
    const fetcher = $testApi.request((id: number) => ({ method: 'get', url: `/test/${id}` }));
    const query = fetcher(1);

    expect(sender).toHaveBeenCalledWith(
      { method: 'get', url: '/test/1' },
      query.controller.signal,
      undefined
    );
  });

  it('should send a POST request using the fetcher', () => {
    sender.mockResolvedValue({ id: 'test', success: true });

    // Create and call fetcher
    const fetcher = $testApi.request((body: Test) => ({ method: 'post', url: '/test', body }));
    const query = fetcher({ id: 'test', success: true });

    expect(sender).toHaveBeenCalledWith(
      { method: 'post', url: '/test', body: { id: 'test', success: true } },
      query.controller.signal,
      undefined
    );
  });

  it('should pass down options to fetcher', () => {
    sender.mockResolvedValue({ id: 'test', success: true });

    // Create and call fetcher
    const fetcher = $testApi.request((id: number) => [{ method: 'get', url: `/test/${id}` }, { opt1: 'option' }]);
    const query = fetcher(1);

    expect(sender).toHaveBeenCalledWith(
      { method: 'get', url: '/test/1' },
      query.controller.signal,
      { opt1: 'option' }
    );
  });
});

describe('AegisApi.get', () => {
  it('should send a GET request using the fetcher', () => {
    sender.mockResolvedValue({ id: 'test', success: true });

    // Create and call fetcher
    const fetcher = $testApi.get`/test/${'id'}`;
    const query = fetcher({ id: 1 });

    expect(sender).toHaveBeenCalledWith(
      { method: 'get', url: '/test/1' },
      query.controller.signal,
      undefined
    );
  });

  it('should pass down options to fetcher', () => {
    sender.mockResolvedValue({ id: 'test', success: true });

    // Create and call fetcher
    const fetcher = $testApi.get`/test/${'id'}`;
    const query = fetcher({ id: 1 }, { opt1: 'option' });

    expect(sender).toHaveBeenCalledWith(
      { method: 'get', url: '/test/1' },
      query.controller.signal,
      { opt1: 'option' }
    );
  });
});

describe('AegisApi.head', () => {
  it('should send a HEAD request using the fetcher', () => {
    sender.mockResolvedValue({ id: 'test', success: true });

    // Create and call fetcher
    const fetcher = $testApi.head`/test/${'id'}`;
    const query = fetcher({ id: 1 });

    expect(sender).toHaveBeenCalledWith(
      { method: 'head', url: '/test/1' },
      query.controller.signal,
      undefined
    );
  });

  it('should pass down options to fetcher', () => {
    sender.mockResolvedValue({ id: 'test', success: true });

    // Create and call fetcher
    const fetcher = $testApi.head`/test/${'id'}`;
    const query = fetcher({ id: 1 }, { opt1: 'option' });

    expect(sender).toHaveBeenCalledWith(
      { method: 'head', url: '/test/1' },
      query.controller.signal,
      { opt1: 'option' }
    );
  });
});

describe('AegisApi.options', () => {
  it('should send a OPTIONS request using the fetcher', () => {
    sender.mockResolvedValue({ id: 'test', success: true });

    // Create and call fetcher
    const fetcher = $testApi.options`/test/${'id'}`;
    const query = fetcher({ id: 1 });

    expect(sender).toHaveBeenCalledWith(
      { method: 'options', url: '/test/1' },
      query.controller.signal,
      undefined
    );
  });

  it('should pass down options to fetcher', () => {
    sender.mockResolvedValue({ id: 'test', success: true });

    // Create and call fetcher
    const fetcher = $testApi.options`/test/${'id'}`;
    const query = fetcher({ id: 1 }, { opt1: 'option' });

    expect(sender).toHaveBeenCalledWith(
      { method: 'options', url: '/test/1' },
      query.controller.signal,
      { opt1: 'option' }
    );
  });
});

describe('AegisApi.delete', () => {
  it('should send a DELETE request using the fetcher', () => {
    sender.mockResolvedValue({ id: 'test', success: true });

    // Create and call fetcher
    const fetcher = $testApi.delete`/test/${'id'}`;
    const query = fetcher({ id: 1 });

    expect(sender).toHaveBeenCalledWith(
      { method: 'delete', url: '/test/1' },
      query.controller.signal,
      undefined
    );
  });

  it('should pass down options to fetcher', () => {
    sender.mockResolvedValue({ id: 'test', success: true });

    // Create and call fetcher
    const fetcher = $testApi.delete`/test/${'id'}`;
    const query = fetcher({ id: 1 }, { opt1: 'option' });

    expect(sender).toHaveBeenCalledWith(
      { method: 'delete', url: '/test/1' },
      query.controller.signal,
      { opt1: 'option' }
    );
  });
});

describe('AegisApi.post', () => {
  it('should send a POST request using the fetcher', () => {
    sender.mockResolvedValue({ id: 'test', success: true });

    // Create and call fetcher
    const fetcher = $testApi.post`/test/${'id'}`.body<Test>();
    const query = fetcher({ id: '1' }, { id: '1', success: true });

    expect(sender).toHaveBeenCalledWith(
      { method: 'post', url: '/test/1', body: { id: '1', success: true } },
      query.controller.signal,
      undefined
    );
  });

  it('should pass down options to fetcher', () => {
    sender.mockResolvedValue({ id: 'test', success: true });

    // Create and call fetcher
    const fetcher = $testApi.post`/test/${'id'}`.body<Test>();
    const query = fetcher({ id: '1' }, { id: '1', success: true }, { opt1: 'option' });

    expect(sender).toHaveBeenCalledWith(
      { method: 'post', url: '/test/1', body: { id: '1', success: true } },
      query.controller.signal,
      { opt1: 'option' }
    );
  });
});

describe('AegisApi.put', () => {
  it('should send a PUT request using the fetcher', () => {
    sender.mockResolvedValue({ id: 'test', success: true });

    // Create and call fetcher
    const fetcher = $testApi.put`/test/${'id'}`.body<Test>();
    const query = fetcher({ id: '1' }, { id: '1', success: true });

    expect(sender).toHaveBeenCalledWith(
      { method: 'put', url: '/test/1', body: { id: '1', success: true } },
      query.controller.signal,
      undefined
    );
  });

  it('should pass down options to fetcher', () => {
    sender.mockResolvedValue({ id: 'test', success: true });

    // Create and call fetcher
    const fetcher = $testApi.put`/test/${'id'}`.body<Test>();
    const query = fetcher({ id: '1' }, { id: '1', success: true }, { opt1: 'option' });

    expect(sender).toHaveBeenCalledWith(
      { method: 'put', url: '/test/1', body: { id: '1', success: true } },
      query.controller.signal,
      { opt1: 'option' }
    );
  });
});

describe('AegisApi.patch', () => {
  it('should send a PATCH request using the fetcher', () => {
    sender.mockResolvedValue({ id: 'test', success: true });

    // Create and call fetcher
    const fetcher = $testApi.patch`/test/${'id'}`.body<Test>();
    const query = fetcher({ id: '1' }, { id: '1', success: true });

    expect(sender).toHaveBeenCalledWith(
      { method: 'patch', url: '/test/1', body: { id: '1', success: true } },
      query.controller.signal,
      undefined
    );
  });

  it('should pass down options to fetcher', () => {
    sender.mockResolvedValue({ id: 'test', success: true });

    // Create and call fetcher
    const fetcher = $testApi.patch`/test/${'id'}`.body<Test>();
    const query = fetcher({ id: '1' }, { id: '1', success: true }, { opt1: 'option' });

    expect(sender).toHaveBeenCalledWith(
      { method: 'patch', url: '/test/1', body: { id: '1', success: true } },
      query.controller.signal,
      { opt1: 'option' }
    );
  });
});

import { AegisQuery } from '@jujulego/aegis-core';
import axios from 'axios';

import { $api } from '../src';

// Tests
describe('$api.get', () => {
  beforeEach(() => {
    jest.spyOn(axios, 'get')
      .mockResolvedValue({ data: 'success' });
  });

  it('should send a GET request', async () => {
    const fetcher = $api.get`/test/${'id'}`;
    const query = fetcher({ id: 1 });

    expect(axios.get).toHaveBeenCalledWith('/test/1', { signal: query.controller.signal });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(query).toBeInstanceOf(AegisQuery);
    expect(query.state).toEqual({
      status: 'completed',
      result: 'success'
    });
  });
});

describe('$api.head', () => {
  beforeEach(() => {
    jest.spyOn(axios, 'head')
      .mockResolvedValue({ data: 'success' });
  });

  it('should send a HEAD request', async () => {
    const fetcher = $api.head`/test/${'id'}`;
    const query = fetcher({ id: 1 });

    expect(axios.head).toHaveBeenCalledWith('/test/1', { signal: query.controller.signal });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(query).toBeInstanceOf(AegisQuery);
    expect(query.state).toEqual({
      status: 'completed',
      result: 'success'
    });
  });
});

describe('$api.options', () => {
  beforeEach(() => {
    jest.spyOn(axios, 'options')
      .mockResolvedValue({ data: 'success' });
  });

  it('should send a OPTIONS request', async () => {
    const fetcher = $api.options`/test/${'id'}`;
    const query = fetcher({ id: 1 });

    expect(axios.options).toHaveBeenCalledWith('/test/1', { signal: query.controller.signal });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(query).toBeInstanceOf(AegisQuery);
    expect(query.state).toEqual({
      status: 'completed',
      result: 'success'
    });
  });
});

describe('$api.delete', () => {
  beforeEach(() => {
    jest.spyOn(axios, 'delete')
      .mockResolvedValue({ data: 'success' });
  });

  it('should send a DELETE request', async () => {
    const fetcher = $api.delete`/test/${'id'}`;
    const query = fetcher({ id: 1 });

    expect(axios.delete).toHaveBeenCalledWith('/test/1', { signal: query.controller.signal });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(query).toBeInstanceOf(AegisQuery);
    expect(query.state).toEqual({
      status: 'completed',
      result: 'success'
    });
  });
});

describe('$api.post', () => {
  beforeEach(() => {
    jest.spyOn(axios, 'post')
      .mockResolvedValue({ data: 'success' });
  });

  it('should send a POST request', async () => {
    const fetcher = $api.post`/test/${'id'}`;
    const query = fetcher({ id: 1 }, 'body');

    expect(axios.post).toHaveBeenCalledWith('/test/1', 'body', { signal: query.controller.signal });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(query).toBeInstanceOf(AegisQuery);
    expect(query.state).toEqual({
      status: 'completed',
      result: 'success'
    });
  });
});

describe('$api.put', () => {
  beforeEach(() => {
    jest.spyOn(axios, 'put')
      .mockResolvedValue({ data: 'success' });
  });

  it('should send a PUT request', async () => {
    const fetcher = $api.put`/test/${'id'}`;
    const query = fetcher({ id: 1 }, 'body');

    expect(axios.put).toHaveBeenCalledWith('/test/1', 'body', { signal: query.controller.signal });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(query).toBeInstanceOf(AegisQuery);
    expect(query.state).toEqual({
      status: 'completed',
      result: 'success'
    });
  });
});

describe('$api.patch', () => {
  beforeEach(() => {
    jest.spyOn(axios, 'patch')
      .mockResolvedValue({ data: 'success' });
  });

  it('should send a PATCH request', async () => {
    const fetcher = $api.patch`/test/${'id'}`;
    const query = fetcher({ id: 1 }, 'body');

    expect(axios.patch).toHaveBeenCalledWith('/test/1', 'body', { signal: query.controller.signal });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(query).toBeInstanceOf(AegisQuery);
    expect(query.state).toEqual({
      status: 'completed',
      result: 'success'
    });
  });
});

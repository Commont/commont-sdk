import { Commont } from '../src';

describe('Commont client', () => {
  const commont = Commont('my-project');

  it('returns existing comments from the API', async () => {
    const res1 = await commont.getComments('test');

    expect(res1).not.toMatchObject({ error: /w+/ });

    if ('comments' in res1) {
      expect(res1.count).toBe(3);
      expect(res1.comments.length).toBe(3);
    }
  });

  it('returns an error on a missing topic', async () => {
    const res1 = await commont.getComments('');

    expect(res1).toMatchObject({
      error: 'Missing required parameter',
    });

    expect(res1).not.toMatchObject({ count: /d+/ });
    expect(res1).not.toMatchObject({ comments: expect.anything() });
  });

  it('returns an empty list for an unknown topic', async () => {
    const commont = Commont('test');
    const res1 = await commont.getComments('unknown');

    expect(res1).not.toMatchObject({ error: /w+/ });

    expect(res1).toMatchObject({ count: 0 });
    expect(res1).toMatchObject({ comments: [] });
  });

  it('handles pagination', async () => {
    const res1 = await commont.getComments('test', { take: 2 });

    expect(res1).not.toMatchObject({ error: /w+/ });

    if ('comments' in res1) {
      expect(res1).toMatchObject({ count: 3 }); // total comments
      expect(res1.comments.length).toBe(2);
    }

    const res2 = await commont.getComments('test', { take: 2, skip: 1 });

    expect(res2).not.toMatchObject({ error: /w+/ });

    if ('comments' in res2) {
      expect(res2).toMatchObject({ count: 3 }); // total comments
      expect(res2.comments.length).toBe(1);
    }
  });

  it('allows adding new comments', async () => {
    const res1 = await commont.getComments('/my-blogpost');

    expect(res1).not.toMatchObject({ error: /w+/ });

    if ('comments' in res1) {
      expect(res1.count).toBe(0);
    }

    const newComment1 = await commont.addComment('/my-blogpost', {
      author: 'me',
      content: 'Hello world!',
    });

    expect(newComment1).not.toMatchObject({ error: /w+/ });

    if ('topic' in newComment1) {
      expect(newComment1).toMatchObject({
        topic: '/my-blogpost',
        author: 'me',
        content: 'Hello world!',
        createdAt: expect.any(String),
      });
    }

    const newComment2 = await commont.addComment('/my-blogpost', {
      author: 'me',
      content: 'Nice one!',
    });

    expect(newComment2).not.toMatchObject({ error: /w+/ });

    if ('topic' in newComment2) {
      expect(newComment2).toMatchObject({
        topic: '/my-blogpost',
        author: 'me',
        content: 'Nice one!',
        createdAt: expect.any(String),
      });
    }

    const res2 = await commont.getComments('/my-blogpost');

    expect(res2).not.toMatchObject({ error: /w+/ });

    if ('comments' in res2) {
      expect(res2.count).toBe(2);
    }
  });

  it('returns an error on an invalid addComment payload', async () => {
    // @ts-expect-error
    const res1 = await commont.addComment('/my-blogpost-3', {
      author: 'me',
    });
    expect(res1).toMatchObject({
      error: 'Missing required parameter',
    });
  });

  it('handles details object', async () => {
    const details = {
      key: 'value',
    };
    const res1 = await commont.addComment('/my-blogpost-details', {
      author: 'me',
      content: 'hello',
      details,
    });
    if ('topic' in res1) {
      expect(res1).toMatchObject({
        topic: '/my-blogpost-details',
        author: 'me',
        content: 'hello',
        createdAt: expect.any(String),
        details: expect.any(Object),
      });
    }

    const res2 = await commont.getComments('/my-blogpost-details');

    expect(res2).not.toMatchObject({ error: /w+/ });
    if ('comments' in res2) {
      expect(res2.count).toBe(1);
      expect(JSON.stringify(res2.comments[0].details)).toBe(
        JSON.stringify(details)
      );
    }
  });
});

describe('Commont client in a throwErrors mode', () => {
  const commont = Commont('my-project', { throwErrors: true });

  it('returns existing comments from the API', async () => {
    const res1 = await commont.getComments('test');

    expect(res1).not.toMatchObject({ error: /w+/ });

    if ('comments' in res1) {
      expect(res1.count).toBe(3);
      expect(res1.comments.length).toBe(3);
    }
  });

  it('throws an error on a missing topic', async () => {
    try {
      const res1 = await commont.getComments('');
      expect(res1).not.toMatchObject({ count: /d+/ });
      expect(res1).not.toMatchObject({ comments: expect.anything() });
    } catch (err) {
      expect(err).toMatchObject({
        error: 'Missing required parameter',
      });
    }
  });

  it('allows adding new comments', async () => {
    const newComment1 = await commont.addComment('/my-blogpost-2', {
      author: 'me',
      content: 'Hello world!',
    });

    expect(newComment1).not.toMatchObject({ error: /w+/ });

    if ('topic' in newComment1) {
      expect(newComment1).toMatchObject({
        topic: '/my-blogpost-2',
        author: 'me',
        content: 'Hello world!',
        createdAt: expect.any(String),
      });
    }

    const res1 = await commont.getComments('/my-blogpost-2');

    expect(res1).not.toMatchObject({ error: /w+/ });

    if ('comments' in res1) {
      expect(res1.count).toBe(1);
    }
  });

  it('throws an error on a missing topic', async () => {
    try {
      const res1 = await commont.getComments('');
      expect(res1).not.toMatchObject({ count: /d+/ });
      expect(res1).not.toMatchObject({ comments: expect.anything() });
    } catch (err) {
      expect(err).toMatchObject({
        error: 'Missing required parameter',
      });
    }
  });

  it('throws error on an invalid addComment payload', async () => {
    try {
      // @ts-expect-error
      await commont.addComment('/my-blogpost-3', {
        author: 'me',
      });
    } catch (err) {
      expect(err).toMatchObject({
        error: 'Missing required parameter',
      });
    } finally {
      const res1 = await commont.getComments('/my-blogpost-3');
      if ('count' in res1) {
        expect(res1.count).toBe(0);
      }
    }
  });
});

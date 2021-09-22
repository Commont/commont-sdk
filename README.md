# @commont/sdk

![npm](https://img.shields.io/npm/v/@commont/sdk)

## Getting set up

To use [Commont](https://www.commont.app/), you need to create a new account via
our [signup page](https://www.commont.app/signup). You can sign up using an
email and password or by using GitHub or Google. Once you have an account, you
can access the Commont dashboard. Initially, you'll see one default project that
you can configure as you need.

👀 Read the [docs](https://www.commont.app/docs) for more information.

## Installing @commont/sdk

```sh
yarn add @commont/sdk commont # npm install @commont/sdk
```

The package exports a `Commont` function that you can use to initialize the
client.

## Using the Commont client

`Commont` function takes two arguments:

- **projectId** — Your project ID.
- **config** — An optional argument of type `CommontSdkConfig`. You can
  configure whether commont client should return errors or throw errors. By
  default it does the former.

It returns an object with methods `getComments` and `addComment`.

## Example usage

```ts
import { Commont } from '@commont/sdk';

const commont = Commont('my-project');

const res = await commont.getComments('my-blogpost');

if ('error' in res) {
  console.error(res.error);
  return;
}

console.log(res.comments, res.count);

const newComment = await commont.addComment('/my-blogpost', {
  author: 'me',
  content: 'Hello world!',
  details: {
    optionalKey: 'optional value',
  },
});
```

### With `throwErrors: true`

```ts
import { Commont } from '@commont/sdk';

const commont = Commont('my-project', { throwErrors: true });

try {
  const res = await commont.getComments('my-project');
} catch (err) {
  console.error(err);
}
```

## Examples

- [Demo with Vanilla TypeScript](https://codesandbox.io/s/commont-sdk-demo-v3ksq)

## API Reference

### Comment

```ts
export interface Comment {
  author: string;
  content: string;
  topic: string;
  createdAt: string;
  details?: Record<string, any>;
}
```

### GetCommentsOptions

```ts
export interface GetCommentsOptions {
  take?: number;
  skip?: number;
}
```

### GetCommentsResult

```ts
export type GetCommentsResult = {
  comments: Comment[];
  count: number;
};
```

### CommontSdkConfig

```ts
export interface CommontSdkConfig {
  /** @default false */
  throwErrors?: boolean;
}
```

### PossiblyCommontError

```ts
export type PossiblyCommontError<
  TOptions extends CommontSdkConfig
> = TOptions['throwErrors'] extends true ? never : CommontSDKError;
```

### CommontSDKError

```ts
export class CommontSDKError extends Error {
  constructor(public error: string) {
    super(error);
  }
}
```

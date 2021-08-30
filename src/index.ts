export interface Comment {
  author: string;
  content: string;
  topic: string;
  createdAt: string;
}

export class CommontSDKError extends Error {
  constructor(public error: string) {
    super(error);
  }
}

export type PossiblyCommontError<
  TOptions extends CommontSdkConfig
> = TOptions['throwErrors'] extends true ? never : CommontSDKError;

/** @internal */
export interface FetchCommentsAPIPayload {
  projectId: string;
  topic: string;
  take?: number;
  skip?: number;
}

/** @internal */
export type FetchCommentsAPIResponse =
  | {
      comments: Comment[];
      count: number;
    }
  | {
      error: string;
    };

/** @internal */
export interface AddCommentAPIPayload {
  projectId: string;
  topic: string;
  content: string;
  author: string;
}

/** @internal */
export type AddCommentAPIResponse =
  | {
      comment: Comment;
    }
  | {
      error: string;
    };

export interface CommontSdkConfig {
  /** @default false */
  throwErrors?: boolean;
}

export interface GetCommentsOptions {
  take?: number;
  skip?: number;
}

export type GetCommentsResult = {
  comments: Comment[];
  count: number;
};

/**
 * @param projectId Id of your Commont's project
 * @returns an object with methods `getComments` and `addComment`
 */
export function Commont<TConfig extends CommontSdkConfig>(
  projectId: string,
  config: TConfig = {} as TConfig
): {
  getComments: (
    topic: string,
    config?: GetCommentsOptions
  ) => Promise<GetCommentsResult | PossiblyCommontError<TConfig>>;
  addComment: (
    topic: string,
    comment: Pick<Comment, 'content' | 'author'>
  ) => Promise<Comment | PossiblyCommontError<TConfig>>;
} {
  return {
    addComment: async (topic, comment) => {
      const payload: AddCommentAPIPayload = { projectId, topic, ...comment };

      try {
        const response = await fetch(
          `https://www.commont.app/api/add-comment?projectId=${payload.projectId}`,
          {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const responseJson: AddCommentAPIResponse = await response.json();
        if ('error' in responseJson) {
          return panic(responseJson.error, config);
        }

        return responseJson.comment;
      } catch (e) {
        return panic(e.message, config);
      }
    },
    getComments: async (topic, options) => {
      const payload: FetchCommentsAPIPayload = { projectId, topic, ...options };
      const params = new URLSearchParams({
        projectId: payload.projectId,
        topic: payload.topic,
        ...(payload.skip && { skip: payload.skip.toString() }),
        ...(payload.take && { take: payload.take.toString() }),
      }).toString();
      const url = `https://www.commont.app/api/comments?${params}`;

      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const responseJson: FetchCommentsAPIResponse = await response.json();
        if ('error' in responseJson) {
          return panic(responseJson.error, config);
        }

        return responseJson;
      } catch (e) {
        return panic(e.message, config);
      }
    },
  };
}

export default Commont;

const panic = <TConfig extends CommontSdkConfig>(
  error: string,
  { throwErrors = false }: TConfig
): PossiblyCommontError<TConfig> => {
  if (throwErrors) {
    throw new CommontSDKError(error);
  }

  return new CommontSDKError(error) as PossiblyCommontError<TConfig>;
};

import { Commont } from '../dist';

if (!global.fetch) {
  global.fetch = require('node-fetch');
}

const commont = Commont('my-project');

const example = async () => {
  const res = await commont.getComments('demo-sdk');

  if ('error' in res) {
    console.error(res.error);
  } else {
    console.log(res.comments, res.count);
  }

  const res2 = await commont.addComment('/my-blogpost', {
    author: 'me',
    content: 'Hello world!',
  });

  console.log(res2);
};

example();

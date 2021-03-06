# @jujulego/aegis
[![Version](https://img.shields.io/npm/v/@jujulego/aegis)](https://www.npmjs.com/package/@jujulego/aegis)
![Licence](https://img.shields.io/github/license/jujulego/aegis)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=jujulego_aegis&metric=alert_status)](https://sonarcloud.io/dashboard?id=jujulego_aegis)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=jujulego_aegis&metric=coverage)](https://sonarcloud.io/dashboard?id=jujulego_aegis)
[![Bundled size](https://badgen.net/bundlephobia/minzip/@jujulego/aegis)](https://bundlephobia.com/package/@jujulego/aegis)
[![Tree shaking](https://badgen.net/bundlephobia/tree-shaking/@jujulego/aegis)](https://bundlephobia.com/package/@jujulego/aegis)

## Description

## Description
This library aims to optimize async resources (like APIs) fetching and managing.

### The problem
You are implementing a library website, referencing its _books_ and their _authors_.
You make a few reusable components:
- `<Author>` shows given author's name and picture
- `<Book>` shows given book's title and synopsis, also fetch author's data and uses `<Author>` to present them

On the homepage you want to present the **5 most recent books** in the library. You fetch a book list and use
the `<Book>` component to print it. Your application will then send **6 requests**: a first one for the book list and
5 others for authors of each books. **Even if 2 books are from the same author ...**

### Solution
Aegis can detect if a query for a given data is running, and use this query result instead of starting another query.
All you have to do is declare an entity and a fetcher:

```typescript
import { $entity, $store } from '@jujulego/aegis';

interface Author {
  id: string;
  name: string;
  pictureUrl: string;
}

const $Author = $entity('Author', $store.memory(), (author: IAuthor) => author.id)
  .$protocol(({ $item }) => ({
    getById: $item.query(
      (id: string) => fetch(`/authors/${id}`).then(res => res.json()), // fetcher
      (id) => id // id extractor
    )
  }));

const authorBook1 = $Author.getById('author-id');
const authorBook2 = $Author.getById('author-id');
```

Like that even if both authors at the end has the same id, aegis will only send 1 request.

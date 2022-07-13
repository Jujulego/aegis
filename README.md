# Aegis
![Licence](https://img.shields.io/github/license/jujulego/aegis)
![Language](https://img.shields.io/github/languages/top/jujulego/aegis)
[![Publish](https://github.com/Jujulego/aegis/actions/workflows/publish.yml/badge.svg)](https://github.com/Jujulego/aegis/actions/workflows/publish.yml)
[![CodeQL](https://github.com/Jujulego/aegis/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/Jujulego/aegis/actions/workflows/codeql-analysis.yml)

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

## Packages
- [@jujulego/aegis](https://github.com/Jujulego/aegis/tree/master/packages)
- [@jujulego/aegis-api](https://github.com/Jujulego/aegis/tree/master/packages/api)
- [@jujulego/aegis-core](https://github.com/Jujulego/aegis/tree/master/packages/core)
- [@jujulego/aegis-react](https://github.com/Jujulego/aegis/tree/master/packages/react)

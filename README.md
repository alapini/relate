# Relate

[![Bower version](https://badge.fury.io/bo/relate.svg)](http://badge.fury.io/bo/relate)

**Relate** is a tiny client-side relational document store. It's useful for web applications with static data for which there are still relationships — for example, a record label might have a website in which there are artists, albums and songs, all of which relate to each other.

## Dependencies

None! :tada:

## Installation

Install manually: just copy `src/relate.js` wherever you'd like.

Install using Bower:

```
bower install --save relate
```

Load in a browser:

```html
<script src="relate.js"></script>
```

Load using AMD:

```javascript
require(['Relate'], function (Relate) {
  // ...
});
```

## Documentation

### Relate

#### .import(data)

Takes an object and populates the Relate datastore. The root object's properties are used as the collection names; its values are arrays of objects used as collection items. Each item must have an attribute `id` unique within its collection.

```javascript
Relate.import({
  artists: [
    {
      id: 1,
      name: 'Turnover',
      songs: [1, 2]
    }
  ],
  songs: [
    {
      id: 1,
      name: 'Most Of The Time',
      artist: 1
    },
    {
      id: 2,
      name: 'New Scream',
      artist: 1
    }
  ]
});
```

#### .collection(name)

Returns the collection named `name`, or throws an error if it doesn't exist.

```javascript
Relate.collection('artists');
// Relate.Collection {name: "artists", store: Object, transform: function, map: Object, add: function…}
```

#### .collection.create(name[, options])

Creates a collection named `name` and returns it, or throws an error if a collection with that name already exists.

- **transform**: a transformation function executed on each item added to the collection
- **map**: an object mapping properties on the collection's items to other collections

:speech_balloon: Shouldn't need to be called manually, since `Relate.import` will create collections automatically.

```javascript
var Song = function () { /* ... */ };

Relate.collection.create('songs', {
  map: { artist: 'artists' },
  transform: function (item) { return new Artist(item); }
});
// Relate.Collection {name: "songs", store: Object, transform: function, map: Object, add: function…}
```

#### .collection.exists(name)

Returns true if a collection named `name` exists, or false if it doesn't.

```javascript
Relate.collection.exists('artists');
// true
Relate.collection.exists('labels');
// false
```

#### .map

An object containing mappings between item properties and collection names. The keys in `Relate.map` correspond  to collection names. Each property in the collection's map object corresponds to a property on that collection's items, and each value corresponds to the name of the target collection.

```javascript
Relate.map.songs = { artist: 'artists' };
```

#### .mixin(item, collection)

Copies the methods defined in `Item` to `item`, binding `item` and `collection` to each method as `this` and the first argument, respectively. If `Item.prefix` is defined, creates an object with that property on `item` and copies the method there, instead of directly on `item` itself.

:speech_balloon: Shouldn't need to be called manually, since `Collection.add` will mix in `Item` methods automatically.

#### .noConflict()

If it was set on a global object, restores `Relate` to its prior value and returns it.

#### .transform

An object containing transformation functions executed on each item as it's imported into a collection. The properties in `Relate.transform` correspond to collection names. The transformation function receives the item's raw properties as its argument and must return an object to be used as the item.

Transforms must be set before data is imported.

```javascript
var Artist = function () { /* ... */ };

Relate.transform.artists = function (item) { return new Artist(item); };
```

### Collection

#### Collection(name[, options])

Creates a collection named `name` and returns it, or throws an error if a collection with that name already exists.

- **transform**: a transformation function executed on each item added to the collection
- **map**: an object mapping properties on the collection's items to other collections

:bangbang: If a collection is created directly using the constructor, other collections and items will not be able to access it. Use `Relate.collection.create` instead.

#### .add(item)

Given an object `item`, executes the collection's transformation function on it, mixes in the `Item` methods, adds it to the collection and returns it. If an item with the same ID already exists in the collection, throws an error.

:speech_balloon: Shouldn't need to be called manually, since `Collection.import` will iterate over the array of items and add them.

```javascript
Relate.collection('artists').add({
  id: 1,
  name: 'Turnover',
  songs: [1, 2]
});
```

#### .get(query)

If `query` is an ID, returns the corresponding item in the collection. If `query` is an array of IDs, returns an array of the corresponding items in the collection. If `query` is a hash, returns an array of all items in the collection with matching keys and values.

```javascript
Relate.collection('songs').get(1);
// Song {id: 1, name: "Most Of The Time", artist: 1, relate: Object}
Relate.collection('songs').get([1, 2]);
// [Song {id: 1, name: "Most Of The Time"…}, Song {id: 2, name: "New Scream"…}]
Relate.collection('songs').get({ name: 'New Scream' });
// [Song {id: 2, name: "New Scream"…}]
```

#### .import(items)

Takes an array and populates the collection. Each object in the array is used as an item and must have a unique attribute `id`.

:speech_balloon: Shouldn't need to be called manually, since `Relate.import` will import each array of items into a collection automatically.

```javascript
Relate.collection('songs').import([
  {
    id: 1,
    name: 'Most Of The Time',
    artist: 1
  },
  {
    id: 2,
    name: 'New Scream',
    artist: 1
  }
]);
```

#### .key(key)

Returns the collection name mapped to property `key`, if it exists, or returns `key` if it corresponds to an unmapped collection. Otherwise, returns `undefined`.

```javascript
Relate.map.songs = { artist: 'artists' };

Relate.collection('songs').key('artist');
// "artists"
Relate.collection('songs').key('songs');
// "songs"
Relate.collection('songs').key('name');
// undefined
```

#### .mapped(key)

Returns true if a mapping exists in the collection for property `key`, or false if it does not.

```javascript
Relate.map.songs = { artist: 'artists' };

Relate.collection('songs').key('artist');
// true
Relate.collection('songs').key('songs');
// false
```

### Item

#### .get(key)

Given a property `key` that exists on an item, returns either the related item in the corresponding collection or property's value.

```javascript
Relate.collection('songs').get(1).get('name');
// "Most Of The Time"
Relate.collection('songs').get(1).get('artist');
// Artist {id: 1, name: "Turnover", songs: Array[2], relate: Object}
```

#### .prefix

A string used as a namespace for `Item` methods copied to items. Used to prevent conflicts between `Item` methods and properties that already exist in items.

```javascript
Relate.Item.prefix = 'relate';

Relate.collection('songs').get(1).relate.get('artist');
// Artist {id: 1, name: "Turnover", songs: Array[2], relate: Object}
```

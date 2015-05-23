require('./vendor');

var Relate = require('../src/relate.js');
var data = require('./data.js');

var utils = require('./utils.js').create(Relate, data),
    setup = utils.setup,
    teardown = utils.teardown;

describe('Black Box', function () {

  describe('Importing', function () {

    beforeEach(function () {
      setup();
    });

    it('should create collections using the data root keys as names', function () {

      var collections = Object.keys(Relate.collections);

      collections.should.eql(Object.keys(data));
      collections.forEach(function (name) {
        Relate.collections[name].should.be.an.instanceOf(Relate.Collection);
      });
    });
  });

  describe('Item', function () {

    describe('Getters', function () {

      it('should return the related item if one exists', function () {
        setup({}, {
          artists: [
            {
              id: 1,
              name: 'Turnover',
              songs: [1],
            }
          ],
          songs: [
            {
              id: 1,
              name: 'Most Of The Time',
              artists: 1
            }
          ]
        });

        var artist = Relate.collection('songs').get(1).get('artists');

        artist.should.equal(
          Relate.collection('artists').get(
            artist.id
          )
        );
      });

      it('should return an array of related items if more than one exists', function () {
        setup();

        var songs = Relate.collection('artists').get(1).get('songs');

        songs.should.eql(
          Relate.collection('songs').get(
            songs.map(function (song) {
              return song.id;
            })
          )
        );
      });

      it('should use a mapped key if one exists', function () {
        setup({
          map: {
            songs: {artist: 'artists'}
          }
        });

        var artist = Relate.collection('songs').get(1).get('artist');

        artist.should.equal(
          Relate.collection('artists').get(
            artist.id
          )
        );
      });

      it('should allow multiple keys to be mapped to the same collection', function () {
        setup({
          map: {
            songs: {artist: 'artists', composer: 'artists'}
          }
        }, {
          artists: [
            {
              id: 1,
              name: 'Turnover',
              songs: [1],
            }
          ],
          songs: [
            {
              id: 1,
              name: 'Most Of The Time',
              artist: 1,
              composer: 1
            }
          ]
        });

        var song = Relate.collection('songs').get(1);

        song.get('artist').should.equal(
          song.get('composer')
        );
      });

      it('should return the key\'s value if it\'s not a relation', function () {
        setup();

        Relate.collection('songs').get(1).get('title').should.equal('Most Of The Time');
      });

      it('should return the key\'s value if the key is a collection that\'s been mapped elsewhere', function () {
        setup({
          map: {
            songs: {artist: 'artists'}
          }
        });

        var value = 'test',
            song = Relate.collection('songs').get(1);

        song.artists = value;

        song.get('artists').should.equal(value);
      });
    });
  });
});

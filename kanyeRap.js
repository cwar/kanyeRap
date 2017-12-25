/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills
 * nodejs skill development kit.
 * This sample supports multiple lauguages. (en-US, en-GB, de-DE).
 * The Intent Schema, Custom Slots and Sample Utterances for this skill, as well
 * as testing instructions are located at https://github.com/alexa/skill-sample-nodejs-fact
 **/

'use strict';

const Alexa = require('alexa-sdk');
var http = require('http');

const APP_ID = undefined;  // TODO replace with your app ID (OPTIONAL).

const kanye_rest_api_base_url = 'http://www.kanyerest.xyz/api/'

const albums = [
    'graduation',
    'yeezus',
    'the_life_of_pablo',
    'my_beautiful_dark_twisted_fantasy',
    'the_college_dropout',
    'late_registration'
  ];

const handlers = {
   'LaunchRequest': function () {
       this.emit('GetVerse');
   },
   'GetNewVerseIntent': function () {
       this.emit('GetVerse');
   },
    'GetVerse': function () {
        // Get a random album from the album list
        // Use this.t() to get corresponding language data
        const albumIndex = Math.floor(Math.random() * albums.length);
        const randomAlbum = albums[albumIndex];
        
        var url = kanye_rest_api_base_url + 'album/' + randomAlbum;
        http.get(url, (res) => {
            console.log(`res is ${res}`);
          console.log(`STATUS: ${res.statusCode}`);
          console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
          res.resume();
        const speechOutput = randomAlbum;
        
        let data = '';
        
         res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            // var verses = data.split('\\n\\n');
            data = JSON.parse(data);
            console.log(`BODY: ${Object.keys(data.result).length}`);
            var songIndex = Math.floor(Math.random() * Object.keys(data.result).length);
            var songTitle = data.result[songIndex].title;
            console.log(`songTitile is ${songTitle}`);
            var song_url = kanye_rest_api_base_url + 'track/' + songTitle;
            console.log(`song_url is ${song_url}`);
            let song_data = "";
            http.get(song_url, (res2) => {
                res2.on('data', (chunk) => {
                    song_data += chunk;
                })
                
                res2.on('end', () => {
                    // console.log(`song data ${song_data}`);
                    
                    var bad_word_array = process.env.bad_word_list.replace(' ','').split(',');
                    console.log(`bad_word_array is this long: ${bad_word_array.length}`)
                    var song_data_json = JSON.parse(song_data);
                    
                    var verses = JSON.stringify(song_data_json.lyrics).split('\\n\\n');
                    var verseIndex = Math.floor(Math.random() * verses.length);
                    var verse = verses[verseIndex];
                    verse = verse.replace(/\\n/g,' ');
                    verse = verse.replace(/\\r/g,' ');
                    verse = verse.replace('"',' ');
                    verse = verse.replace('?','');
                    verse = verse.replace('(',' ');
                    verse = verse.replace(')',' ');
                    verse = verse.replace("'",' ');
                    verse = verse.toLowerCase();
                    var word_array = verse.split(' ');
                    for (var i = 0; i < bad_word_array.length; i++) {
                        var bad_word = bad_word_array[i];
                        verse = verse.replace(bad_word, ' <say-as interpret-as="expletive">' + bad_word + '</say-as>')
                    }
                    
                    this.emit(':tell', verse);     
                });
            }).on('error', (e) => {
               console.log(`Got error: ${e.message}`);
               
            });
            // console.log(`lyrics is ${Object.prototype.toString.call(lyrics)}`);
            // console.log(`lyrics is ${JSON.stringify(lyrics)}`);
            // var verse = lyrics.split("\\n");
            // console.log(`lyrics is ${lyrics.length}`);
            // console.log(`verse is ${Object.prototype.toString.call(verse)}`);
            // console.log(`verse is ${verse.length}`);
            // console.log(`data is ${Object.prototype.toString.call(JSON.stringify(data))}`);
            // console.log(`verses is ${Object.prototype.toString.call(verses)}`);
            // console.log(`verses length is ${verses.length}`);
            // var verse = verses[2];
            // console.log(`verse is ${verse}`);
            
        });
        
        
        //   context.succeed();
        }).on('error', (e) => {
            console.log(`Got error: ${e.message}`);
        });

        // req.on('error', (e) => {
        //     console.log(`problem with request: ${e.message}`);
        // });
        
        // req.end;
        // Create speech output
    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = this.t('HELP_MESSAGE');
        const reprompt = this.t('HELP_MESSAGE');
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'SessionEndedRequest': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
};

exports.handler = (event, context) => {
    console.log("rappin");
    const alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.resources = albums;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

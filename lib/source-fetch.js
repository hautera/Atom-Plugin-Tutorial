'use babel';

import SourceFetchView from './source-fetch-view';
import { CompositeDisposable } from 'atom';
import request from 'request';
import cheerio from 'cheerio';
import google from 'google';

google.resultsPerPage = 2


export default {

  sourceFetchView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.sourceFetchView = new SourceFetchView(state.sourceFetchViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.sourceFetchView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'source-fetch:fetch': () => this.fetch()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.sourceFetchView.destroy();
  },

  serialize() {
    return {
      sourceFetchViewState: this.sourceFetchView.serialize()
    };
  },

  fetch() {
     let editor
     let self = this
     if (editor = atom.workspace.getActiveTextEditor()) {
        let query = editor.getSelectedText()
        let language = editor.getGrammar().name


        this.search( query, language ).then(( url ) => {
           atom.notifications.addSuccess('Found google results!')
           return this.download( url )
        }).then(( html ) => {
           let answer = this.scrape( html )
           if( answer === "" ){
             atom.notifications.addWarning("No Answer Found :(")
           } else {
             atom.notifications.addSuccess( "Found code snippet!" )
             editor.insertText( answer )
          }
       })
     }
  },

  download( url ){
     return new Promise(( resolve, reject ) => {
        request( url, ( error, response, body ) => {
           if( !error && response.statusCode == 200 ){
             resolve( body )
          } else {
             reject({ reason: 'Unable to download page' })
          }
        })
     })
  },

  scrape( html ){
    y = cheerio.load( html )
    //console.log( html )
     return y( 'div.accepted-answer pre code' ).text()
  },


   search( query, language ){
      return new Promise( ( resolve, reject ) =>  {
         let searchString = `${query} in ${language} site:stackoverflow.com`
         console.log( searchString )
         google( searchString, ( err, res ) => {
            if( err ){
               reject({ reason : "A search error has occured " })
            } else if ( res.links.length === 0 ){
               reject({ reason : "No results found" })
            } else {
               resolve( res.links[ 0 ].href )
            }
         })
      })
   }
};

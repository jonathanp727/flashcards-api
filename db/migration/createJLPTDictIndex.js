import MongoClient from '../../lib/MongoClient';

const createJLPTDictIndex = () => {
  MongoClient.connectToServer((err, db) => {
    // Create ascending index (sparse means the index doesn't include words with no jlpt value)
    db.collection('dictionary').createIndex({ 'jlpt.level': -1, 'jlpt.index': 1 }, { sparse: true }, (err) => {
      if (err) throw err;
      console.log('Finished!');
    });
  });
}

export default createJLPTDictIndex;

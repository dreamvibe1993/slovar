import {useState, useEffect} from 'react';
import axios from './axios';
import Spinner from './Spinner/Spinner'
import './App.css';

function App() {
  const [words, setWords] = useState('')
  const [currentWord, setCurrentWord] = useState(null)
  const [foundWord, setFoundWord] = useState(null);
  const [wordExistenceCheck, setWordExistenceCheck] = useState(true)
  const [modalTrigger, setModalTrigger] = useState(false)
  const [newEntry, setNewEntry] = useState({word: '', translation: ''})
  const [checks, setCheck] = useState({orig: false, trans: false})
  const [warning, setWarning] = useState('')
  const [vocab, setVocab] = useState(false)
  const [thankYou, sayThanks] = useState(false);
  useEffect(() => {
    dataBaseUpdate()
  }, [])
  const dataBaseUpdate = () => {
    axios.get('https://react-my-burger-36d25-default-rtdb.firebaseio.com/fenya.json')
    .then(response => {
      let temp = response.data
      let keyz = Object.keys(temp);
      let arr = keyz.map(i => {
        return {word: temp[i].word, translation: temp[i].translation}
      })
      setWords(arr)
    })
    .catch(error => console.log(error))
  }
  
  const wordSearcher = () => {
    if (currentWord !== null && currentWord != '') {
      let input = currentWord.toLowerCase().replace(/[.,\n\s]/gi, '').toLowerCase()
      let doesTheWordExists = words.find(i => i.word === input)
      if (doesTheWordExists != null) {
        let res = words.filter(i => {
          return i.word === input
        })
        setFoundWord(res)
      } else {
        setFoundWord(null)
        setWordExistenceCheck(false)
      }
    }
  }
  const wordAdder = (event, id) => {
    console.log(newEntry)
    if (id === 'orig') {
      setNewEntry({word: event.target.value, translation: ''})
      setCheck({orig: true, trans: false})
    }
    if (id === 'trans' && newEntry.word != '') {
      setNewEntry({word: newEntry.word, translation: event.target.value})
      setCheck({orig: true, trans: true})
    } 
    if (id === 'trans' && newEntry.word == '') {
      setNewEntry({word: '', translation: event.target.value})
      setCheck({orig: false, trans: true})
    }
  }
  const wordSetter = (event) => {
    event.preventDefault()
    let doesTheWordExists = words.find(i => i.word === newEntry.word)
    if (newEntry.word == '' && newEntry.translation == '') {
      setCheck({orig: false, trans: false})
      setWarning('Мне кажется, что в полях пусто...')
    }
    if (checks.orig === true && checks.trans === true && doesTheWordExists === undefined) {
      axios.post('/fenya.json', newEntry)
      .then(res => setWords(null))
      .then(res => dataBaseUpdate())
      setNewEntry({word: '', translation: ''})
      setCheck({orig: false, trans: false})
      setWarning('')
      sayThanks(!thankYou)
      setModalTrigger(!modalTrigger)
      setTimeout(() => {
        sayThanks(false)
        setModalTrigger(true)
      }, 3000)
    } 
    if (checks.trans !== true) {
      setWarning('Ты забыл указать перевод')
    } 
    if (checks.orig !== true) {
      setWarning('Введи слово на русском сначала')
    }
    console.log(doesTheWordExists)
    if (doesTheWordExists !== undefined) {
      setWarning('Такое слово уже есть')
    }
  }

    let answer = foundWord === null ? null : <div>
    <p>Cлово <strong>"{foundWord[0].word}"</strong></p>
    <p>переводится как: <strong>"{foundWord[0].translation}"</strong></p>
    </div>
    let modal = wordExistenceCheck === true ? null : (
      <div className="modaladding">
        <p>Такого слова ещё нет. Добавить?</p>
      <button onClick={() => setModalTrigger(true)}>Да</button>
      <button onClick={() => {
        setWordExistenceCheck(true)
        setModalTrigger(false)
        }}>Нет</button>
      </div>
    )
    let wordAdding = modalTrigger === true ? (
      <div>
        <p>Добавить слово</p>
        <form>
        <input placeholder='Слово на русском' onChange={(event) => wordAdder(event, 'orig') } required></input>
        <input placeholder='Слово на фене' onChange={(event) => wordAdder(event, 'trans')} required></input>
        <button onClick={wordSetter} type="submit">Добавить</button>
        </form>
        <div>
          {warning}
        </div>
      </div>
    ) : thankYou === true ? (
    <div>
    <h4>Спасибо!</h4> 
    <p>Диалоговое окно закроется через 3 сек.</p>
    </div>
    )
    : null
  return (
    <div className="App">
      <h2>Азабетхи.</h2>
      {words === '' ? <Spinner /> : (
        <div>
          <div>
            <p>Введи слово</p>
            <input onChange={(event) => setCurrentWord(event.target.value)}></input>
            <button onClick={wordSearcher}>Найти</button>
            {modal}
            <div>
              {answer}
            </div>
          </div>
          {wordAdding}
         
          {vocab === true && words !== '' ? (
            <div>
              <h2 className="switchTheVocab" onClick={() => {setVocab(!vocab)}}>Закрыть весь словарь</h2>
              <table>
              <tr><th>Слово</th><th>Перевод</th></tr>
              {words.map(i => {
                return (
                  <tr><td>{i.word}</td><td>{i.translation}</td></tr>
                  )
              })}
            </table> 
          </div>) :  <h2 className="switchTheVocab" onClick={() => {setVocab(!vocab)}}>Открыть весь словарь</h2>}
          </div>
      )}
    </div>
  )
}

export default App;
